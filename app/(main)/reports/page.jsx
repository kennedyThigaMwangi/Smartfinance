"use client";

import { useState, useEffect } from "react";
import { fetchReportData, emailReportOnDemand } from "@/actions/generate-report";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const CAT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

const CAT_EMOJI = {
  food: "🍔", groceries: "🛒", utilities: "💡", entertainment: "🎬",
  shopping: "🛍️", education: "📚", housing: "🏠", healthcare: "🏥",
  transportation: "🚗", travel: "✈️", salary: "💼", freelance: "💻",
  investment: "📈", savings: "🏦", insurance: "🛡️", subscriptions: "🔄",
  dining: "🍽️", fuel: "⛽", mpesa: "📱", rent: "🏘️",
};
const catEmoji = (c) => CAT_EMOJI[c?.toLowerCase()] ?? "💰";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="flex-1 h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-20 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-60 bg-gray-200 rounded-2xl" />
        <div className="h-60 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-52 bg-gray-200 rounded-2xl" />
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="h-36 bg-gray-200 rounded-2xl" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary card
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({ label, value, meta, color, bg, border }) {
  return (
    <div
      style={{ background: bg, border: `1px solid ${border}` }}
      className="rounded-2xl p-5 flex flex-col gap-1 flex-1 min-w-0"
    >
      <span style={{ color }} className="text-xs font-bold uppercase tracking-widest">{label}</span>
      <span style={{ color }} className="text-2xl font-extrabold tracking-tight leading-none">{value}</span>
      <span className="text-xs text-gray-400">{meta}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget meter
// ─────────────────────────────────────────────────────────────────────────────
function BudgetMeter({ budgetComparison }) {
  if (!budgetComparison) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-gray-400 text-sm">
        No budget set for this account.{" "}
        <a href="/dashboard" className="text-indigo-500 underline">Set one →</a>
      </div>
    );
  }

  const { budgetAmount, totalExpense, remaining, percentageUsed, isExceeded, status } = budgetComparison;
  const pct    = Math.min(percentageUsed, 100);
  const barCol = isExceeded ? "#ef4444" : status === "warning" ? "#f59e0b" : "#22c55e";

  return (
    <div className={`rounded-2xl border p-5 ${
      isExceeded ? "bg-red-50 border-red-200"
      : status === "warning" ? "bg-amber-50 border-amber-200"
      : "bg-green-50 border-green-200"
    }`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-700">Monthly Budget Limit</span>
        <span style={{ color: barCol }} className="text-sm font-extrabold">{percentageUsed}% used</span>
      </div>
      <div className="h-3 bg-white/70 rounded-full overflow-hidden mb-3 border border-white">
        <div
          style={{ width: `${pct}%`, background: barCol }}
          className="h-full rounded-full transition-all duration-700"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 flex-wrap gap-2">
        <span>Budget: <strong className="text-gray-700">{fmt(budgetAmount)}</strong></span>
        <span>Spent: <strong style={{ color: isExceeded ? "#dc2626" : "#1f2937" }}>{fmt(totalExpense)}</strong></span>
        <span style={{ color: isExceeded ? "#dc2626" : "#16a34a" }} className="font-bold">
          {isExceeded
            ? `⚠️ Over by ${fmt(Math.abs(remaining))}`
            : `✅ ${fmt(remaining)} remaining`}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [period,     setPeriod]     = useState("monthly");
  const [report,     setReport]     = useState(null);
  const [insights,   setInsights]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [emailing,   setEmailing]   = useState(false);
  const [emailSent,  setEmailSent]  = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPDF,    setShowPDF]    = useState(false);

  // ── Fetch whenever period changes ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setEmailSent(false);
      setShowPDF(false);

      try {
        const result = await fetchReportData(period);
        if (!cancelled) {
          setReport(result.report);
          setInsights(result.insights);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [period]);

  // ── Email ──────────────────────────────────────────────────────────────
  async function handleEmail() {
    setEmailing(true);
    try {
      await emailReportOnDemand(period);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      alert("Failed to send email: " + err.message);
    } finally {
      setEmailing(false);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const {
    summary          = {},
    categories       = {},
    topExpenses      = [],
    budgetComparison = null,
    recurring        = {},
    accountName      = null,
    label            = "",
  } = report || {};

  const {
    totalIncome      = 0,
    totalExpense     = 0,
    netBalance       = 0,
    savingsRate      = 0,
    transactionCount = 0,
  } = summary;

  const netPositive = netBalance >= 0;

  const pieData = (categories?.expense || []).slice(0, 6).map((c, i) => ({
    name:  c.category,
    value: c.amount,
    fill:  CAT_COLORS[i % CAT_COLORS.length],
  }));

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Financial Reports
            </h1>

            {/* Account badge */}
            {accountName && (
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                <span className="text-xs text-indigo-400">Account:</span>
                <span className="text-xs font-bold text-indigo-700">🏦 {accountName}</span>
                <span className="text-xs text-indigo-300">(default)</span>
              </div>
            )}

            <p className="text-sm text-gray-400 mt-1.5">
              {loading ? "Loading…" : `${label} · ${transactionCount} transactions`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {["weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                disabled={loading}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
                  period === p
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            <button
              onClick={handleEmail}
              disabled={emailing || loading}
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-50"
            >
              {emailSent ? "✅ Sent!" : emailing ? "Sending…" : "📧 Email"}
            </button>

            <button
              onClick={() => setShowPDF((p) => !p)}
              disabled={loading}
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow"
            >
              {showPDF ? "✕ Close PDF" : "📄 View PDF"}
            </button>
          </div>
        </div>

        {/* ── States ── */}
        {loading && <Skeleton />}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && !report && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm font-medium">No transactions found for this period.</p>
            <p className="text-xs mt-1">Try switching to a different period above.</p>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && report && (
          <div className="space-y-6">

            {/* Summary cards */}
            <div className="flex gap-4 flex-wrap">
              <SummaryCard
                label="Total Income"    value={fmt(totalIncome)}
                meta={`${categories?.income?.length || 0} income sources`}
                color="#15803d" bg="#f0fdf4" border="#bbf7d0"
              />
              <SummaryCard
                label="Total Expenses"  value={fmt(totalExpense)}
                meta={`${categories?.expense?.length || 0} categories`}
                color="#b91c1c" bg="#fef2f2" border="#fecaca"
              />
              <SummaryCard
                label="Net Balance"     value={fmt(netBalance)}
                meta={`Savings rate: ${savingsRate}%`}
                color={netPositive ? "#15803d" : "#b91c1c"}
                bg={netPositive ? "#f0fdf4" : "#fef2f2"}
                border={netPositive ? "#bbf7d0" : "#fecaca"}
              />
            </div>

            {/* Budget meter — monthly only */}
            {period === "monthly" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-3">🎯 Budget vs Actual</h2>
                <BudgetMeter budgetComparison={budgetComparison} />
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Bar chart */}
              {(categories?.expense?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-700 mb-4">💸 Expenses by Category</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(categories.expense || []).slice(0, 7)}
                      layout="vertical"
                      margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category" dataKey="category" width={85}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.length > 11 ? v.slice(0, 11) + "…" : v}
                      />
                      <Tooltip formatter={(v) => [fmt(v), "Amount"]} />
                      <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                        {(categories.expense || []).slice(0, 7).map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie chart */}
              {pieData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-700 mb-4">🍩 Spending Breakdown</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={90}
                        dataKey="value" paddingAngle={3}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [fmt(v), "Amount"]} />
                      <Legend
                        iconSize={8} iconType="circle"
                        formatter={(v) => (
                          <span style={{ fontSize: 11, textTransform: "capitalize" }}>{v}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category breakdown */}
            {(categories?.expense?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-4">📊 Full Category Breakdown</h2>
                {(categories.expense || []).map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-lg w-7 shrink-0">{catEmoji(cat.category)}</span>
                    <span className="text-sm text-gray-700 capitalize w-32 shrink-0 truncate">{cat.category}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          background: CAT_COLORS[i % CAT_COLORS.length],
                        }}
                        className="h-full rounded-full transition-all duration-700"
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-28 text-right shrink-0">{fmt(cat.amount)}</span>
                    <span className="text-xs text-gray-400 w-8 text-right shrink-0">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Income sources */}
            {(categories?.income?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-4">💰 Income Sources</h2>
                {(categories.income || []).map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-lg w-7 shrink-0">{catEmoji(cat.category)}</span>
                    <span className="text-sm text-gray-700 capitalize w-32 shrink-0 truncate">{cat.category}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(cat.percentage, 100)}%`, background: "#22c55e" }}
                        className="h-full rounded-full transition-all duration-700"
                      />
                    </div>
                    <span className="text-sm font-bold text-green-700 w-28 text-right shrink-0">{fmt(cat.amount)}</span>
                    <span className="text-xs text-gray-400 w-8 text-right shrink-0">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top transactions table */}
            {topExpenses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-4">🏆 Top 5 Biggest Expenses</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wide w-8">#</th>
                        <th className="pb-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Description</th>
                        <th className="pb-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Category</th>
                        <th className="pb-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Date</th>
                        <th className="pb-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topExpenses.map((t, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-gray-300 font-bold">{i + 1}</td>
                          <td className="py-3 text-gray-700 font-medium">
                            {catEmoji(t.category)} {t.description || "—"}
                          </td>
                          <td className="py-3 capitalize">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 text-xs">{formatDate(t.date)}</td>
                          <td className="py-3 text-right font-extrabold text-red-600">{fmt(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recurring split */}
            {(recurring?.recurringTotal ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-4">🔄 Recurring vs One-off</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Recurring (Fixed)</div>
                    <div className="text-xl font-extrabold text-purple-700">{fmt(recurring.recurringTotal)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {recurring.recurringPercentage}% · {recurring.recurringCount} transactions
                    </div>
                  </div>
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-1">One-off (Variable)</div>
                    <div className="text-xl font-extrabold text-sky-700">{fmt(recurring.nonRecurringTotal)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {100 - recurring.recurringPercentage}% · {recurring.nonRecurringCount} transactions
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-4">🧠 AI Insights</h2>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div
                      key={i}
                      style={{ borderLeftColor: CAT_COLORS[i % CAT_COLORS.length] }}
                      className="border-l-4 pl-4 py-1 text-sm text-gray-600 leading-relaxed"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline PDF viewer */}
            {showPDF && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-700">📄 PDF Report Preview</h2>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/reports/pdf?period=${period}`}
                      download
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                    >
                      ⬇️ Download
                    </a>
                    <button
                      onClick={() => setShowPDF(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
                <iframe
                  src={`/api/reports/pdf?period=${period}`}
                  className="w-full"
                  style={{ height: "80vh" }}
                  title="Financial Report PDF"
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}