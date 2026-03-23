import { db } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Date range helpers
// ─────────────────────────────────────────────────────────────────────────────
export function getReportDateRange(period, date = new Date()) {
  const d = new Date(date);

  if (period === "weekly") {
    const day   = d.getDay(); // 0 = Sunday
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "monthly") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === "yearly") {
    const start = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end   = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  throw new Error(`Unknown period: ${period}`);
}

export function getReportLabel(period, date = new Date()) {
  const d = new Date(date);

  if (period === "weekly") {
    const { start, end } = getReportDateRange("weekly", d);
    const fmt = (dt) =>
      dt.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}, ${d.getFullYear()}`;
  }

  if (period === "monthly") {
    return d.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  }

  if (period === "yearly") {
    return String(d.getFullYear());
  }

  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main report builder
// ─────────────────────────────────────────────────────────────────────────────
export async function getFinancialReport(userId, period = "monthly", date = new Date()) {
  const { start, end } = getReportDateRange(period, date);

  // ── Transactions ───────────────────────────────────────────────────────────
  const transactions = await db.transaction.findMany({
    where:   { userId, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });

  const income  = transactions.filter((t) => t.type === "INCOME");
  const expense = transactions.filter((t) => t.type === "EXPENSE");

  const totalIncome  = income.reduce((s, t)  => s + Number(t.amount), 0);
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0);
  const netBalance   = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0
    ? Math.round((netBalance / totalIncome) * 100)
    : 0;

  // ── Expense categories ─────────────────────────────────────────────────────
  const expenseByCat = expense.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const expenseCategories = Object.entries(expenseByCat)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── Income categories ──────────────────────────────────────────────────────
  const incomeByCat = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const incomeCategories = Object.entries(incomeByCat)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── Top 5 expenses ─────────────────────────────────────────────────────────
  const topExpenses = [...expense]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map((t) => ({
      description: t.description,
      category:    t.category,
      amount:      Number(t.amount),
      date:        t.date,
    }));

  // ── Budget vs actual ───────────────────────────────────────────────────────
  // Only meaningful for monthly (budgets are monthly in this app)
  let budgetComparison = null;

  if (period === "monthly") {
    const budget = await db.budget.findFirst({ where: { userId } });

    if (budget) {
      const budgetAmount   = Number(budget.amount);
      const percentageUsed = budgetAmount > 0
        ? Math.round((totalExpense / budgetAmount) * 100)
        : 0;
      const remaining    = budgetAmount - totalExpense;
      const isExceeded   = totalExpense > budgetAmount;

      budgetComparison = {
        budgetAmount,
        totalExpense,
        remaining,
        percentageUsed,
        isExceeded,
        status: isExceeded
          ? "exceeded"
          : percentageUsed >= 80
          ? "warning"
          : "ok",
      };
    }
  }

  // ── Recurring split ────────────────────────────────────────────────────────
  const recurring    = expense.filter((t) => t.isRecurring);
  const nonRecurring = expense.filter((t) => !t.isRecurring);
  const recurringTotal    = recurring.reduce((s, t) => s + Number(t.amount), 0);
  const nonRecurringTotal = nonRecurring.reduce((s, t) => s + Number(t.amount), 0);

  return {
    period,
    label:     getReportLabel(period, date),
    dateRange: { start, end },
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: transactions.length,
    },
    categories: {
      expense: expenseCategories,
      income:  incomeCategories,
    },
    topExpenses,
    budgetComparison,
    recurring: {
      recurringTotal,
      nonRecurringTotal,
      recurringCount:    recurring.length,
      nonRecurringCount: nonRecurring.length,
      recurringPercentage: totalExpense > 0
        ? Math.round((recurringTotal / totalExpense) * 100)
        : 0,
    },
  };
}