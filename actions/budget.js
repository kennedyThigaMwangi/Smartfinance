"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const currentDate  = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // ✅ Parallel — fetch budget + expenses at same time
    const [budget, expenses] = await Promise.all([
      db.budget.findFirst({
        where: { userId: user.id },
      }),
      db.transaction.aggregate({
        where: {
          userId:    user.id,
          accountId,
          type:      "EXPENSE",
          date:      { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentExpenses = expenses._sum.amount
      ? expenses._sum.amount.toNumber()
      : 0;

    const budgetAmount = budget ? budget.amount.toNumber() : 0;

    // ✅ Trigger Inngest alert automatically if budget exceeded
    if (budget && currentExpenses >= budgetAmount) {
      try {
        const { inngest } = await import("@/lib/inngest/client");
        await inngest.send({
          name: "budget/check-alerts",
          data: { userId: user.id, accountId },
        });
      } catch (e) {
        // Inngest not running — silent fail in dev
      }
    }

    return {
      budget:          budget ? { ...budget, amount: budgetAmount } : null,
      currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.upsert({
      where:  { userId: user.id },
      update: { amount },
      create: { userId: user.id, amount },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}