"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getFinancialReport } from "@/lib/reports";
import { sendEmail } from "@/actions/send-email";
import { MonthlyReportEmail } from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
// Helper: get the DB user record from the Clerk session
// Clerk gives us a clerkUserId (e.g. "user_2abc123")
// Our DB stores users with clerkUserId as the foreign key
// ─────────────────────────────────────────────────────────────────────────────
async function getDBUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Not authenticated");

  const user = await db.user.findUnique({
    where: { clerkUserId },   // ← matches your Prisma schema field name
  });

  if (!user) throw new Error("User not found in database");
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI insights
// ─────────────────────────────────────────────────────────────────────────────
export async function generateInsights(report) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { summary, categories, budgetComparison } = report;

  const topCats = (categories?.expense || [])
    .slice(0, 5)
    .map((c) => `${c.category}: ${formatKES(c.amount)} (${c.percentage}%)`)
    .join(", ");

  const budgetLine = budgetComparison
    ? `Budget: ${formatKES(budgetComparison.budgetAmount)}, Spent: ${formatKES(budgetComparison.totalExpense)}, Status: ${budgetComparison.status}`
    : "No budget set";

  const prompt = `
You are a personal finance advisor for a Kenyan user.
Give exactly 5 short, specific, actionable insights based on this ${report.period} report.
All amounts in KES. Be direct and practical.

Period: ${report.label}
Income: ${formatKES(summary.totalIncome)}
Expenses: ${formatKES(summary.totalExpense)}
Net Balance: ${formatKES(summary.netBalance)}
Savings Rate: ${summary.savingsRate}%
Top Expense Categories: ${topCats}
Budget Status: ${budgetLine}

Return ONLY a JSON array of 5 strings. No markdown, no preamble.
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
        ? `✅ Great discipline — you saved ${summary.savingsRate}% of your income this period.`
        : `⚠️ Your savings rate is ${summary.savingsRate}%. Aim for at least 20% by trimming discretionary spending.`,
      top
        ? `📊 "${top.category}" consumed the most at ${formatKES(top.amount)} (${top.percentage}% of expenses).`
        : "📊 Start categorising transactions to identify your biggest spending areas.",
      budgetComparison?.isExceeded
        ? `🚨 You exceeded your budget by ${formatKES(Math.abs(budgetComparison.remaining))}. Review your top categories immediately.`
        : budgetComparison
        ? `✅ You are within budget with ${formatKES(Math.max(budgetComparison.remaining, 0))} remaining.`
        : "💡 Set a monthly budget in SmartFinance to track your spending limits.",
      summary.netBalance > 0
        ? `💰 You have a net surplus of ${formatKES(summary.netBalance)}. Consider moving some to savings or investments.`
        : `⚠️ You spent ${formatKES(Math.abs(summary.netBalance))} more than you earned. Review non-essential expenses.`,
      "🔮 Track consistently every month to unlock spending forecasts and trend analysis.",
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// On-demand: fetch report data for the dashboard UI
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchReportData(period = "monthly") {
  // FIX: resolve the real DB user id from the Clerk session
  const user = await getDBUser();

  const report   = await getFinancialReport(user.id, period);
  const insights = await generateInsights(report);

  return { report, insights };
}

// ─────────────────────────────────────────────────────────────────────────────
// On-demand: email the report
// ─────────────────────────────────────────────────────────────────────────────
export async function emailReportOnDemand(period = "monthly") {
  const user = await getDBUser();

  const report    = await getFinancialReport(user.id, period);
  const insights  = await generateInsights(report);
  const userName  = user.name || user.email.split("@")[0];
  const periodLabel = { weekly: "Weekly", monthly: "Monthly", yearly: "Annual" }[period] || "Financial";

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

  return { success: true, email: user.email };
}