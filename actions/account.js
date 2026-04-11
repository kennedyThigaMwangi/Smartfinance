"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Helper Function: Convert Decimal to Regular Number
// ─────────────────────────────────────────────────────────────────────────────
// Why? Our database stores money as Decimal, but JavaScript needs regular numbers.
// This function converts balance and amount from Decimal to number so they work 
// properly in JavaScript.
const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber(); // Convert balance to number (in KES)
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber(); // Convert amount to number (in KES)
  }
  return serialized;
};

// ─────────────────────────────────────────────────────────────────────────────
// Function 1: Get Account Details with All Transactions
// ─────────────────────────────────────────────────────────────────────────────
// Purpose: Fetch a specific account and all its transactions from the database
// Used when: User clicks on an account to see details
export async function getAccountWithTransactions(accountId) {
  // Step 1: Check if user is logged in
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized"); // Stop if not logged in

  // Step 2: Find the user in our database using their Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // Stop if user not found in database
  if (!user) throw new Error("User not found");

  // Step 3: Find the account that belongs to this user
  const account = await db.account.findUnique({
    where: {
      id: accountId,        // Account ID we're looking for
      userId: user.id,      // Make sure it belongs to logged-in user
    },
    include: {
      transactions: {
        orderBy: { date: "desc" }, // Get transactions, newest first
      },
      _count: {
        select: { transactions: true }, // Count total transactions
      },
    },
  });

  // If account doesn't exist or doesn't belong to user, return nothing
  if (!account) return null;

  // Step 4: Convert decimal numbers to regular numbers and send back
  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Function 2: Delete Multiple Transactions at Once
// ─────────────────────────────────────────────────────────────────────────────
// Purpose: Delete selected transactions and update account balance automatically
// Used when: User selects transactions and clicks "Delete"
export async function bulkDeleteTransactions(transactionIds) {
  try {
    // Step 1: Check if user is logged in
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Step 2: Find the user in database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Step 3: Get the transactions we're about to delete
    // (We need this info to recalculate account balances)
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },        // Only these transaction IDs
        userId: user.id,                   // Only user's own transactions
      },
    });

    // Step 4: Calculate how much to add back to each account
    // Example: If we delete an EXPENSE of 500 KES, we add back 500 KES
    //         If we delete INCOME of 500 KES, we subtract 500 KES
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount            // Add back expense amount
          : -transaction.amount;          // Subtract income amount
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Step 5: Delete transactions AND update balances
    // db.$transaction makes sure both happen together (no errors in between)
    await db.$transaction(async (tx) => {
      // Delete the transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update each account's balance based on deleted transactions
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,    // Add the calculated change
            },
          },
        });
      }
    });

    // Step 6: Refresh the pages so user sees updated data
    revalidatePath("/dashboard");           // Refresh dashboard
    revalidatePath("/account/[id]");        // Refresh account page

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Function 3: Set an Account as the Default Account
// ─────────────────────────────────────────────────────────────────────────────
// Purpose: Mark one account as "default" (used for new transactions by default)
// Used when: User clicks "Set as Default" on an account
export async function updateDefaultAccount(accountId) {
  try {
    // Step 1: Check if user is logged in
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Step 2: Find the user in database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Step 3: Remove "default" status from any account that currently has it
    // (A user can only have ONE default account)
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Step 4: Set the new account as default
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    // Step 5: Refresh dashboard so user sees the change
    revalidatePath("/dashboard");

    // Step 6: Send back the updated account (with converted decimal numbers)
    return { success: true, data: serializeDecimal(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}