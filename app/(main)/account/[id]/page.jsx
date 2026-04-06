import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Wallet, CreditCard, PiggyBank, Landmark,
  Activity, BarChart2, Calendar, Shield,
  ChevronRight, Sparkles, RefreshCw,
} from "lucide-react";
import Link from "next/link";

//
// §1 · STYLES
//

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

/* ── HIDE FOOTER WHEN AUTHENTICATED ── */
footer,
[class*="footer"],
[id*="footer"],
.site-footer,
nav ~ footer,
body > footer { display: none !important; }

/* ── BASE ── */
.ap-root * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
.ap-root { font-family: 'DM Sans', sans-serif; }

/* ── KEYFRAMES ── */
@keyframes apFadeUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
@keyframes apSlideIn  { from { opacity:0; transform:translateX(-14px) } to { opacity:1; transform:translateX(0) } }
@keyframes apShimmer  { 0% { background-position:-600px 0 } 100% { background-position:600px 0 } }
@keyframes apGlow     { 0%,100% { box-shadow:0 0 0 0 rgba(56,189,248,.22) } 50% { box-shadow:0 0 22px 7px rgba(56,189,248,.1) } }
@keyframes apPulse    { 0%,100% { opacity:1;transform:scale(1) } 50% { opacity:.7;transform:scale(1.06) } }
@keyframes apFloat    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
@keyframes apCountUp  { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }
@keyframes apBarFill  { from { width:0 } to { width:var(--tw) } }

/* ── PAGE WRAPPER ── */
.ap-page { display:flex; flex-direction:column; gap:28px; padding-bottom:60px; }

/* ── HERO BANNER ── */
.ap-hero {
  border-radius:24px;
  background:linear-gradient(135deg,#0a1628 0%,#0f2552 50%,#1e3a8a 100%);
  border:1px solid rgba(56,189,248,.12);
  padding:30px 34px;
  position:relative; overflow:hidden;
  animation:apFadeUp .42s ease both;
}
.ap-hero::before {
  content:''; position:absolute; top:-80px; right:-80px;
  width:260px; height:260px; border-radius:50%;
  background:radial-gradient(circle,rgba(56,189,248,.1) 0%,transparent 70%);
  pointer-events:none;
}
.ap-hero::after {
  content:''; position:absolute; bottom:-50px; left:20%;
  width:200px; height:200px; border-radius:50%;
  background:radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%);
  pointer-events:none;
}
.ap-hero-inner {
  display:flex; align-items:flex-start; justify-content:space-between;
  flex-wrap:wrap; gap:24px; position:relative; z-index:1;
}

/* ── HERO LEFT ── */
.ap-hero-left { flex:1; min-width:200px; }
.ap-breadcrumb {
  display:flex; align-items:center; gap:6px;
  font-size:11.5px; font-weight:600; color:#64748b;
  margin-bottom:12px; text-decoration:none;
}
.ap-breadcrumb:hover { color:#38bdf8; }
.ap-breadcrumb span { color:#38bdf8; }
.ap-account-type-pill {
  display:inline-flex; align-items:center; gap:6px;
  font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
  color:#38bdf8; background:rgba(56,189,248,.1); border:1px solid rgba(56,189,248,.2);
  padding:4px 12px; border-radius:999px; margin-bottom:10px;
}
.ap-account-name {
  font-family:'Syne',sans-serif;
  font-size:clamp(1.8rem,4vw,2.8rem);
  font-weight:800; color:white; line-height:1.1; margin:0 0 8px;
  text-transform:capitalize;
}
.ap-account-name span {
  background:linear-gradient(90deg,#38bdf8,#4ECDC4);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.ap-account-sub { font-size:13px; color:#64748b; display:flex; align-items:center; gap:6px; }

/* ── HERO RIGHT ── */
.ap-hero-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
.ap-balance-block { text-align:right; }
.ap-balance-label { font-size:10.5px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.07em; margin-bottom:5px; }
.ap-balance-row { display:flex; align-items:center; gap:8px; justify-content:flex-end; }
.ap-kes-badge {
  font-family:'Syne',sans-serif; font-size:13px; font-weight:800; letter-spacing:.04em;
  color:#38bdf8; background:rgba(56,189,248,.12); border:1px solid rgba(56,189,248,.25);
  padding:3px 10px; border-radius:7px; flex-shrink:0;
}
.ap-balance-amount {
  font-family:'DM Sans',sans-serif;
  font-size:clamp(1.6rem,3vw,2.2rem);
  font-weight:800; color:white; line-height:1;
  animation:apCountUp .6s ease both;
}
.ap-tx-count {
  font-size:12px; color:#64748b; font-weight:600;
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  padding:5px 12px; border-radius:999px;
}

/* ── QUICK ACTION PILLS ── */
.ap-actions-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
.ap-action-btn {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.06); color:white; font-family:'DM Sans',sans-serif;
  font-size:12px; font-weight:600; cursor:pointer; text-decoration:none;
  transition:all .2s; white-space:nowrap;
}
.ap-action-btn:hover { background:rgba(255,255,255,.12); border-color:rgba(56,189,248,.4); color:#38bdf8; }
.ap-action-btn.primary {
  background:linear-gradient(135deg,#1e40af,#2563eb); border-color:transparent;
}
.ap-action-btn.primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(30,64,175,.35); }

/* ── STAT CARDS ── */
.ap-stats-row {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(155px,1fr)); gap:12px;
  animation:apFadeUp .5s ease both;
}
.ap-stat-card {
  border-radius:16px; padding:16px 18px; position:relative; overflow:hidden;
  transition:transform .22s,box-shadow .22s; cursor:default; animation:apFadeUp .52s ease both;
}
.ap-stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.12); }
.ap-stat-card::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.14),transparent); pointer-events:none;
}
.ap-stat-ic { width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;margin-bottom:10px;color:white; }
.ap-stat-lbl { font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;opacity:.75;margin-bottom:4px; }
.ap-stat-val { font-family:'DM Sans',sans-serif;font-size:1.05rem;font-weight:700;line-height:1.1;color:inherit; }
.ap-stat-sub { font-size:10px;font-weight:600;opacity:.7;margin-top:3px; }
.ap-sc-blue   { background:linear-gradient(135deg,#1e40af,#2563eb);color:white; }
.ap-sc-teal   { background:linear-gradient(135deg,#0d9488,#14b8a6);color:white; }
.ap-sc-rose   { background:linear-gradient(135deg,#be123c,#e11d48);color:white; }
.ap-sc-amber  { background:linear-gradient(135deg,#b45309,#d97706);color:white; }
.ap-sc-violet { background:linear-gradient(135deg,#6d28d9,#7c3aed);color:white; }

/* ── SECTION HEADER ── */
.ap-section-head {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:10px; margin-bottom:14px;
}
.ap-section-title {
  font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#0f172a;
  display:flex; align-items:center; gap:9px;
}
.ap-section-icon {
  width:30px;height:30px;border-radius:9px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.ap-section-badge {
  font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;
  background:#f1f5f9;color:#64748b;letter-spacing:.04em;
}
.ap-live-badge {
  font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;
  background:#f0fdf4;color:#16a34a;animation:apPulse 2.5s ease-in-out infinite;
}

/* ── INSIGHT CARDS (above chart) ── */
.ap-insights {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px;
  animation:apFadeUp .55s ease both;
}
.ap-insight-card {
  border:1px solid #e2e8f0; border-radius:16px; padding:16px 18px;
  background:white; transition:all .22s;
}
.ap-insight-card:hover { border-color:#bfdbfe; box-shadow:0 6px 22px rgba(30,64,175,.07); transform:translateY(-2px); }
.ap-insight-head { display:flex; align-items:center; gap:9px; margin-bottom:10px; }
.ap-insight-icon { width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.ap-insight-label { font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em; }
.ap-insight-val { font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:700;color:#0f172a;line-height:1; }
.ap-insight-chg { font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;margin-top:4px; }
.ap-insight-chg.pos { color:#16a34a; }
.ap-insight-chg.neg { color:#dc2626; }

/* ── CHART SECTION ── */
.ap-chart-card {
  background:white; border-radius:20px; border:1px solid #e2e8f0;
  overflow:hidden; animation:apFadeUp .58s ease both;
}
.ap-chart-card:hover { box-shadow:0 10px 34px rgba(0,0,0,.06); }
.ap-chart-header { padding:20px 24px 0; }

/* ── TABLE SECTION ── */
.ap-table-card {
  background:white; border-radius:20px; border:1px solid #e2e8f0;
  overflow:hidden; animation:apFadeUp .62s ease both;
}
.ap-table-header { padding:20px 24px 0; }

/* ── SKELETON ── */
.ap-skeleton {
  background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size:600px 100%; animation:apShimmer 1.4s infinite linear; border-radius:10px;
}
.ap-skeleton-card { border-radius:20px; border:1px solid #f1f5f9; padding:24px; background:white; }

/* ── DIVIDER ── */
.ap-divider { height:1px; background:linear-gradient(90deg,transparent,#e2e8f0,transparent); }

/* ── NOTICE ── */
.ap-notice {
  display:flex; align-items:center; gap:12px;
  background:linear-gradient(135deg,#eff6ff,#f0fdf4);
  border:1px solid #bfdbfe; border-radius:14px;
  padding:14px 18px; font-size:12.5px; color:#1e40af; font-weight:500;
  animation:apSlideIn .5s ease both;
}
.ap-notice-icon {
  width:32px;height:32px;border-radius:9px;
  background:linear-gradient(135deg,#1e40af,#38bdf8);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}

/* ── BAR LOADER OVERRIDE ── */
.ap-loader { padding:4px 0; }
`;

// ═══════════════════════════════════════════════════════════════════
// §2 · HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatKes(n) {
  const v = parseFloat(n) || 0;
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `KES ${(v / 1_000).toFixed(1)}K`;
  return `KES ${v.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(n) {
  return (parseFloat(n) || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getTypeConfig(type) {
  const t = type?.toUpperCase();
  const configs = {
    SAVINGS:  { icon: <PiggyBank size={14}/>,  color: "#15803d", bg: "linear-gradient(135deg,#dcfce7,#f0fdf4)", label: "Savings" },
    CREDIT:   { icon: <CreditCard size={14}/>, color: "#9d174d", bg: "linear-gradient(135deg,#fce7f3,#fdf2f8)", label: "Credit"  },
    CURRENT:  { icon: <Landmark size={14}/>,   color: "#1e40af", bg: "linear-gradient(135deg,#dbeafe,#eff6ff)", label: "Current" },
    CHECKING: { icon: <Landmark size={14}/>,   color: "#1e40af", bg: "linear-gradient(135deg,#dbeafe,#eff6ff)", label: "Checking"},
  };
  return configs[t] ?? { icon: <Wallet size={14}/>, color: "#475569", bg: "linear-gradient(135deg,#f1f5f9,#e2e8f0)", label: type ?? "Account" };
}

// ═══════════════════════════════════════════════════════════════════
// §3 · SKELETON LOADERS
// ═══════════════════════════════════════════════════════════════════

function ChartSkeleton() {
  return (
    <div className="ap-skeleton-card">
      <div className="ap-skeleton" style={{ height:16, width:"35%", marginBottom:20 }}/>
      <div className="ap-skeleton" style={{ height:240, borderRadius:14 }}/>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="ap-skeleton-card">
      <div className="ap-skeleton" style={{ height:16, width:"30%", marginBottom:20 }}/>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ display:"flex", gap:12, marginBottom:12 }}>
          <div className="ap-skeleton" style={{ height:14, flex:1 }}/>
          <div className="ap-skeleton" style={{ height:14, width:"25%" }}/>
          <div className="ap-skeleton" style={{ height:14, width:"20%" }}/>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// §4 · PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default async function AccountPage({ params }) {

  // ✅ FIXED: params must be awaited in Next.js 15 before accessing properties
  const { id } = await params;

  // ── ORIGINAL DATA FETCH (untouched) ───────────────────────────
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) { notFound(); }
  const { transactions, ...account } = accountData;
  // ── END ORIGINAL ──────────────────────────────────────────────

  // Auth check for footer suppression
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  // Derived stats from the same transactions already fetched
  const income  = transactions.filter(t => t.type === "INCOME" ).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const net     = income - expense;
  const txCount = account._count.transactions;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

  const thisMonth     = new Date().getMonth();
  const thisYear      = new Date().getFullYear();
  const monthlyTx     = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthlyIncome  = monthlyTx.filter(t => t.type === "INCOME" ).reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthlyTx.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const typeConfig = getTypeConfig(account.type);

  const statCards = [
    { t:"ap-sc-teal",   icon:<ArrowUpRight size={15}/>,   lbl:"All-time Income",   val:formatKes(income),          sub:`${transactions.filter(t=>t.type==="INCOME").length} transactions`  },
    { t:"ap-sc-rose",   icon:<ArrowDownRight size={15}/>, lbl:"All-time Expenses",  val:formatKes(expense),         sub:`${transactions.filter(t=>t.type==="EXPENSE").length} transactions` },
    { t:"ap-sc-amber",  icon:<TrendingUp size={15}/>,     lbl:"Net Position",       val:formatKes(Math.max(net,0)), sub:`${savingsRate}% savings rate`                                      },
    { t:"ap-sc-violet", icon:<Activity size={15}/>,       lbl:"This Month Spend",   val:formatKes(monthlyExpense),  sub:`${monthlyTx.length} transactions`                                  },
    { t:"ap-sc-blue",   icon:<BarChart2 size={15}/>,      lbl:"Total Transactions", val:`${txCount}`,               sub:"All recorded entries"                                              },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }}/>

      {isLoggedIn && (
        <style>{`
          footer, [class*="footer"], [id*="footer"],
          .site-footer, body > footer,
          main ~ footer, #__next ~ footer { display:none!important; }
        `}</style>
      )}

      <div className="ap-root ap-page">

        {/* ═══════════════════════════════════════════════════════
            §4.1 · HERO BANNER
            ═══════════════════════════════════════════════════════ */}
        <div className="ap-hero">
          <div className="ap-hero-inner">

            <div className="ap-hero-left">
              <Link href="/dashboard" className="ap-breadcrumb">
                <ChevronRight size={11} style={{ transform:"rotate(180deg)" }}/> Dashboard &nbsp;/&nbsp; <span>{account.name}</span>
              </Link>

              <div className="ap-account-type-pill">
                <span style={{ display:"inline-flex", background:typeConfig.bg, borderRadius:6, padding:"2px 5px" }}>
                  {typeConfig.icon}
                </span>
                {typeConfig.label} Account
              </div>

              <h1 className="ap-account-name">
                {account.name.split("").map((ch, i) =>
                  i < Math.ceil(account.name.length / 2)
                    ? <span key={i}>{ch}</span>
                    : ch
                )}
              </h1>

              <p className="ap-account-sub">
                <Shield size={11} style={{ color:"#38bdf8" }}/>
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                &nbsp;·&nbsp; {txCount} Transactions
              </p>

              <div className="ap-actions-row" style={{ marginTop:18 }}>
                <Link href={`/transaction/create?accountId=${account.id}`} className="ap-action-btn primary">
                  <Sparkles size={13}/> Add Transaction
                </Link>
                <a href="#chart-section" className="ap-action-btn">
                  <BarChart2 size={13}/> View Chart
                </a>
                <a href="#table-section" className="ap-action-btn">
                  <Activity size={13}/> Transactions
                </a>
              </div>
            </div>

            <div className="ap-hero-right">
              <div className="ap-balance-block">
                <div className="ap-balance-label">Current Balance</div>
                <div className="ap-balance-row">
                  <span className="ap-kes-badge">KES</span>
                  <span className="ap-balance-amount">
                    {formatNumber(account.balance)}
                  </span>
                </div>
              </div>
              <div className="ap-tx-count">
                <Calendar size={11}/>
                {txCount} total transactions
              </div>
              <div className="ap-tx-count" style={{ color:"#4ECDC4", borderColor:"rgba(78,205,196,.2)", background:"rgba(78,205,196,.08)" }}>
                <TrendingUp size={11} style={{ color:"#4ECDC4" }}/>
                {savingsRate}% savings rate
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            §4.2 · QUICK STAT CARDS
            ═══════════════════════════════════════════════════════ */}
        <div className="ap-stats-row">
          {statCards.map((s, i) => (
            <div key={i} className={`ap-stat-card ${s.t}`} style={{ animationDelay:`${i*.07}s` }}>
              <div className="ap-stat-ic">{s.icon}</div>
              <div className="ap-stat-lbl">{s.lbl}</div>
              <div className="ap-stat-val">{s.val}</div>
              <div className="ap-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            §4.3 · FINANCIAL INSIGHTS ROW
            ═══════════════════════════════════════════════════════ */}
        <div className="ap-insights">
          {[
            {
              label:"Monthly Income",
              val:formatKes(monthlyIncome),
              chg:monthlyIncome > 0,
              chgLabel:monthlyIncome > 0 ? `${monthlyTx.filter(t=>t.type==="INCOME").length} this month` : "No income yet",
              bg:"linear-gradient(135deg,#dcfce7,#f0fdf4)", color:"#16a34a",
              icon:<ArrowUpRight size={15} color="#16a34a"/>,
            },
            {
              label:"Monthly Expenses",
              val:formatKes(monthlyExpense),
              chg:monthlyExpense <= expense / 12,
              chgLabel: monthlyExpense <= expense / 12 ? "Below average" : "Above average",
              bg:"linear-gradient(135deg,#fee2e2,#fff5f5)", color:"#dc2626",
              icon:<ArrowDownRight size={15} color="#dc2626"/>,
            },
            {
              label:"Net This Month",
              val:formatKes(Math.abs(monthlyIncome - monthlyExpense)),
              chg:monthlyIncome >= monthlyExpense,
              chgLabel:monthlyIncome >= monthlyExpense ? "Positive cash flow" : "Negative cash flow",
              bg:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#1e40af",
              icon:<TrendingUp size={15} color="#1e40af"/>,
            },
            {
              label:"Avg Transaction",
              val:formatKes(txCount > 0 ? expense / txCount : 0),
              chg:true,
              chgLabel:"Per transaction",
              bg:"linear-gradient(135deg,#fef3c7,#fffbeb)", color:"#b45309",
              icon:<Activity size={15} color="#b45309"/>,
            },
          ].map((ins, i) => (
            <div key={i} className="ap-insight-card" style={{ animationDelay:`${i*.06}s` }}>
              <div className="ap-insight-head">
                <div className="ap-insight-icon" style={{ background:ins.bg }}>{ins.icon}</div>
                <div className="ap-insight-label">{ins.label}</div>
              </div>
              <div className="ap-insight-val">{ins.val}</div>
              <div className={`ap-insight-chg ${ins.chg ? "pos" : "neg"}`}>
                {ins.chg ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
                {ins.chgLabel}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            §4.4 · CHART SECTION
            ═══════════════════════════════════════════════════════ */}
        <section id="chart-section">
          <div className="ap-section-head">
            <div className="ap-section-title">
              <div className="ap-section-icon" style={{ background:"linear-gradient(135deg,#1e40af,#2563eb)" }}>
                <BarChart2 size={14} color="white"/>
              </div>
              Transaction Overview
            </div>
            <span className="ap-live-badge">● Live</span>
          </div>

          <div className="ap-chart-card">
            <div className="ap-chart-header"/>
            <Suspense fallback={
              <div className="ap-loader">
                <BarLoader className="mt-4" width={"100%"} color="#1e40af"/>
                <ChartSkeleton/>
              </div>
            }>
              <AccountChart transactions={transactions}/>
            </Suspense>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            §4.5 · TRANSACTIONS TABLE
            ═══════════════════════════════════════════════════════ */}
        <section id="table-section">
          <div className="ap-section-head">
            <div className="ap-section-title">
              <div className="ap-section-icon" style={{ background:"linear-gradient(135deg,#0d9488,#14b8a6)" }}>
                <Activity size={14} color="white"/>
              </div>
              All Transactions
              <span className="ap-section-badge">{txCount}</span>
            </div>
          </div>

          <div className="ap-table-card">
            <div className="ap-table-header"/>
            <Suspense fallback={
              <div className="ap-loader">
                <BarLoader className="mt-4" width={"100%"} color="#0d9488"/>
                <TableSkeleton/>
              </div>
            }>
              <TransactionTable transactions={transactions}/>
            </Suspense>
          </div>
        </section>

        {txCount === 0 && (
          <div className="ap-notice">
            <div className="ap-notice-icon"><Wallet size={15} color="white"/></div>
            <div style={{ flex:1, lineHeight:1.5 }}>
              <strong style={{ color:"#1e3a8a", display:"block", marginBottom:1, fontSize:13 }}>No transactions yet</strong>
              Start tracking by adding your first income or expense to this account.
            </div>
          </div>
        )}

      </div>
    </>
  );
}