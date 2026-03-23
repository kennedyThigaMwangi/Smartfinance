import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Hr,
  Link,
  Preview,
} from "@react-email/components";
import * as React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// KES formatter
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style:                 "currency",
    currency:              "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const r2 = (n) => Math.round(Number(n) * 100) / 100;

// ─────────────────────────────────────────────────────────────────────────────
// Category emojis
// ─────────────────────────────────────────────────────────────────────────────
const CAT_EMOJI = {
  food: "🍔", groceries: "🛒", utilities: "💡", entertainment: "🎬",
  shopping: "🛍️", education: "📚", housing: "🏠", healthcare: "🏥",
  transportation: "🚗", travel: "✈️", salary: "💼", freelance: "💻",
  investment: "📈", savings: "🏦", insurance: "🛡️", subscriptions: "🔄",
  dining: "🍽️", fuel: "⛽", mpesa: "📱", rent: "🏘️",
};
const emoji = (cat) => CAT_EMOJI[cat?.toLowerCase()] || "💰";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://smartfinance.io";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  body:        { backgroundColor: "#f1f5f9", fontFamily: "'Helvetica Neue', Arial, sans-serif", margin: 0, padding: 0 },
  outer:       { maxWidth: "620px", margin: "32px auto", padding: "0 16px" },
  card:        { backgroundColor: "#ffffff", padding: "28px 40px" },
  cardLast:    { backgroundColor: "#ffffff", padding: "24px 40px 36px" },
  hr:          { border: "none", borderTop: "1px solid #f3f4f6", margin: 0 },
  summCard:    { borderRadius: "12px", padding: "16px 14px", textAlign: "center" },
  summLabel:   { fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 },
  summValue:   { fontSize: "18px", fontWeight: 800, margin: "5px 0 0", letterSpacing: "-0.5px" },
  summMeta:    { fontSize: "11px", color: "#6b7280", margin: "3px 0 0" },
  secTitle:    { fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 3px" },
  secSub:      { fontSize: "12px", color: "#9ca3af", margin: "0 0 14px" },
  insight:     { padding: "9px 0", fontSize: "13.5px", color: "#374151", lineHeight: "1.65", margin: 0 },
  th:          { padding: "9px 12px", fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid #f3f4f6" },
  td:          { padding: "9px 12px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
  tdAmt:       { padding: "9px 12px", fontSize: "13px", fontWeight: 700, color: "#dc2626", textAlign: "right", borderBottom: "1px solid #f3f4f6" },
  footer:      { background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: "0 0 16px 16px", padding: "24px 40px", textAlign: "center" },
  footerBrand: { fontSize: "16px", fontWeight: 800, color: "#c7d2fe", margin: "0 0 6px" },
  footerText:  { fontSize: "12px", color: "rgba(199,210,254,0.6)", lineHeight: "1.7", margin: 0 },
  footerLink:  { color: "rgba(199,210,254,0.5)", textDecoration: "underline" },
  ctaBtn:      { display: "inline-block", padding: "14px 38px", color: "#ffffff", fontSize: "14px", fontWeight: 700, textDecoration: "none", borderRadius: "12px" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared Footer component
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <Section style={s.footer}>
      <Text style={s.footerBrand}>SmartFinance</Text>
      <Text style={s.footerText}>
        AI-Powered Financial Management · Made with ❤️ in Nairobi, Kenya
        <br />
        <Link href="#" style={s.footerLink}>Unsubscribe</Link>
        &nbsp;·&nbsp;
        <Link href={`${APP_URL}/settings`} style={s.footerLink}>Manage Preferences</Link>
      </Text>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  BudgetWarningEmail  (80–99%)
//     Amber/orange — sent once per month when budget first crosses 80%
// ─────────────────────────────────────────────────────────────────────────────
export function BudgetWarningEmail({
  userName,
  percentageUsed,
  budgetAmount,
  totalExpenses,
  remaining,
  accountName,
}) {
  const pct      = Number(percentageUsed);
  const barColor = pct >= 90 ? "#ef4444" : "#f59e0b";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        ⚠️ {accountName} budget is at {pct.toFixed(0)}% — {fmt(remaining)} remaining this month
      </Preview>
      <Body style={s.body}>
        <Container style={s.outer}>

          {/* Header */}
          <Section style={{ background: "linear-gradient(135deg,#d97706,#b45309)", borderRadius: "16px 16px 0 0", padding: "34px 40px 26px", textAlign: "center" }}>
            <Text style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: 0 }}>SmartFinance</Text>
            <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>⚠️ Budget Warning</Text>
            <Text style={{ display: "inline-block", marginTop: "14px", padding: "8px 24px", background: "rgba(255,255,255,0.2)", borderRadius: "999px", fontSize: "28px", fontWeight: 900, color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}>
              {pct.toFixed(0)}% Used
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={s.card}>
            <Text style={{ fontSize: "17px", color: "#111827", fontWeight: 700, margin: 0 }}>Heads up, {userName} 👀</Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.75", margin: "8px 0 0" }}>
              Your budget for <strong>{accountName}</strong> has reached{" "}
              <strong style={{ color: "#d97706" }}>{pct.toFixed(1)}%</strong>.
              You have <strong style={{ color: "#16a34a" }}>{fmt(remaining)}</strong> left for the rest of this month.
            </Text>
          </Section>

          <Hr style={s.hr} />

          {/* Progress bar */}
          <Section style={s.card}>
            <Text style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Budget Progress
            </Text>
            <div style={{ height: "14px", backgroundColor: "#f3f4f6", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,#f59e0b,${barColor})`, borderRadius: "999px" }} />
            </div>
            <Row>
              <Column><Text style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>KES 0</Text></Column>
              <Column style={{ textAlign: "right" }}><Text style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{fmt(budgetAmount)}</Text></Column>
            </Row>
          </Section>

          <Hr style={s.hr} />

          {/* Summary cards */}
          <Section style={s.card}>
            <Row>
              <Column style={{ width: "31%", paddingRight: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Text style={{ ...s.summLabel, color: "#d97706" }}>Budget</Text>
                  <Text style={{ ...s.summValue, color: "#b45309" }}>{fmt(budgetAmount)}</Text>
                  <Text style={s.summMeta}>Monthly limit</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", padding: "0 3px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                  <Text style={{ ...s.summLabel, color: "#dc2626" }}>Spent</Text>
                  <Text style={{ ...s.summValue, color: "#b91c1c" }}>{fmt(totalExpenses)}</Text>
                  <Text style={s.summMeta}>{pct.toFixed(1)}% used</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", paddingLeft: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Text style={{ ...s.summLabel, color: "#16a34a" }}>Remaining</Text>
                  <Text style={{ ...s.summValue, color: "#15803d" }}>{fmt(remaining)}</Text>
                  <Text style={s.summMeta}>left to spend</Text>
                </div>
              </Column>
            </Row>
          </Section>

          <Hr style={s.hr} />

          {/* Tips */}
          <Section style={s.card}>
            <Text style={s.secTitle}>💡 Tips to Stay Under Budget</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>🛑 Pause any non-essential purchases for the rest of the month.</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>📋 Review recent transactions to see what pushed you to {pct.toFixed(0)}%.</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>🔄 Check recurring subscriptions — cancel ones you no longer use.</Text>
            <Text style={{ ...s.insight }}>📊 Visit your dashboard to see a full breakdown and adjust your budget.</Text>
          </Section>

          <Hr style={s.hr} />

          {/* CTA */}
          <Section style={{ ...s.cardLast, textAlign: "center" }}>
            <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px" }}>
              Review your spending now before you exceed your limit.
            </Text>
            <Link href={`${APP_URL}/dashboard`} style={{ ...s.ctaBtn, background: "linear-gradient(135deg,#d97706,#b45309)" }}>
              Review My Budget →
            </Link>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚨  BudgetExceededEmail  (100%+)
//     Red / urgent — sent every 6 hours while budget remains over 100%
// ─────────────────────────────────────────────────────────────────────────────
export function BudgetExceededEmail({
  userName,
  percentageUsed,
  budgetAmount,
  totalExpenses,
  overspentBy,
  accountName,
}) {
  const pct = Number(percentageUsed);

  return (
    <Html lang="en">
      <Head />
      <Preview>
        🚨 BUDGET EXCEEDED — {accountName} at {pct.toFixed(0)}% · Overspent by {fmt(overspentBy)}
      </Preview>
      <Body style={s.body}>
        <Container style={s.outer}>

          {/* Header */}
          <Section style={{ background: "linear-gradient(135deg,#dc2626,#991b1b)", borderRadius: "16px 16px 0 0", padding: "34px 40px 26px", textAlign: "center" }}>
            <Text style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: 0 }}>SmartFinance</Text>
            <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>🚨 Budget Exceeded</Text>
            <Text style={{ display: "inline-block", marginTop: "14px", padding: "8px 24px", background: "rgba(255,255,255,0.15)", borderRadius: "999px", fontSize: "28px", fontWeight: 900, color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}>
              {pct.toFixed(0)}% Used
            </Text>
          </Section>

          {/* Urgent greeting */}
          <Section style={{ ...s.card, backgroundColor: "#fff5f5" }}>
            <Text style={{ fontSize: "17px", color: "#7f1d1d", fontWeight: 700, margin: 0 }}>Action Required, {userName} 🚨</Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.75", margin: "8px 0 0" }}>
              Your budget for <strong>{accountName}</strong> has been{" "}
              <strong style={{ color: "#dc2626" }}>exceeded</strong>. You spent{" "}
              <strong style={{ color: "#dc2626" }}>{fmt(totalExpenses)}</strong> against a budget of{" "}
              <strong>{fmt(budgetAmount)}</strong> — that is{" "}
              <strong style={{ color: "#dc2626" }}>{fmt(overspentBy)} over your limit</strong>.
            </Text>
          </Section>

          <Hr style={s.hr} />

          {/* Red progress bar */}
          <Section style={s.card}>
            <Text style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Budget Status
            </Text>
            <div style={{ height: "14px", backgroundColor: "#fee2e2", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,#dc2626,#7f1d1d)", borderRadius: "999px" }} />
            </div>
            <Text style={{ fontSize: "12px", color: "#dc2626", fontWeight: 700, margin: "4px 0 0", textAlign: "center" }}>
              ⚠️ Over budget by {fmt(overspentBy)} ({(pct - 100).toFixed(1)}% above limit)
            </Text>
          </Section>

          <Hr style={s.hr} />

          {/* Summary cards */}
          <Section style={s.card}>
            <Row>
              <Column style={{ width: "31%", paddingRight: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <Text style={{ ...s.summLabel, color: "#6b7280" }}>Budget</Text>
                  <Text style={{ ...s.summValue, color: "#111827" }}>{fmt(budgetAmount)}</Text>
                  <Text style={s.summMeta}>Monthly limit</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", padding: "0 3px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}>
                  <Text style={{ ...s.summLabel, color: "#dc2626" }}>Spent</Text>
                  <Text style={{ ...s.summValue, color: "#b91c1c" }}>{fmt(totalExpenses)}</Text>
                  <Text style={s.summMeta}>{pct.toFixed(1)}% of budget</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", paddingLeft: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}>
                  <Text style={{ ...s.summLabel, color: "#dc2626" }}>Over By</Text>
                  <Text style={{ ...s.summValue, color: "#b91c1c" }}>{fmt(overspentBy)}</Text>
                  <Text style={s.summMeta}>above limit</Text>
                </div>
              </Column>
            </Row>
          </Section>

          <Hr style={s.hr} />

          {/* Urgent actions */}
          <Section style={s.card}>
            <Text style={s.secTitle}>🚨 Immediate Actions Required</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>🛑 <strong>Stop all non-essential spending immediately</strong> — your budget is exhausted.</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>📋 Review which transactions caused the overspend and categorise them correctly.</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>💳 Avoid using credit to cover overspend — it compounds the problem.</Text>
            <Text style={{ ...s.insight, borderBottom: "1px solid #f3f4f6" }}>📈 Consider increasing your budget limit if this is a recurring pattern.</Text>
            <Text style={{ ...s.insight }}>🏦 Move money from savings only as a last resort.</Text>
          </Section>

          <Hr style={s.hr} />

          {/* CTA */}
          <Section style={{ ...s.cardLast, textAlign: "center" }}>
            <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px" }}>
              Go to your dashboard to review spending and adjust your budget.
            </Text>
            <Link href={`${APP_URL}/dashboard`} style={{ ...s.ctaBtn, background: "linear-gradient(135deg,#dc2626,#991b1b)" }}>
              View Dashboard Now →
            </Link>
            <Text style={{ fontSize: "12px", color: "#9ca3af", margin: "12px 0 0" }}>
              You will keep receiving this alert every 6 hours until your spending is back under control.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔀  BudgetAlertEmail  — unified dispatcher
//     FIX: inngest imports this single component and passes type="warning"
//     or type="exceeded". This routes to the correct template automatically.
//
//     Props:
//       type           — "warning" | "exceeded"
//       userName       — string
//       percentageUsed — number | string
//       budgetAmount   — number
//       totalExpenses  — number
//       remaining      — number  (leftover when warning; overspentBy when exceeded)
//       accountName    — string
// ─────────────────────────────────────────────────────────────────────────────
export function BudgetAlertEmail({
  type,
  userName,
  percentageUsed,
  budgetAmount,
  totalExpenses,
  remaining,
  accountName,
}) {
  if (type === "exceeded") {
    return (
      <BudgetExceededEmail
        userName={userName}
        percentageUsed={percentageUsed}
        budgetAmount={budgetAmount}
        totalExpenses={totalExpenses}
        overspentBy={remaining}   // inngest passes Math.abs(remaining) here
        accountName={accountName}
      />
    );
  }

  // Default → warning (80–99%)
  return (
    <BudgetWarningEmail
      userName={userName}
      percentageUsed={percentageUsed}
      budgetAmount={budgetAmount}
      totalExpenses={totalExpenses}
      remaining={remaining}
      accountName={accountName}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📊  MonthlyReportEmail
// ─────────────────────────────────────────────────────────────────────────────
export function MonthlyReportEmail({ userName, monthName, year, report, insights = [] }) {
  const {
    summary        = {},
    comparison     = {},
    categories     = {},
    recurring      = {},
    topExpenses    = [],
    forecast       = {},
    spendingAlerts = [],
  } = report || {};

  const {
    totalIncome      = 0,
    totalExpense     = 0,
    netBalance       = 0,
    savingsRate      = 0,
    transactionCount = 0,
  } = summary;

  const netPositive = netBalance >= 0;
  const incChg      = comparison.incomeChangePercent  ?? comparison.incomeMoMPercent;
  const expChg      = comparison.expenseChangePercent ?? comparison.expenseMoMPercent;
  const showMoM     = incChg !== null && incChg !== undefined;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {monthName} {year} — {fmt(totalIncome)} income · {fmt(totalExpense)} expenses · SmartFinance
      </Preview>
      <Body style={s.body}>
        <Container style={s.outer}>

          {/* Header */}
          <Section style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "16px 16px 0 0", padding: "36px 40px 28px", textAlign: "center" }}>
            <Text style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>SmartFinance</Text>
            <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Monthly Financial Report</Text>
            <Text style={{ display: "inline-block", marginTop: "14px", padding: "6px 22px", background: "rgba(255,255,255,0.15)", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}>
              📅 {monthName} {year}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={s.card}>
            <Text style={{ fontSize: "17px", color: "#111827", fontWeight: 700, margin: 0 }}>Hello {userName} 👋</Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", margin: "8px 0 0" }}>
              Here is your complete financial summary for <strong>{monthName} {year}</strong>.
              All amounts are in <strong>Kenyan Shillings (KES)</strong>.
              You had <strong>{transactionCount} transactions</strong> this month.
            </Text>
          </Section>

          <Hr style={s.hr} />

          {/* Summary cards */}
          <Section style={s.card}>
            <Row>
              <Column style={{ width: "31%", paddingRight: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Text style={{ ...s.summLabel, color: "#16a34a" }}>Total Income</Text>
                  <Text style={{ ...s.summValue, color: "#15803d" }}>{fmt(totalIncome)}</Text>
                  <Text style={s.summMeta}>{categories?.income?.length || 0} sources</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", padding: "0 3px" }}>
                <div style={{ ...s.summCard, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                  <Text style={{ ...s.summLabel, color: "#dc2626" }}>Total Expenses</Text>
                  <Text style={{ ...s.summValue, color: "#b91c1c" }}>{fmt(totalExpense)}</Text>
                  <Text style={s.summMeta}>{categories?.expense?.length || 0} categories</Text>
                </div>
              </Column>
              <Column style={{ width: "31%", paddingLeft: "6px" }}>
                <div style={{ ...s.summCard, backgroundColor: netPositive ? "#f0fdf4" : "#fef2f2", border: `1px solid ${netPositive ? "#bbf7d0" : "#fecaca"}` }}>
                  <Text style={{ ...s.summLabel, color: netPositive ? "#16a34a" : "#dc2626" }}>Net Balance</Text>
                  <Text style={{ ...s.summValue, color: netPositive ? "#15803d" : "#b91c1c" }}>{fmt(netBalance)}</Text>
                  <Text style={s.summMeta}>Savings {savingsRate}%</Text>
                </div>
              </Column>
            </Row>
          </Section>

          {/* MoM comparison */}
          {showMoM && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", color: "#1d4ed8" }}>
                  📊 <strong>vs Last Month:</strong>&nbsp;
                  Income {incChg >= 0 ? "▲" : "▼"} {Math.abs(incChg)}%&nbsp;·&nbsp;
                  Expenses {expChg >= 0 ? "▲" : "▼"} {Math.abs(expChg)}%&nbsp;·&nbsp;
                  Prev Net: <strong>{fmt((comparison.prevMonthIncome || 0) - (comparison.prevMonthExpense || 0))}</strong>
                </div>
              </Section>
            </>
          )}

          {/* Expenses by category */}
          {(categories?.expense?.length ?? 0) > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>💸 Expenses by Category</Text>
                <Text style={s.secSub}>Sorted highest to lowest</Text>
                {(categories.expense || []).map((cat, i) => {
                  const barW = Math.min(r2((cat.amount / totalExpense) * 100), 100);
                  return (
                    <Row key={i} style={{ borderBottom: "1px solid #f9fafb", paddingBottom: "10px", marginBottom: "10px" }}>
                      <Column style={{ width: "36px", fontSize: "20px" }}>{emoji(cat.category)}</Column>
                      <Column>
                        <Text style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", textTransform: "capitalize", margin: 0 }}>{cat.category}</Text>
                        <div style={{ height: "5px", backgroundColor: "#f3f4f6", borderRadius: "999px", margin: "5px 0 0", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${barW}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: "999px" }} />
                        </div>
                      </Column>
                      <Column style={{ width: "110px", textAlign: "right" }}>
                        <Text style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937", margin: 0, textAlign: "right" }}>{fmt(cat.amount)}</Text>
                        <Text style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0", textAlign: "right" }}>{cat.percentage}%</Text>
                      </Column>
                    </Row>
                  );
                })}
              </Section>
            </>
          )}

          {/* Income sources */}
          {(categories?.income?.length ?? 0) > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>💰 Income Sources</Text>
                <Text style={s.secSub}>Where your money came from</Text>
                {(categories.income || []).map((cat, i) => (
                  <Row key={i} style={{ borderBottom: "1px solid #f9fafb", paddingBottom: "9px", marginBottom: "9px" }}>
                    <Column style={{ width: "36px", fontSize: "18px" }}>{emoji(cat.category)}</Column>
                    <Column>
                      <Text style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", textTransform: "capitalize", margin: 0 }}>{cat.category}</Text>
                    </Column>
                    <Column style={{ width: "110px", textAlign: "right" }}>
                      <Text style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", margin: 0, textAlign: "right" }}>{fmt(cat.amount)}</Text>
                      <Text style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0", textAlign: "right" }}>{cat.percentage}%</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </>
          )}

          {/* Top 5 expenses */}
          {topExpenses.length > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>🏆 Top 5 Biggest Expenses</Text>
                <Text style={s.secSub}>Your largest single transactions</Text>
                <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", border: "1px solid #f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={s.th}>#</th>
                      <th style={s.th}>Description</th>
                      <th style={s.th}>Category</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExpenses.slice(0, 5).map((t, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                        <td style={{ ...s.td, color: "#9ca3af", width: "28px" }}>{i + 1}</td>
                        <td style={s.td}>{emoji(t.category)} {t.description || "—"}</td>
                        <td style={{ ...s.td, textTransform: "capitalize", color: "#6b7280" }}>{t.category}</td>
                        <td style={s.tdAmt}>{fmt(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            </>
          )}

          {/* Recurring split */}
          {(recurring?.recurringExpenseTotal ?? 0) > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>🔄 Recurring vs One-off Expenses</Text>
                <Text style={s.secSub}>Fixed vs variable spending breakdown</Text>
                <Row>
                  <Column style={{ width: "48%", backgroundColor: "#f8f4ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <Text style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: 0 }}>Recurring (Fixed)</Text>
                    <Text style={{ fontSize: "18px", fontWeight: 800, color: "#6d28d9", margin: "5px 0 0" }}>{fmt(recurring.recurringExpenseTotal)}</Text>
                    <Text style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>{recurring.recurringPercentage}% · {recurring.recurringCount} txns</Text>
                  </Column>
                  <Column style={{ width: "4%" }} />
                  <Column style={{ width: "48%", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <Text style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>One-off (Variable)</Text>
                    <Text style={{ fontSize: "18px", fontWeight: 800, color: "#0284c7", margin: "5px 0 0" }}>{fmt(recurring.oneOffExpenseTotal)}</Text>
                    <Text style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>{r2(100 - recurring.recurringPercentage)}% · {recurring.oneOffCount} txns</Text>
                  </Column>
                </Row>
              </Section>
            </>
          )}

          {/* Spending alerts */}
          {spendingAlerts?.length > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>⚠️ Spending Spike Alerts</Text>
                <Text style={s.secSub}>Categories more than 50% above your 3-month average</Text>
                {spendingAlerts.map((alert, i) => (
                  <div key={i} style={{ backgroundColor: alert.severity === "high" ? "#fef2f2" : "#fff7ed", border: `1px solid ${alert.severity === "high" ? "#fca5a5" : "#fed7aa"}`, borderRadius: "10px", padding: "10px 14px", marginBottom: "8px" }}>
                    <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: alert.severity === "high" ? "#dc2626" : "#c2410c" }}>
                      {emoji(alert.category)} {alert.category} — +{alert.overagePercent}% above average
                    </Text>
                    <Text style={{ margin: "3px 0 0", fontSize: "12px", color: "#6b7280" }}>
                      This month: {fmt(alert.currentSpend)} · Historical avg: {fmt(alert.historicalAvg)}
                    </Text>
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* Forecast */}
          {forecast?.forecastedExpense && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>🔮 Next Month Forecast</Text>
                <Text style={s.secSub}>Based on your {forecast.basedOnMonths}-month rolling average</Text>
                <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "16px 20px" }}>
                  <Row>
                    <Column style={{ width: "60%" }}>
                      <Text style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: 0 }}>Expected Expenses</Text>
                      <Text style={{ fontSize: "22px", fontWeight: 800, color: "#6d28d9", margin: "4px 0 0" }}>{fmt(forecast.forecastedExpense)}</Text>
                      <Text style={{ fontSize: "11px", color: "#6b7280", margin: "3px 0 0" }}>
                        Confidence:{" "}
                        <strong style={{ textTransform: "capitalize", color: forecast.confidence === "high" ? "#16a34a" : "#d97706" }}>
                          {forecast.confidence}
                        </strong>
                      </Text>
                    </Column>
                    <Column style={{ width: "40%", textAlign: "right" }}>
                      <Text style={{ fontSize: "12px", fontWeight: 700, color: forecast.forecastedNet >= 0 ? "#16a34a" : "#dc2626", textTransform: "uppercase", margin: 0 }}>Projected Net</Text>
                      <Text style={{ fontSize: "20px", fontWeight: 800, color: forecast.forecastedNet >= 0 ? "#15803d" : "#b91c1c", margin: "4px 0 0" }}>{fmt(forecast.forecastedNet)}</Text>
                    </Column>
                  </Row>
                </div>
              </Section>
            </>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <>
              <Hr style={s.hr} />
              <Section style={s.card}>
                <Text style={s.secTitle}>🧠 SmartFinance AI Insights</Text>
                <Text style={s.secSub}>Personalised advice for {monthName} powered by Gemini AI</Text>
                {insights.map((insight, i) => (
                  <Text key={i} style={{ ...s.insight, borderBottom: i === insights.length - 1 ? "none" : "1px solid #f3f4f6" }}>
                    {insight}
                  </Text>
                ))}
              </Section>
            </>
          )}

          {/* CTA */}
          <Hr style={s.hr} />
          <Section style={{ ...s.cardLast, textAlign: "center" }}>
            <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px" }}>
              View your full charts, budgets, and transaction history.
            </Text>
            <Link href={`${APP_URL}/dashboard`} style={{ ...s.ctaBtn, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              View Full Dashboard →
            </Link>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy default export — keeps any old imports working
// ─────────────────────────────────────────────────────────────────────────────
export default function EmailTemplate({ userName, type, data }) {
  if (type === "monthly-report") {
    return (
      <MonthlyReportEmail
        userName={userName}
        monthName={data?.month}
        year={new Date().getFullYear()}
        report={data?.stats}
        insights={data?.insights}
      />
    );
  }

  if (type === "budget-alert") {
    const pct = Number(data?.percentageUsed || 0);
    if (pct >= 100) {
      return (
        <BudgetExceededEmail
          userName={userName}
          percentageUsed={pct.toFixed(1)}
          budgetAmount={Number(data?.budgetAmount)}
          totalExpenses={Number(data?.totalExpenses)}
          overspentBy={Math.abs(Number(data?.totalExpenses) - Number(data?.budgetAmount))}
          accountName={data?.accountName}
        />
      );
    }
    return (
      <BudgetWarningEmail
        userName={userName}
        percentageUsed={pct.toFixed(1)}
        budgetAmount={Number(data?.budgetAmount)}
        totalExpenses={Number(data?.totalExpenses)}
        remaining={Math.max(Number(data?.budgetAmount) - Number(data?.totalExpenses), 0)}
        accountName={data?.accountName}
      />
    );
  }

  return null;
}