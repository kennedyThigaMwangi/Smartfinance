import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

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

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily:      "Helvetica",
    paddingTop:      0,
    paddingBottom:   24,
    paddingHorizontal: 0,
    fontSize:        10,
    color:           "#1f2937",
  },

  // Header band
  header: {
    backgroundColor: "#4f46e5",
    padding:         "32 40 24 40",
    marginBottom:    0,
  },
  headerBrand: {
    fontSize:    22,
    fontFamily:  "Helvetica-Bold",
    color:       "#ffffff",
    marginBottom: 2,
  },
  headerSub: {
    fontSize:     9,
    color:        "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom:  10,
  },
  headerPeriod: {
    fontSize:    12,
    color:       "#c7d2fe",
    fontFamily:  "Helvetica-Bold",
  },
  headerDate: {
    fontSize: 9,
    color:    "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  body: {
    paddingHorizontal: 40,
    paddingTop:        24,
  },

  // Section titles
  sectionTitle: {
    fontSize:     11,
    fontFamily:   "Helvetica-Bold",
    color:        "#111827",
    marginBottom:  6,
    marginTop:    18,
    paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb", borderBottomStyle: "solid",
  },

  // Summary row of 3 cards
  summaryRow: {
    flexDirection:  "row",
    gap:            8,
    marginBottom:   4,
  },
  summaryCard: {
    flex:          1,
    borderRadius:  8,
    padding:       "12 10",
    alignItems:    "center",
  },
  summaryLabel: {
    fontSize:      7,
    fontFamily:    "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom:  4,
  },
  summaryValue: {
    fontSize:   14,
    fontFamily: "Helvetica-Bold",
  },
  summaryMeta: {
    fontSize:  8,
    color:     "#6b7280",
    marginTop: 2,
  },

  // Category bar rows
  catRow: {
    flexDirection:  "row",
    alignItems:     "center",
    marginBottom:   7,
    gap:            8,
  },
  catLabel: {
    width:         90,
    fontSize:      9,
    textTransform: "capitalize",
    color:         "#374151",
  },
  catBarBg: {
    flex:          1,
    height:        6,
    backgroundColor: "#f3f4f6",
    borderRadius:  3,
  },
  catBarFill: {
    height:       6,
    borderRadius: 3,
    backgroundColor: "#6366f1",
  },
  catAmt: {
    width:      70,
    fontSize:   9,
    fontFamily: "Helvetica-Bold",
    color:      "#1f2937",
    textAlign:  "right",
  },
  catPct: {
    width:     26,
    fontSize:  8,
    color:     "#9ca3af",
    textAlign: "right",
  },

  // Table
  tableHeader: {
    flexDirection:   "row",
    backgroundColor: "#f9fafb",
    padding:         "6 8",
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb", borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    padding:       "6 8",
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6", borderBottomStyle: "solid",
  },
  th: {
    fontSize:      7,
    fontFamily:    "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color:         "#6b7280",
  },
  td: {
    fontSize: 9,
    color:    "#374151",
  },
  colNum:  { width: 20 },
  colDesc: { flex: 1 },
  colCat:  { width: 80 },
  colAmt:  { width: 80, textAlign: "right" },

  // Budget bar
  budgetBarBg: {
    height:          10,
    backgroundColor: "#f3f4f6",
    borderRadius:    5,
    marginTop:       6,
    marginBottom:    4,
  },
  budgetBarFill: {
    height:       10,
    borderRadius: 5,
  },
  budgetMeta: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginTop:      4,
  },
  budgetMetaText: {
    fontSize: 8,
    color:    "#6b7280",
  },

  // Insight rows
  insightRow: {
    fontSize:    9,
    color:       "#374151",
    lineHeight:  1.6,
    marginBottom: 5,
    paddingLeft:  8,
    borderLeftWidth: 2,  borderLeftColor: "#6366f1",  borderLeftStyle: "solid",
  },

  // Recurring split
  splitRow: {
    flexDirection: "row",
    gap:           10,
    marginTop:     4,
  },
  splitCard: {
    flex:          1,
    borderRadius:  6,
    padding:       "10 10",
    alignItems:    "center",
  },
  splitLabel: {
    fontSize:      7,
    fontFamily:    "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom:  4,
  },
  splitValue: {
    fontSize:   13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  splitMeta: {
    fontSize: 8,
    color:    "#6b7280",
  },


});

// ─────────────────────────────────────────────────────────────────────────────
// PDF Document
// ─────────────────────────────────────────────────────────────────────────────
export function ReportPDF({ report, insights = [], userName }) {
  const {
    label         = "",
    summary       = {},
    categories    = {},
    topExpenses   = [],
    budgetComparison,
    recurring     = {},
    period        = "monthly",
  } = report;

  const {
    totalIncome      = 0,
    totalExpense     = 0,
    netBalance       = 0,
    savingsRate      = 0,
    transactionCount = 0,
  } = summary;

  const netPositive = netBalance >= 0;
  const periodLabel = { weekly: "Weekly", monthly: "Monthly", yearly: "Annual" }[period] || "Financial";
  const generatedOn = new Date().toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Document
      title={`SmartFinance ${periodLabel} Report — ${label}`}
      author="SmartFinance"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerBrand}>SmartFinance</Text>
          <Text style={s.headerSub}>{periodLabel} Financial Report</Text>
          <Text style={s.headerPeriod}>{label}</Text>
          <Text style={s.headerDate}>
            Prepared for {userName} · Generated on {generatedOn}
          </Text>
        </View>

        <View style={s.body}>

          {/* ── Summary ── */}
          <Text style={s.sectionTitle}>📊 Summary</Text>
          <View style={s.summaryRow}>
            {/* Income */}
            <View style={[s.summaryCard, { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderStyle: "solid" }]}>
              <Text style={[s.summaryLabel, { color: "#16a34a" }]}>Total Income</Text>
              <Text style={[s.summaryValue, { color: "#15803d" }]}>{fmt(totalIncome)}</Text>
              <Text style={s.summaryMeta}>{categories?.income?.length || 0} sources</Text>
            </View>
            {/* Expense */}
            <View style={[s.summaryCard, { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderStyle: "solid" }]}>
              <Text style={[s.summaryLabel, { color: "#dc2626" }]}>Total Expenses</Text>
              <Text style={[s.summaryValue, { color: "#b91c1c" }]}>{fmt(totalExpense)}</Text>
              <Text style={s.summaryMeta}>{transactionCount} transactions</Text>
            </View>
            {/* Net */}
            <View style={[s.summaryCard, {
              backgroundColor: netPositive ? "#f0fdf4" : "#fef2f2",
              borderWidth: 1, borderColor: netPositive ? "#bbf7d0" : "#fecaca", borderStyle: "solid",
            }]}>
              <Text style={[s.summaryLabel, { color: netPositive ? "#16a34a" : "#dc2626" }]}>Net Balance</Text>
              <Text style={[s.summaryValue, { color: netPositive ? "#15803d" : "#b91c1c" }]}>{fmt(netBalance)}</Text>
              <Text style={s.summaryMeta}>Savings {savingsRate}%</Text>
            </View>
          </View>

          {/* ── Budget vs Actual ── */}
          {budgetComparison && (
            <>
              <Text style={s.sectionTitle}>🎯 Budget vs Actual</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: "#374151" }}>
                  Budget: <Text style={{ fontFamily: "Helvetica-Bold" }}>{fmt(budgetComparison.budgetAmount)}</Text>
                  {"  "}Spent: <Text style={{ fontFamily: "Helvetica-Bold", color: budgetComparison.isExceeded ? "#dc2626" : "#1f2937" }}>
                    {fmt(budgetComparison.totalExpense)}
                  </Text>
                </Text>
                <Text style={{
                  fontSize:   9,
                  fontFamily: "Helvetica-Bold",
                  color: budgetComparison.isExceeded ? "#dc2626" : budgetComparison.percentageUsed >= 80 ? "#d97706" : "#16a34a",
                }}>
                  {budgetComparison.percentageUsed}% used
                </Text>
              </View>
              <View style={s.budgetBarBg}>
                <View style={[s.budgetBarFill, {
                  width: `${Math.min(budgetComparison.percentageUsed, 100)}%`,
                  backgroundColor: budgetComparison.isExceeded
                    ? "#dc2626"
                    : budgetComparison.percentageUsed >= 80
                    ? "#f59e0b"
                    : "#22c55e",
                }]} />
              </View>
              <View style={s.budgetMeta}>
                <Text style={s.budgetMetaText}>KES 0</Text>
                <Text style={[s.budgetMetaText, {
                  color: budgetComparison.isExceeded ? "#dc2626" : "#16a34a",
                  fontFamily: "Helvetica-Bold",
                }]}>
                  {budgetComparison.isExceeded
                    ? `Over by ${fmt(Math.abs(budgetComparison.remaining))}`
                    : `${fmt(budgetComparison.remaining)} remaining`}
                </Text>
                <Text style={s.budgetMetaText}>{fmt(budgetComparison.budgetAmount)}</Text>
              </View>
            </>
          )}

          {/* ── Expense Categories ── */}
          {(categories?.expense?.length ?? 0) > 0 && (
            <>
              <Text style={s.sectionTitle}>💸 Expenses by Category</Text>
              {(categories.expense || []).slice(0, 8).map((cat, i) => (
                <View key={i} style={s.catRow}>
                  <Text style={s.catLabel}>{cat.category}</Text>
                  <View style={s.catBarBg}>
                    <View style={[s.catBarFill, { width: `${Math.min(cat.percentage, 100)}%` }]} />
                  </View>
                  <Text style={s.catAmt}>{fmt(cat.amount)}</Text>
                  <Text style={s.catPct}>{cat.percentage}%</Text>
                </View>
              ))}
            </>
          )}

          {/* ── Top Transactions ── */}
          {topExpenses.length > 0 && (
            <>
              <Text style={s.sectionTitle}>🏆 Top 5 Biggest Expenses</Text>
              <View style={s.tableHeader}>
                <Text style={[s.th, s.colNum]}>#</Text>
                <Text style={[s.th, s.colDesc]}>Description</Text>
                <Text style={[s.th, s.colCat]}>Category</Text>
                <Text style={[s.th, s.colAmt]}>Amount</Text>
              </View>
              {topExpenses.map((t, i) => (
                <View key={i} style={[s.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }]}>
                  <Text style={[s.td, s.colNum, { color: "#9ca3af" }]}>{i + 1}</Text>
                  <Text style={[s.td, s.colDesc]}>{t.description || "—"}</Text>
                  <Text style={[s.td, s.colCat, { textTransform: "capitalize", color: "#6b7280" }]}>{t.category}</Text>
                  <Text style={[s.td, s.colAmt, { fontFamily: "Helvetica-Bold", color: "#dc2626" }]}>{fmt(t.amount)}</Text>
                </View>
              ))}
            </>
          )}

          {/* ── Recurring Split ── */}
          {(recurring?.recurringTotal ?? 0) > 0 && (
            <>
              <Text style={s.sectionTitle}>🔄 Recurring vs One-off</Text>
              <View style={s.splitRow}>
                <View style={[s.splitCard, { backgroundColor: "#f8f4ff", borderWidth: 1, borderColor: "#e9d5ff", borderStyle: "solid" }]}>
                  <Text style={[s.splitLabel, { color: "#7c3aed" }]}>Recurring (Fixed)</Text>
                  <Text style={[s.splitValue, { color: "#6d28d9" }]}>{fmt(recurring.recurringTotal)}</Text>
                  <Text style={s.splitMeta}>{recurring.recurringPercentage}% · {recurring.recurringCount} txns</Text>
                </View>
                <View style={[s.splitCard, { backgroundColor: "#f0f9ff", borderWidth: 1, borderColor: "#bae6fd", borderStyle: "solid" }]}>
                  <Text style={[s.splitLabel, { color: "#0369a1" }]}>One-off (Variable)</Text>
                  <Text style={[s.splitValue, { color: "#0284c7" }]}>{fmt(recurring.nonRecurringTotal)}</Text>
                  <Text style={s.splitMeta}>{100 - recurring.recurringPercentage}% · {recurring.nonRecurringCount} txns</Text>
                </View>
              </View>
            </>
          )}

          {/* ── AI Insights ── */}
          {insights.length > 0 && (
            <>
              <Text style={s.sectionTitle}>🧠 AI Insights</Text>
              {insights.map((insight, i) => (
                <Text key={i} style={s.insightRow}>{insight}</Text>
              ))}
            </>
          )}

        </View>

      </Page>
    </Document>
  );
}