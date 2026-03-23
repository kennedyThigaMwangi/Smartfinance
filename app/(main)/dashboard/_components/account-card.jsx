"use client";

// ─── ORIGINAL IMPORTS (untouched) ────────────────────────────────────────────
import { ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

// ─── NEW IMPORTS ──────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Eye, EyeOff, TrendingUp, TrendingDown,
  Star, Wallet, Landmark, PiggyBank,
  ChevronRight, Shield, MoreHorizontal,
} from "lucide-react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ac-root * { box-sizing: border-box; }
  .ac-root { font-family: 'DM Sans', sans-serif; }

  /* ── KEYFRAMES ── */
  @keyframes acFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes acPop {
    0%   { transform: scale(0.9); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes acShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes acGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.25); }
    50%     { box-shadow: 0 0 20px 4px rgba(56,189,248,0.12); }
  }
  @keyframes acPulse {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.08); }
  }
  @keyframes acBadgePop {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    80%  { transform: scale(1.1) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes acSlideRight {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes acFloat {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-5px); }
  }

  /* ── CARD SHELL ── */
  .ac-card {
    border-radius: 22px;
    overflow: hidden;
    position: relative;
    transition: transform 0.28s cubic-bezier(.16,1,.3,1), box-shadow 0.28s;
    animation: acFadeUp 0.5s ease forwards;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    background: white;
  }
  .ac-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 20px 50px rgba(0,0,0,0.10);
  }
  .ac-card.is-default {
    border-color: rgba(56,189,248,0.4);
    animation: acGlow 3.5s ease-in-out infinite, acFadeUp 0.5s ease forwards;
  }

  /* top gradient strip */
  .ac-strip {
    height: 5px;
    width: 100%;
    background: linear-gradient(90deg, #1e40af, #38bdf8, #10b981);
    background-size: 200% 100%;
    animation: acShimmer 3s linear infinite;
  }

  /* ── HEADER ── */
  .ac-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 10px;
    padding: 18px 20px 10px;
  }
  .ac-header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

  .ac-type-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    transition: transform 0.25s;
  }
  .ac-card:hover .ac-type-icon { transform: rotate(-6deg) scale(1.1); }

  /* icon themes by account type */
  .ac-icon-current  { background: linear-gradient(135deg, #dbeafe, #eff6ff); color: #1e40af; }
  .ac-icon-savings  { background: linear-gradient(135deg, #dcfce7, #f0fdf4); color: #15803d; }
  .ac-icon-credit   { background: linear-gradient(135deg, #fce7f3, #fdf2f8); color: #9d174d; }
  .ac-icon-default  { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #475569; }

  .ac-name-wrap { min-width: 0; }
  .ac-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; color: #0f172a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-transform: capitalize;
  }
  .ac-type-label {
    font-size: 11px; color: #94a3b8; font-weight: 500;
    text-transform: capitalize; margin-top: 1px;
  }

  .ac-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  /* ── DEFAULT BADGE ── */
  .ac-default-badge {
    display: flex; align-items: center; gap: 4px;
    background: linear-gradient(135deg, #dbeafe, #e0f2fe);
    color: #1e40af; font-size: 10px; font-weight: 700;
    padding: 3px 9px; border-radius: 999px;
    letter-spacing: 0.04em; text-transform: uppercase;
    animation: acBadgePop 0.4s ease forwards;
    white-space: nowrap;
  }

  /* ── SWITCH WRAPPER ── */
  .ac-switch-wrap {
    display: flex; align-items: center; gap: 6px;
    background: #f8fafc; border-radius: 20px; padding: 4px 10px;
    border: 1px solid #e2e8f0; transition: background 0.2s;
  }
  .ac-switch-wrap:hover { background: #f1f5f9; }
  .ac-switch-label {
    font-size: 10px; font-weight: 600; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  /* ── BALANCE AREA ── */
  .ac-balance-area { padding: 4px 20px 12px; }
  .ac-balance-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .ac-balance {
    font-size: 1.65rem; font-weight: 700;
    color: #0f172a; line-height: 1.1;
    letter-spacing: -0.01em;
    font-family: 'DM Sans', sans-serif;
  }
  .ac-balance.hidden-bal {
    letter-spacing: 0.1em; color: #94a3b8; font-size: 1.2rem;
  }

  .ac-eye-btn {
    background: none; border: none; cursor: pointer;
    color: #94a3b8; display: flex; align-items: center;
    padding: 4px; border-radius: 6px; transition: all 0.2s;
  }
  .ac-eye-btn:hover { color: #1e40af; background: #eff6ff; }

  /* ── DIVIDER ── */
  .ac-divider {
    height: 1px; background: #f1f5f9; margin: 0 20px;
  }

  /* ── FOOTER ── */
  .ac-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px 16px; gap: 8px;
  }
  .ac-footer-stat {
    display: flex; align-items: center; gap: 6px;
    flex: 1; min-width: 0;
  }
  .ac-stat-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
  }
  .ac-stat-icon.income  { background: #dcfce7; color: #16a34a; }
  .ac-stat-icon.expense { background: #fee2e2; color: #dc2626; }

  .ac-stat-info { min-width: 0; }
  .ac-stat-label {
    font-size: 10px; color: #94a3b8; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  /* ── NORMAL number style as requested ── */
  .ac-stat-val {
    font-size: 13px; font-weight: 600;
    color: #1e293b; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .ac-stat-val.income-val  { color: #16a34a; }
  .ac-stat-val.expense-val { color: #dc2626; }

  /* footer separator */
  .ac-footer-sep {
    width: 1px; height: 32px; background: #f1f5f9; flex-shrink: 0;
  }

  /* ── VIEW LINK ── */
  .ac-view-link {
    display: flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 600; color: #1e40af;
    text-decoration: none; white-space: nowrap;
    padding: 5px 10px; border-radius: 8px;
    background: #eff6ff; transition: background 0.2s;
    flex-shrink: 0;
  }
  .ac-view-link:hover { background: #dbeafe; }

  /* ── LOADING OVERLAY ── */
  .ac-loading-overlay {
    position: absolute; inset: 0; background: rgba(255,255,255,0.7);
    display: flex; align-items: center; justify-content: center;
    border-radius: 22px; z-index: 10;
  }
  @keyframes acSpin { to { transform: rotate(360deg); } }
  .ac-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 3px solid #dbeafe; border-top-color: #1e40af;
    animation: acSpin 0.7s linear infinite;
  }

  /* ── CHIP ── */
  .ac-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 9px; border-radius: 999px; font-size: 10px;
    font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTypeIcon(type) {
  const t = type?.toUpperCase();
  if (t === "SAVINGS") return { icon: <PiggyBank size={18} />, cls: "ac-icon-savings" };
  if (t === "CREDIT")  return { icon: <CreditCard size={18} />, cls: "ac-icon-credit" };
  if (t === "CURRENT" || t === "CHECKING") return { icon: <Landmark size={18} />, cls: "ac-icon-current" };
  return { icon: <Wallet size={18} />, cls: "ac-icon-default" };
}

function formatKsh(n) {
  const num = parseFloat(n);
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AccountCard({ account }) {

  // ── ORIGINAL DESTRUCTURE (untouched) ────────────────────────────────────
  const { name, type, balance, id, isDefault } = account;

  // ── ORIGINAL FETCH HOOK (untouched) ─────────────────────────────────────
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  // ── ORIGINAL HANDLER (untouched) ────────────────────────────────────────
  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  // ── ORIGINAL EFFECTS (untouched) ────────────────────────────────────────
  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  // ── NEW STATE ────────────────────────────────────────────────────────────
  const [hideBalance, setHideBalance] = useState(false);

  // ── NEW COMPUTED VALUES ──────────────────────────────────────────────────
  const { icon: typeIcon, cls: iconCls } = getTypeIcon(type);
  const typeLabel = type
    ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    : "Account";

  // income/expense from account object if available, else show dashes
  const income  = account.totalIncome  ?? null;
  const expense = account.totalExpense ?? null;

  return (
    <div className="ac-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <Card className={`ac-card ${isDefault ? "is-default" : ""}`}>

        {/* loading overlay */}
        {updateDefaultLoading && (
          <div className="ac-loading-overlay">
            <div className="ac-spinner" />
          </div>
        )}

        {/* top shimmer strip */}
        <div className="ac-strip" />

        <Link href={`/account/${id}`} style={{ textDecoration: "none", display: "block" }}>

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="ac-header">
            <div className="ac-header-left">
              {/* type icon */}
              <div className={`ac-type-icon ${iconCls}`}>
                {typeIcon}
              </div>
              <div className="ac-name-wrap">
                <div className="ac-name">{name}</div>
                <div className="ac-type-label">{typeLabel} Account</div>
              </div>
            </div>

            <div className="ac-header-right">
              {/* default badge */}
              {isDefault && (
                <div className="ac-default-badge">
                  <Star size={9} fill="currentColor" />
                  Default
                </div>
              )}

              {/* ORIGINAL Switch — wrapped for styling */}
              <div
                className="ac-switch-wrap"
                onClick={(e) => e.preventDefault()}
              >
                <span className="ac-switch-label">Default</span>
                <Switch
                  checked={isDefault}
                  onClick={handleDefaultChange}
                  disabled={updateDefaultLoading}
                />
              </div>
            </div>
          </div>

          {/* ── BALANCE ────────────────────────────────────────────────── */}
          <div className="ac-balance-area">
            <div className="ac-balance-row">
              {/* ORIGINAL balance — normal font style as requested */}
              <span className={`ac-balance ${hideBalance ? "hidden-bal" : ""}`}>
                {hideBalance
                  ? "•••• ••••"
                  : formatKsh(balance)}
              </span>
              {/* eye toggle */}
              <button
                className="ac-eye-btn"
                onClick={(e) => { e.preventDefault(); setHideBalance((v) => !v); }}
                title={hideBalance ? "Show balance" : "Hide balance"}
              >
                {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* divider */}
          <div className="ac-divider" />

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="ac-footer">

            {/* Income stat */}
            <div className="ac-footer-stat">
              <div className="ac-stat-icon income">
                <ArrowUpRight size={14} />
              </div>
              <div className="ac-stat-info">
                <div className="ac-stat-label">Income</div>
                {/* ORIGINAL ArrowUpRight colour kept; number uses normal style */}
                <div className="ac-stat-val income-val">
                  {income !== null
                    ? (hideBalance ? "••••" : formatKsh(income))
                    : "—"}
                </div>
              </div>
            </div>

            <div className="ac-footer-sep" />

            {/* Expense stat */}
            <div className="ac-footer-stat">
              <div className="ac-stat-icon expense">
                <ArrowDownRight size={14} />
              </div>
              <div className="ac-stat-info">
                <div className="ac-stat-label">Expenses</div>
                {/* ORIGINAL ArrowDownRight colour kept; number uses normal style */}
                <div className="ac-stat-val expense-val">
                  {expense !== null
                    ? (hideBalance ? "••••" : formatKsh(expense))
                    : "—"}
                </div>
              </div>
            </div>

            <div className="ac-footer-sep" />

            {/* View link */}
            <span className="ac-view-link">
              View
              <ChevronRight size={12} />
            </span>

          </div>
        </Link>
      </Card>
    </div>
  );
}