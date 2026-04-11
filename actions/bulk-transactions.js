"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Save multiple parsed transactions (from M-Pesa SMS or CSV)
 * Prevents duplicates using receipt numbers
 * Automatically updates account balances
 */
export async function bulkCreateTransactions(transactions) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { count: 0, skipped: 0, errors: [] };
  }

  const errors = [];
  let skipped = 0;

  // Check for duplicates - skip receipts we already imported
  const incomingReceipts = transactions
    .map((t) => t.receiptNo)
    .filter(Boolean);

  const existing = await db.transaction.findMany({
    where: {
      userId: user.id,
      receiptNo: { in: incomingReceipts },
    },
    select: { receiptNo: true },
  });

  const existingSet = new Set(existing.map((t) => t.receiptNo));

  // Validate and prepare transactions
  const rows = [];

  for (const t of transactions) {
    try {
      if (t.receiptNo && existingSet.has(t.receiptNo)) {
        skipped++;
        continue;
      }

      // Verify account belongs to this user
      const account = await db.account.findFirst({
        where: { id: t.accountId, userId: user.id },
      });
      if (!account) {
        errors.push(`Account not found for: ${t.description}`);
        skipped++;
        continue;
      }

      rows.push({
        type: t.type,
        amount: t.amount,
        date: new Date(t.date),
        description: t.description || "",
        accountId: t.accountId,
        categoryId: t.categoryId || null,
        receiptNo: t.receiptNo || null,
        userId: user.id,
        isRecurring: false,
        source: "MPESA_IMPORT",
      });
    } catch (err) {
      errors.push(`Row error: ${err.message}`);
    }
  }

  if (rows.length === 0) {
    return { count: 0, skipped, errors };
  }

  // Insert all transactions and update account balances
  await db.$transaction(async (tx) => {
    await tx.transaction.createMany({ data: rows });

    const accountIds = [...new Set(rows.map((r) => r.accountId))];

    for (const accountId of accountIds) {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) continue;

      const income = rows
        .filter((r) => r.accountId === accountId && r.type === "INCOME")
        .reduce((s, r) => s + r.amount, 0);

      const expense = rows
        .filter((r) => r.accountId === accountId && r.type === "EXPENSE")
        .reduce((s, r) => s + r.amount, 0);

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: income - expense } },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/transaction");
  revalidatePath("/account");

  return { count: rows.length, skipped, errors };
}