import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMonthlyReport } from "@/lib/monthlyReport";
// FIX: import the two named exports that actually exist in template.jsx
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
// 1. Process Recurring Transaction
// ─────────────────────────────────────────────────────────────────────────────
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: { limit: 20, period: "1m", key: "event.data.userId" },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: { id: event.data.transactionId, userId: event.data.userId },
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
// 2. Trigger Recurring Transactions
// ─────────────────────────────────────────────────────────────────────────────
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id:   "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status:      "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        });
      }
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
// 3. Gemini AI Insights
// ─────────────────────────────────────────────────────────────────────────────
async function generateFinancialInsights(report, monthName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { summary, categories, recurring, forecast } = report;

  const categoryLines = (categories?.expense || [])
    .slice(0, 6)
    .map((c) => `${c.category}: ${formatKES(c.amount)} (${c.percentage}%)`)
    .join(", ");

  const prompt = `
You are a personal finance advisor for a Kenyan user.
Give exactly 5 short, actionable insights. All amounts in KES.

${monthName} Summary:
Income: ${formatKES(summary.totalIncome)}
Expenses: ${formatKES(summary.totalExpense)}
Net: ${formatKES(summary.netBalance)}
Savings Rate: ${summary.savingsRate}%
Top Categories: ${categoryLines}
Recurring Costs: ${formatKES(recurring?.recurringExpenseTotal)}
Forecast Next Month: ${forecast?.forecastedExpense ? formatKES(forecast.forecastedExpense) : "N/A"}

Return ONLY a JSON array of 5 strings. No markdown.
["insight1","insight2","insight3","insight4","insight5"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text   = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error("Bad format");
  } catch {
    const top = categories?.expense?.[0];
    return [
      summary.savingsRate >= 20
        ? `✅ You saved ${formatKES(summary.netBalance)} (${summary.savingsRate}%) in ${monthName}. Excellent!`
        : `⚠️ Savings rate is ${summary.savingsRate}%. Try to reach 20% next month.`,
      top
        ? `📊 "${top.category}" was your biggest spend at ${formatKES(top.amount)} (${top.percentage}%).`
        : "📊 Categorise your expenses to spot where your money goes.",
      recurring?.recurringExpenseTotal > 0
        ? `🔄 ${formatKES(recurring.recurringExpenseTotal)} goes to fixed/recurring costs every month.`
        : "🔄 Track your subscriptions and recurring bills to avoid surprises.",
      forecast?.forecastedExpense
        ? `🔮 You're on track to spend around ${formatKES(forecast.forecastedExpense)} next month.`
        : "🔮 Keep tracking to unlock AI spending forecasts.",
      "💡 Set category budgets in SmartFinance to get alerted before you overspend.",
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Monthly Report Generation
// ─────────────────────────────────────────────────────────────────────────────
export const generateMonthlyReports = inngest.createFunction(
  {
    id:   "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({ include: { accounts: true } });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const now       = new Date();
        const year      = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const month     = now.getMonth() === 0 ? 12 : now.getMonth();
        const monthName = new Date(year, month - 1, 1).toLocaleString("en-KE", {
          month: "long",
        });

        const report   = await getMonthlyReport(user.id, year, month);
        const insights = await generateFinancialInsights(report, monthName);

        await sendEmail({
          to:      user.email,
          subject: `📊 Your ${monthName} ${year} Financial Report — SmartFinance`,
          react:   MonthlyReportEmail({
            userName: user.name || user.email.split("@")[0],
            monthName,
            year,
            report,
            insights,
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Budget Alerts
//
// ⚠️  WARNING  (80–99%)  → BudgetWarningEmail — sent ONCE per month
// 🚨  EXCEEDED (100%+)   → BudgetExceededEmail — sent every 6 hours
// ─────────────────────────────────────────────────────────────────────────────
export const checkBudgetAlerts = inngest.createFunction(
  {
    id:   "check-budget-alerts",
    name: "Check Budget Alerts",
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: { where: { isDefault: true } },
            },
          },
        },
      });
    });

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

        const remaining = budgetAmount - totalExpenses; // negative when exceeded
        const userName  = budget.user.name || budget.user.email.split("@")[0];

        // ── 🚨 EXCEEDED (100%+) ──────────────────────────────────────────
        if (percentageUsed >= 100) {
          const overspentBy = Math.abs(remaining);

          await sendEmail({
            to:      budget.user.email,
            subject: `🚨 BUDGET EXCEEDED — ${defaultAccount.name} at ${percentageUsed.toFixed(0)}% | Overspent by ${formatKES(overspentBy)}`,
            react:   BudgetExceededEmail({
              userName,
              percentageUsed: percentageUsed.toFixed(1),
              budgetAmount,
              totalExpenses,
              overspentBy,                 // prop name matches BudgetExceededEmail exactly
              accountName: defaultAccount.name,
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data:  { lastAlertSent: new Date() },
          });

          return;
        }

        // ── ⚠️ WARNING (80–99%) ──────────────────────────────────────────
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
              remaining:   Math.max(remaining, 0), // prop name matches BudgetWarningEmail exactly
              accountName: defaultAccount.name,
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data:  { lastAlertSent: new Date() },
          });
        }

        // Below 80% — do nothing
      });
    }

    return { processed: budgets.length };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth()    !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  return new Date(transaction.nextRecurringDate) <= new Date();
}

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