"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) serialized.balance = obj.balance.toNumber();
  if (obj.amount)  serialized.amount  = obj.amount.toNumber();
  return serialized;
};

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { transactions: true } } },
    });

    return accounts.map(serializeTransaction);
  } catch (error) {
    console.error("getUserAccounts error:", error.message);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data:  { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance:   balanceFloat,
        userId:    user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // ✅ Parallel queries — 3x faster than sequential
    const [transactions, accounts, budget] = await Promise.all([
      db.transaction.findMany({
        where:   { userId: user.id },
        orderBy: { date: "desc" },
        take:    100, // ✅ Limit to last 100 transactions
      }),
      db.account.findMany({
        where:   { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.budget.findFirst({
        where: { userId: user.id },
      }),
    ]);

    return {
      transactions: transactions.map(serializeTransaction),
      accounts:     accounts.map(serializeTransaction),
      budget:       budget ? serializeTransaction(budget) : null,
    };
  } catch (error) {
    console.error("getDashboardData error:", error.message);
    return { transactions: [], accounts: [], budget: null };
  }
}