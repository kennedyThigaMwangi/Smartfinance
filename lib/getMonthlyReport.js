import { db } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

const r2 = (n) => Math.round(n * 100) / 100;

const sumAmount = (list) =>
  r2(list.reduce((sum, t) => sum + Number(t.amount), 0));

const groupSum = (list, keyFn) =>
  list.reduce((acc, t) => {
    const key = keyFn(t);
    acc[key] = r2((acc[key] ?? 0) + Number(t.amount));
    return acc;
  }, {});

const pct = (part, whole) => (whole > 0 ? r2((part / whole) * 100) : 0);

const momChange = (current, previous) =>
  previous > 0 ? r2(((current - previous) / previous) * 100) : null;

const direction = (change) =>
  change === null ? "no-data" : change >= 0 ? "up" : "down";

// ─────────────────────────────────────────────────────────────────────────────
// getMonthlyReport
//
// A full financial snapshot for a given user / year / month.
//
// What it returns:
//   meta              – report metadata & period info
//   summary           – income, expense, net, savings rate, transaction count
//   comparison        – month-over-month % change for income & expense
//   categories        – per-category breakdown with percentage share
//   recurring         – recurring vs one-off split
//   dailyTrend        – day-by-day income / expense / cumulative balance
//   weekdayAverages   – spending behaviour by day-of-week
//   topExpenses       – top 5 largest expense transactions
//   accountSummary    – income / expense / net grouped per account
//   forecast          – 3-month rolling average prediction for next month
//   spendingAlerts    – categories with unusually high spend (>150% of avg)
//   transactions      – raw transaction list
// ─────────────────────────────────────────────────────────────────────────────

export async function getMonthlyReport(userId, year, month) {
  // ── 1. Date boundaries ────────────────────────────────────────────────────
  const startDate    = new Date(year, month - 1, 1);
  const endDate      = new Date(year, month, 0, 23, 59, 59);

  const prevStart    = new Date(year, month - 2, 1);
  const prevEnd      = new Date(year, month - 1, 0, 23, 59, 59);

  const rollingStart = new Date(year, month - 4, 1);   // 3 months back
  const rollingEnd   = new Date(year, month - 1, 0, 23, 59, 59);

  // ── 2. Parallel DB queries ────────────────────────────────────────────────
  const [transactions, prevTransactions, rollingTransactions] =
    await Promise.all([
      // Current month
      db.transaction.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
      // Previous month — for MoM comparison
      db.transaction.findMany({
        where: { userId, date: { gte: prevStart, lte: prevEnd } },
      }),
      // Last 3 months of expenses — for forecast & spike detection
      db.transaction.findMany({
        where: {
          userId,
          date: { gte: rollingStart, lte: rollingEnd },
          type: "expense",
        },
      }),
    ]);

  // ── 3. Split current month by type ───────────────────────────────────────
  const incomeList  = transactions.filter((t) => t.type === "income");
  const expenseList = transactions.filter((t) => t.type === "expense");

  const totalIncome  = sumAmount(incomeList);
  const totalExpense = sumAmount(expenseList);
  const netBalance   = r2(totalIncome - totalExpense);
  const savingsRate  = pct(Math.max(netBalance, 0), totalIncome);

  // ── 4. Previous month totals ──────────────────────────────────────────────
  const prevIncome  = sumAmount(prevTransactions.filter((t) => t.type === "income"));
  const prevExpense = sumAmount(prevTransactions.filter((t) => t.type === "expense"));

  // ── 5. Category breakdown builder ────────────────────────────────────────
  const buildCategoryList = (list, total) =>
    Object.entries(groupSum(list, (t) => t.category || "Uncategorised"))
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: pct(amount, total),
      }));

  // ── 6. Daily trend with running cumulative balance ────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  let runningBalance = 0;

  const dailyTrend = Array.from({ length: daysInMonth }, (_, i) => {
    const day        = i + 1;
    const dayIncome  = sumAmount(incomeList.filter((t) => new Date(t.date).getDate() === day));
    const dayExpense = sumAmount(expenseList.filter((t) => new Date(t.date).getDate() === day));
    runningBalance   = r2(runningBalance + dayIncome - dayExpense);

    return {
      day,
      date:              new Date(year, month - 1, day).toISOString().split("T")[0],
      income:            dayIncome,
      expense:           dayExpense,
      net:               r2(dayIncome - dayExpense),
      cumulativeBalance: runningBalance,
    };
  });

  // ── 7. Day-of-week spending behaviour ────────────────────────────────────
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekdayTotals = groupSum(
    expenseList,
    (t) => DAY_NAMES[new Date(t.date).getDay()]
  );
  const weekdayCounts = expenseList.reduce((acc, t) => {
    const d = DAY_NAMES[new Date(t.date).getDay()];
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  const weekdayAverages = Object.entries(weekdayTotals).map(([day, total]) => ({
    day,
    totalSpent:        r2(total),
    transactionCount:  weekdayCounts[day] ?? 0,
    avgPerTransaction: r2(total / (weekdayCounts[day] ?? 1)),
  }));

  // ── 8. Top 5 expenses ─────────────────────────────────────────────────────
  const topExpenses = [...expenseList]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map((t) => ({
      id:          t.id,
      description: t.description,
      amount:      r2(Number(t.amount)),
      category:    t.category || "Uncategorised",
      date:        new Date(t.date).toISOString().split("T")[0],
      accountId:   t.accountId,
      isRecurring: t.isRecurring ?? false,
    }));

  // ── 9. Recurring vs one-off split ────────────────────────────────────────
  const recurringExpenses = expenseList.filter((t) => t.isRecurring);
  const oneOffExpenses    = expenseList.filter((t) => !t.isRecurring);
  const recurringTotal    = sumAmount(recurringExpenses);
  const oneOffTotal       = sumAmount(oneOffExpenses);

  // ── 10. Per-account summary ───────────────────────────────────────────────
  const accountMap = {};
  for (const t of transactions) {
    const id = t.accountId ?? "unknown";
    accountMap[id] ??= { accountId: id, income: 0, expense: 0, transactionCount: 0 };
    if (t.type === "income")  accountMap[id].income  += Number(t.amount);
    if (t.type === "expense") accountMap[id].expense += Number(t.amount);
    accountMap[id].transactionCount += 1;
  }

  const accountSummary = Object.values(accountMap).map((a) => ({
    accountId:        a.accountId,
    income:           r2(a.income),
    expense:          r2(a.expense),
    net:              r2(a.income - a.expense),
    transactionCount: a.transactionCount,
  }));

  // ── 11. 3-month rolling forecast ─────────────────────────────────────────
  const monthBuckets = {};
  for (const t of rollingTransactions) {
    const d   = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthBuckets[key] = r2((monthBuckets[key] ?? 0) + Number(t.amount));
  }

  const bucketValues      = Object.values(monthBuckets);
  const forecastedExpense =
    bucketValues.length > 0
      ? r2(bucketValues.reduce((s, v) => s + v, 0) / bucketValues.length)
      : null;

  const forecastConfidence =
    bucketValues.length >= 3 ? "high"
    : bucketValues.length === 2 ? "medium"
    : bucketValues.length === 1 ? "low"
    : "insufficient-data";

  // ── 12. Spending spike alerts ─────────────────────────────────────────────
  const rollingCategoryTotals = groupSum(
    rollingTransactions,
    (t) => t.category || "Uncategorised"
  );

  const rollingCategoryAvg = Object.fromEntries(
    Object.entries(rollingCategoryTotals).map(([cat, total]) => [
      cat,
      r2(total / Math.max(bucketValues.length, 1)),
    ])
  );

  const expenseCategoryList = buildCategoryList(expenseList, totalExpense);

  const spendingAlerts = expenseCategoryList
    .filter(({ category, amount }) => {
      const avg = rollingCategoryAvg[category];
      return avg && amount > avg * 1.5;
    })
    .map(({ category, amount }) => ({
      category,
      currentSpend:   amount,
      historicalAvg:  rollingCategoryAvg[category],
      overagePercent: pct(
        amount - rollingCategoryAvg[category],
        rollingCategoryAvg[category]
      ),
      severity: amount > rollingCategoryAvg[category] * 2 ? "high" : "medium",
    }));

  // ── 13. Assemble final report ─────────────────────────────────────────────
  return {
    meta: {
      userId,
      year,
      month,
      monthName:         new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" }),
      generatedAt:       new Date().toISOString(),
      totalTransactions: transactions.length,
    },

    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,              // % of income saved (0 when net is negative)
      transactionCount: transactions.length,
    },

    comparison: {
      prevMonthIncome:      prevIncome,
      prevMonthExpense:     prevExpense,
      incomeChangePercent:  momChange(totalIncome, prevIncome),
      expenseChangePercent: momChange(totalExpense, prevExpense),
      incomeDirection:      direction(momChange(totalIncome, prevIncome)),
      expenseDirection:     direction(momChange(totalExpense, prevExpense)),
    },

    categories: {
      expense: expenseCategoryList,
      income:  buildCategoryList(incomeList, totalIncome),
    },

    recurring: {
      recurringExpenseTotal: recurringTotal,
      oneOffExpenseTotal:    oneOffTotal,
      recurringCount:        recurringExpenses.length,
      oneOffCount:           oneOffExpenses.length,
      recurringPercentage:   pct(recurringTotal, totalExpense),
    },

    dailyTrend,                                        // plug into a line/bar chart

    weekdayAverages,                                   // behavioural spend by weekday

    topExpenses,                                       // 5 biggest single expenses

    accountSummary,                                    // per-account income/expense/net

    forecast: {
      forecastedExpense,                               // expected spend next month
      forecastedNet:
        forecastedExpense !== null
          ? r2(totalIncome - forecastedExpense)
          : null,
      basedOnMonths: bucketValues.length,
      confidence:    forecastConfidence,               // "high" | "medium" | "low"
    },

    spendingAlerts,                                    // categories spending >150% of avg

    transactions,                                      // raw list for tables / exports
  };
}