import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import { getFinancialReport } from "@/lib/reports";
import { generateInsights } from "@/actions/generate-report";
import {
  MonthlyReportEmail,
  BudgetWarningEmail,
  BudgetExceededEmail,
} from "@/emails/template";

// ─────────────────────────────────────────────────────────────────────────────
// KES formatter
// ─────────────────────────────────────────────────────────────────────────────
const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style:                 "currency",
    currency:              "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

// ─────────────────────────────────────────────────────────────────────────────
// Shared: build + send a report email for one user
// ─────────────────────────────────────────────────────────────────────────────
async function sendReportEmail(user, period) {
  const report   = await getFinancialReport(user.id, period);
  const insights = await generateInsights(report);
  const userName = user.name || user.email.split("@")[0];

  const periodLabel = { weekly: "Weekly", monthly: "Monthly", yearly: "Annual" }[period];

  await sendEmail({
    to:      user.email,
    subject: `📊 Your ${report.label} ${periodLabel} Report — SmartFinance`,
    react:   MonthlyReportEmail({
      userName,
      monthName: report.label,
      year:      new Date().getFullYear(),
      report: {
        summary:     report.summary,
        categories:  report.categories,
        topExpenses: report.topExpenses,
        recurring: {
          recurringExpenseTotal: report.recurring.recurringTotal,
          recurringPercentage:   report.recurring.recurringPercentage,
          recurringCount:        report.recurring.recurringCount,
          oneOffExpenseTotal:    report.recurring.nonRecurringTotal,
          oneOffCount:           report.recurring.nonRecurringCount,
        },
        comparison:     {},
        forecast:       {},
        spendingAlerts: [],
      },
      insights,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Process Recurring Transaction
// ─────────────────────────────────────────────────────────────────────────────
export const processRecurringTransaction = inngest.createFunction(
  {
    id:       "process-recurring-transaction",
    name:     "Process Recurring Transaction",
    throttle: { limit: 20, period: "1m", key: "event.data.userId" },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where:   { id: event.data.transactionId, userId: event.data.userId },
        include: { account: true },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type:        transaction.type,
            amount:      transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date:        new Date(),
            category:    transaction.category,
            userId:      transaction.userId,
            accountId:   transaction.accountId,
            isRecurring: false,
          },
        });

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -Number(transaction.amount)
            : Number(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data:  { balance: { increment: balanceChange } },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed:     new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Trigger Recurring Transactions (daily cron — midnight every day)
// ─────────────────────────────────────────────────────────────────────────────
export const triggerRecurringTransactions = inngest.createFunction(
  { id: "trigger-recurring-transactions", name: "Trigger Recurring Transactions" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () =>
        db.transaction.findMany({
          where: {
            isRecurring: true,
            status:      "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        })
    );

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((t) => ({
        name: "transaction.recurring.process",
        data: { transactionId: t.id, userId: t.userId },
      }));
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Weekly Reports — every Monday at 8 AM
// ─────────────────────────────────────────────────────────────────────────────
export const generateWeeklyReports = inngest.createFunction(
  { id: "generate-weekly-reports", name: "Generate Weekly Reports" },
  { cron: "0 8 * * 1" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () =>
      db.user.findMany({ include: { accounts: true } })
    );

    for (const user of users) {
      await step.run(`weekly-report-${user.id}`, async () => {
        await sendReportEmail(user, "weekly");
      });
    }

    return { processed: users.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Monthly Reports — 1st of every month at midnight
// ─────────────────────────────────────────────────────────────────────────────
export const generateMonthlyReports = inngest.createFunction(
  { id: "generate-monthly-reports", name: "Generate Monthly Reports" },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () =>
      db.user.findMany({ include: { accounts: true } })
    );

    for (const user of users) {
      await step.run(`monthly-report-${user.id}`, async () => {
        await sendReportEmail(user, "monthly");
      });
    }

    return { processed: users.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Yearly Reports — January 1st at 8 AM
// ─────────────────────────────────────────────────────────────────────────────
export const generateYearlyReports = inngest.createFunction(
  { id: "generate-yearly-reports", name: "Generate Yearly Reports" },
  { cron: "0 8 1 1 *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () =>
      db.user.findMany({ include: { accounts: true } })
    );

    for (const user of users) {
      await step.run(`yearly-report-${user.id}`, async () => {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        const report   = await getFinancialReport(user.id, "yearly", lastYear);
        const insights = await generateInsights(report);
        const userName = user.name || user.email.split("@")[0];

        await sendEmail({
          to:      user.email,
          subject: `📊 Your ${lastYear.getFullYear()} Annual Financial Report — SmartFinance`,
          react:   MonthlyReportEmail({
            userName,
            monthName: `${lastYear.getFullYear()} Annual`,
            year:      lastYear.getFullYear(),
            report: {
              summary:     report.summary,
              categories:  report.categories,
              topExpenses: report.topExpenses,
              recurring: {
                recurringExpenseTotal: report.recurring.recurringTotal,
                recurringPercentage:   report.recurring.recurringPercentage,
                recurringCount:        report.recurring.recurringCount,
                oneOffExpenseTotal:    report.recurring.nonRecurringTotal,
                oneOffCount:           report.recurring.nonRecurringCount,
              },
              comparison:     {},
              forecast:       {},
              spendingAlerts: [],
            },
            insights,
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Budget Alerts (every 6 hours)
// ─────────────────────────────────────────────────────────────────────────────
export const checkBudgetAlerts = inngest.createFunction(
  { id: "check-budget-alerts", name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () =>
      db.budget.findMany({
        include: {
          user: {
            include: { accounts: { where: { isDefault: true } } },
          },
        },
      })
    );

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await db.transaction.aggregate({
          where: {
            userId:    budget.userId,
            accountId: defaultAccount.id,
            type:      "EXPENSE",
            date:      { gte: startOfMonth },
          },
          _sum: { amount: true },
        });

        const totalExpenses  = Number(result._sum.amount) || 0;
        const budgetAmount   = Number(budget.amount);
        const percentageUsed = budgetAmount > 0
          ? (totalExpenses / budgetAmount) * 100
          : 0;

        const remaining = budgetAmount - totalExpenses;
        const userName  = budget.user.name || budget.user.email.split("@")[0];

        // ── 🚨 EXCEEDED (100%+) ─────────────────────────────────────────────
        if (percentageUsed >= 100) {
          const overspentBy = Math.abs(remaining);
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

          if (
            budget.lastAlertSent &&
            new Date(budget.lastAlertSent) > sixHoursAgo
          ) {
            return;
          }

          await sendEmail({
            to:      budget.user.email,
            subject: `🚨 BUDGET EXCEEDED — ${defaultAccount.name} at ${percentageUsed.toFixed(0)}% | Overspent by ${formatKES(overspentBy)}`,
            react:   BudgetExceededEmail({
              userName,
              percentageUsed: percentageUsed.toFixed(1),
              budgetAmount,
              totalExpenses,
              overspentBy,
              accountName: defaultAccount.name,
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data:  { lastAlertSent: new Date() },
          });
          return;
        }

        // ── ⚠️ WARNING (80–99%) ─────────────────────────────────────────────
        if (percentageUsed >= 80) {
          const alreadySentThisMonth =
            budget.lastAlertSent &&
            !isNewMonth(new Date(budget.lastAlertSent), new Date());

          if (alreadySentThisMonth) return;

          await sendEmail({
            to:      budget.user.email,
            subject: `⚠️ Budget Warning — ${defaultAccount.name} is at ${percentageUsed.toFixed(0)}% | ${formatKES(Math.max(remaining, 0))} remaining`,
            react:   BudgetWarningEmail({
              userName,
              percentageUsed: percentageUsed.toFixed(1),
              budgetAmount,
              totalExpenses,
              remaining:   Math.max(remaining, 0),
              accountName: defaultAccount.name,
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data:  { lastAlertSent: new Date() },
          });
        }
      });
    }

    return { processed: budgets.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the two dates fall in different calendar months */
function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth()    !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

/** Returns true when a recurring transaction is due to be processed */
function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  return new Date(transaction.nextRecurringDate) <= new Date();
}

/** Advance a date by one recurring interval */
function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":   next.setDate(next.getDate() + 1);         break;
    case "WEEKLY":  next.setDate(next.getDate() + 7);         break;
    case "MONTHLY": next.setMonth(next.getMonth() + 1);       break;
    case "YEARLY":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}