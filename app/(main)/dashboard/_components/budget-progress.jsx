"use client";

// ─── ORIGINAL IMPORTS (untouched) ────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

// ─── NEW IMPORTS ──────────────────────────────────────────────────────────────
import {
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck,
  Flame, Zap, Target, ChevronRight, RefreshCw,
  BarChart2, Calendar, Bell,
} from "lucide-react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .bp-root * { box-sizing: border-box; }
  .bp-root { font-family: 'DM Sans', sans-serif; }

  /* ── KEYFRAMES ── */
  @keyframes bpFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bpPop {
    0%  { transform: scale(0.92); opacity: 0; }
    60% { transform: scale(1.04); }
    100%{ transform: scale(1);    opacity: 1; }
  }
  @keyframes bpBarFill {
    from { width: 0%; }
    to   { width: var(--bp-pct); }
  }
  @keyframes bpPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
    50%     { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  }
  @keyframes bpWarn {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.5; }
  }
  @keyframes bpSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes bpRingFill {
    from { stroke-dasharray: 0 999; }
    to   { stroke-dasharray: var(--bp-ring-dash) 999; }
  }
  @keyframes bpSlideRight {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes bpGlow {
    0%,100% { filter: drop-shadow(0 0 0px currentColor); }
    50%     { filter: drop-shadow(0 0 6px currentColor); }
  }
  @keyframes bpNumberRoll {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes bpShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  /* ── CARD SHELL ── */
  .bp-card {
    background: white;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: box-shadow 0.3s;
    animation: bpFadeUp 0.5s ease forwards;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }
  .bp-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.09); }

  /* ── TOP GRADIENT HEADER ── */
  .bp-header-band {
    position: relative; overflow: hidden;
    padding: 24px 24px 20px;
  }
  .bp-header-band::before {
    content: '';
    position: absolute; inset: 0;
    pointer-events: none;
  }
  .bp-header-band.safe   { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
  .bp-header-band.warn   { background: linear-gradient(135deg, #fffbeb, #fef3c7); }
  .bp-header-band.danger { background: linear-gradient(135deg, #fff1f2, #ffe4e6); }
  .bp-header-band.empty  { background: linear-gradient(135deg, #f8fafc, #f1f5f9); }

  /* decorative circles */
  .bp-deco-circle {
    position: absolute; border-radius: 50%; pointer-events: none;
  }

  .bp-header-top {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  }
  .bp-title-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
  }
  .bp-title-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .bp-title-icon.safe   { background: #d1fae5; color: #059669; }
  .bp-title-icon.warn   { background: #fef3c7; color: #d97706; }
  .bp-title-icon.danger { background: #fee2e2; color: #dc2626; animation: bpPulse 2s ease-in-out infinite; }
  .bp-title-icon.empty  { background: #f1f5f9; color: #64748b; }

  .bp-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: #0f172a;
  }

  /* ── STATUS BADGE ── */
  .bp-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 999px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
    animation: bpPop 0.4s ease forwards;
    white-space: nowrap;
  }
  .bp-status-badge.safe   { background: #dcfce7; color: #15803d; }
  .bp-status-badge.warn   { background: #fef9c3; color: #a16207; animation: bpWarn 1.8s ease-in-out infinite; }
  .bp-status-badge.danger { background: #fee2e2; color: #b91c1c; animation: bpWarn 1s ease-in-out infinite; }
  .bp-status-badge.empty  { background: #f1f5f9; color: #64748b; }

  /* ── AMOUNT DISPLAY ── */
  .bp-amounts {
    display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
    margin: 12px 0 6px;
  }
  .bp-spent {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800; line-height: 1;
    animation: bpNumberRoll 0.5s ease forwards;
    overflow: hidden;
  }
  .bp-spent.safe   { color: #059669; }
  .bp-spent.warn   { color: #d97706; }
  .bp-spent.danger { color: #dc2626; }
  .bp-spent.empty  { color: #94a3b8; }
  .bp-of-total {
    font-size: 14px; color: #64748b; font-weight: 500;
  }
  .bp-remaining {
    font-size: 12px; font-weight: 600; padding: 2px 10px;
    border-radius: 999px; margin-left: auto;
    white-space: nowrap;
  }
  .bp-remaining.safe   { background: #dcfce7; color: #15803d; }
  .bp-remaining.warn   { background: #fef9c3; color: #92400e; }
  .bp-remaining.danger { background: #fee2e2; color: #991b1b; }

  /* ── EDIT FORM ── */
  .bp-edit-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    margin-top: 12px; animation: bpSlideRight 0.3s ease forwards;
  }
  .bp-edit-input {
    height: 36px; border-radius: 10px; font-size: 14px;
    border: 1.5px solid #e2e8f0; padding: 0 12px;
    font-family: 'DM Sans', sans-serif; width: 140px;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .bp-edit-input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
  }
  .bp-edit-input:disabled { opacity: 0.5; }
  .bp-icon-btn {
    width: 34px; height: 34px; border-radius: 9px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
  }
  .bp-icon-btn.confirm { background: #dcfce7; color: #16a34a; }
  .bp-icon-btn.confirm:hover { background: #bbf7d0; transform: scale(1.08); }
  .bp-icon-btn.cancel  { background: #fee2e2; color: #dc2626; }
  .bp-icon-btn.cancel:hover  { background: #fecaca; transform: scale(1.08); }
  .bp-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .bp-edit-btn {
    background: none; border: none; cursor: pointer;
    width: 26px; height: 26px; border-radius: 7px; display: flex;
    align-items: center; justify-content: center;
    color: #94a3b8; transition: all 0.2s;
  }
  .bp-edit-btn:hover { background: rgba(0,0,0,0.06); color: #1e40af; }

  /* ── PROGRESS BAR AREA ── */
  .bp-body { padding: 20px 24px 24px; }

  .bp-track {
    height: 12px; background: #f1f5f9; border-radius: 999px;
    overflow: hidden; position: relative; margin-bottom: 10px;
  }
  .bp-fill {
    height: 100%; border-radius: 999px;
    animation: bpBarFill 1.2s cubic-bezier(.16,1,.3,1) forwards;
    position: relative; overflow: hidden;
  }
  .bp-fill::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: bpShimmer 2s ease-in-out infinite;
    background-size: 400px 100%;
  }
  .bp-fill.safe   { background: linear-gradient(90deg, #34d399, #10b981); }
  .bp-fill.warn   { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
  .bp-fill.danger { background: linear-gradient(90deg, #f87171, #ef4444); }

  /* milestone dots */
  .bp-milestones {
    position: absolute; inset: 0; display: flex; pointer-events: none;
  }
  .bp-milestone-dot {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 3px; height: 100%; background: rgba(255,255,255,0.5);
  }

  .bp-pct-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px;
  }
  .bp-pct-val {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
  }
  .bp-pct-label { font-size: 11px; color: #94a3b8; }

  /* ── MINI STAT GRID ── */
  .bp-mini-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 10px; margin-top: 16px;
  }
  .bp-mini-card {
    background: #f8fafc; border-radius: 14px; padding: 12px 14px;
    border: 1px solid #e2e8f0; transition: all 0.2s;
    animation: bpFadeUp 0.5s ease forwards;
  }
  .bp-mini-card:hover { background: #f1f5f9; transform: translateY(-2px); }
  .bp-mini-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; margin-bottom: 8px;
  }
  .bp-mini-label { font-size: 10px; color: #94a3b8; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
  .bp-mini-val {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; color: #1e293b;
  }
  .bp-mini-val.positive { color: #059669; }
  .bp-mini-val.negative { color: #dc2626; }
  .bp-mini-val.neutral  { color: #d97706; }

  /* ── ALERT BANNER ── */
  .bp-alert {
    display: flex; align-items: flex-start; gap: 10px;
    border-radius: 12px; padding: 12px 14px; margin-top: 16px;
    animation: bpSlideRight 0.5s ease forwards;
    font-size: 12px; line-height: 1.55;
  }
  .bp-alert.warn   { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
  .bp-alert.danger { background: #fff1f2; border: 1px solid #fecdd3; color: #881337; }
  .bp-alert.safe   { background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d; }
  .bp-alert-icon   { flex-shrink: 0; margin-top: 1px; }

  /* ── SET BUDGET CTA ── */
  .bp-cta {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 24px 16px; text-align: center;
  }
  .bp-cta-icon {
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    animation: bpPop 0.5s ease forwards;
  }
  .bp-cta-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700; color: #1e293b;
  }
  .bp-cta-sub { font-size: 13px; color: #64748b; max-width: 240px; }
  .bp-cta-btn {
    display: flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, #1e40af, #2563eb);
    color: white; border: none; border-radius: 12px;
    padding: 10px 22px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .bp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30,64,175,0.3); }

  /* ── LOADING SPINNER ── */
  .bp-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #38bdf8;
    animation: bpSpin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* ── RING SVG ── */
  .bp-ring { animation: bpRingFill 1.4s cubic-bezier(.16,1,.3,1) forwards; }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTheme(pct, hasBudget) {
  if (!hasBudget) return "empty";
  if (pct >= 90)  return "danger";
  if (pct >= 75)  return "warn";
  return "safe";
}

function formatKsh(n) {
  return `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getDaysLeft() {
  const now   = new Date();
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
}

function getDailyBudget(remaining, daysLeft) {
  if (daysLeft <= 0 || remaining <= 0) return 0;
  return remaining / daysLeft;
}

function RingProgress({ pct, theme, size = 64 }) {
  const r      = (size - 8) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = Math.min(pct, 100) / 100 * circ;
  const colors = { safe: "#10b981", warn: "#f59e0b", danger: "#ef4444", empty: "#e2e8f0" };
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={colors[theme]} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        className="bp-ring"
        style={{ "--bp-ring-dash": dash, transition: "stroke-dasharray 1.4s cubic-bezier(.16,1,.3,1)" }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="800" fill={colors[theme]}
        fontFamily="Syne, sans-serif">
        {Math.min(Math.round(pct), 100)}%
      </text>
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function BudgetProgress({ initialBudget, currentExpenses }) {

  // ── ORIGINAL STATE (untouched) ───────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  // ORIGINAL: percent used
  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  // ORIGINAL: update handler
  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  // ORIGINAL: cancel handler
  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  // ORIGINAL: effects
  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  // ── NEW COMPUTED VALUES ──────────────────────────────────────────────────
  const theme      = getTheme(percentUsed, !!initialBudget);
  const remaining  = initialBudget ? initialBudget.amount - currentExpenses : 0;
  const daysLeft   = getDaysLeft();
  const dailyAllow = getDailyBudget(remaining, daysLeft);
  const clampedPct = Math.min(percentUsed, 100);

  const statusLabels = {
    safe:   { icon: <ShieldCheck size={14} />, label: "On Track" },
    warn:   { icon: <AlertTriangle size={14} />, label: "Caution" },
    danger: { icon: <Flame size={14} />, label: "Over Limit!" },
    empty:  { icon: <Target size={14} />, label: "No Budget Set" },
  };
  const alertMessages = {
    warn:   `You've used ${percentUsed.toFixed(1)}% of your budget with ${daysLeft} days left. Slow down on non-essentials to finish the month safely.`,
    danger: `Budget exceeded! You're KES ${Math.abs(remaining).toFixed(2)} over your limit. Consider adjusting your budget or cutting back immediately.`,
    safe:   `Great discipline! You have ${formatKsh(remaining)} left for ${daysLeft} more days — about ${formatKsh(dailyAllow)}/day.`,
  };

  return (
    <div className="bp-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="bp-card">

        {/* ── HEADER BAND ─────────────────────────────────────────────── */}
        <div className={`bp-header-band ${theme}`}>
          {/* decorative blobs */}
          <div className="bp-deco-circle" style={{
            width: 120, height: 120, top: -40, right: -30,
            background: theme === "safe"   ? "rgba(16,185,129,0.08)"
                      : theme === "warn"   ? "rgba(245,158,11,0.08)"
                      : theme === "danger" ? "rgba(239,68,68,0.08)"
                      : "rgba(148,163,184,0.06)",
          }} />

          <div className="bp-header-top">
            {/* Title + edit form */}
            <div style={{ flex: 1 }}>
              <div className="bp-title-row">
                <div className={`bp-title-icon ${theme}`}>
                  {statusLabels[theme].icon}
                </div>
                <span className="bp-title">Monthly Budget</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                  · Default Account
                </span>
              </div>

              {isEditing ? (
                /* ── ORIGINAL edit form (enhanced styling) ── */
                <div className="bp-edit-row">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="bp-edit-input"
                    style={{ width: 140, height: 36, borderRadius: 10 }}
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button className="bp-icon-btn confirm"
                    onClick={handleUpdateBudget} disabled={isLoading}>
                    {isLoading
                      ? <div className="bp-spinner" />
                      : <Check size={14} />}
                  </button>
                  <button className="bp-icon-btn cancel"
                    onClick={handleCancel} disabled={isLoading}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="bp-amounts">
                  {/* ORIGINAL: spent display */}
                  {initialBudget ? (
                    <>
                      <span className={`bp-spent ${theme}`}>
                        {formatKsh(currentExpenses)}
                      </span>
                      <span className="bp-of-total">
                        of {formatKsh(initialBudget.amount)}
                      </span>
                      <span className={`bp-remaining ${theme}`}>
                        {remaining >= 0 ? `${formatKsh(remaining)} left` : `${formatKsh(Math.abs(remaining))} over`}
                      </span>
                    </>
                  ) : (
                    <CardDescription style={{ fontSize: 13, color: "#64748b" }}>
                      No budget set
                    </CardDescription>
                  )}
                  {/* ORIGINAL edit pencil button */}
                  <button className="bp-edit-btn"
                    onClick={() => setIsEditing(true)}
                    title="Edit budget">
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Ring progress */}
            {initialBudget && !isEditing && (
              <RingProgress pct={clampedPct} theme={theme} />
            )}

            {/* Status badge */}
            <div className={`bp-status-badge ${theme}`}
              style={{ alignSelf: "flex-start" }}>
              {statusLabels[theme].icon}
              {statusLabels[theme].label}
            </div>
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────────────── */}
        <div className="bp-body">

          {initialBudget ? (
            <>
              {/* ── PROGRESS BAR (ORIGINAL logic, enhanced visuals) ── */}
              <div className="bp-track">
                <div
                  className={`bp-fill ${theme}`}
                  style={{ "--bp-pct": `${clampedPct}%`, width: `${clampedPct}%` }}
                />
                {/* milestone markers at 25%, 50%, 75% */}
                {[25, 50, 75].map((m) => (
                  <div key={m} className="bp-milestone-dot"
                    style={{ left: `${m}%` }} />
                ))}
              </div>

              {/* pct row */}
              <div className="bp-pct-row">
                <span className={`bp-pct-val`}
                  style={{ color: theme === "safe" ? "#059669" : theme === "warn" ? "#d97706" : "#dc2626" }}>
                  {percentUsed.toFixed(1)}% used
                </span>
                <span className="bp-pct-label">
                  <Calendar size={11} style={{ display: "inline", marginRight: 3 }} />
                  {daysLeft} days remaining in {new Date().toLocaleString("default", { month: "long" })}
                </span>
              </div>

              {/* ── MINI STAT CARDS ── */}
              <div className="bp-mini-grid">
                <div className="bp-mini-card" style={{ animationDelay: "0.1s" }}>
                  <div className="bp-mini-icon" style={{ background: "#eff6ff", color: "#1e40af" }}>
                    <BarChart2 size={14} />
                  </div>
                  <div className="bp-mini-label">Daily Allowance</div>
                  <div className={`bp-mini-val ${remaining > 0 ? "positive" : "negative"}`}>
                    {formatKsh(dailyAllow)}
                  </div>
                </div>
                <div className="bp-mini-card" style={{ animationDelay: "0.18s" }}>
                  <div className="bp-mini-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <TrendingUp size={14} />
                  </div>
                  <div className="bp-mini-label">Remaining</div>
                  <div className={`bp-mini-val ${remaining >= 0 ? "positive" : "negative"}`}>
                    {formatKsh(Math.abs(remaining))}
                  </div>
                </div>
                <div className="bp-mini-card" style={{ animationDelay: "0.26s" }}>
                  <div className="bp-mini-icon" style={{ background: "#fefce8", color: "#ca8a04" }}>
                    <Zap size={14} />
                  </div>
                  <div className="bp-mini-label">Burn Rate</div>
                  <div className={`bp-mini-val ${percentUsed < 75 ? "positive" : percentUsed < 90 ? "neutral" : "negative"}`}>
                    {formatKsh(currentExpenses / Math.max(new Date().getDate(), 1))}/day
                  </div>
                </div>
              </div>

              {/* ── ALERT BANNER ── */}
              {theme !== "empty" && alertMessages[theme] && (
                <div className={`bp-alert ${theme}`}>
                  <div className="bp-alert-icon">
                    {theme === "danger" ? <Flame size={14} />
                      : theme === "warn" ? <AlertTriangle size={14} />
                      : <ShieldCheck size={14} />}
                  </div>
                  <div>{alertMessages[theme]}</div>
                </div>
              )}

              {/* ORIGINAL progress (hidden — kept for compatibility) */}
              <div style={{ display: "none" }}>
                <Progress
                  value={percentUsed}
                  extraStyles={`${
                    percentUsed >= 90 ? "bg-red-500"
                    : percentUsed >= 75 ? "bg-yellow-500"
                    : "bg-green-500"
                  }`}
                />
              </div>
            </>
          ) : (
            /* ── NO BUDGET CTA ── */
            <div className="bp-cta">
              <div className="bp-cta-icon">🎯</div>
              <div className="bp-cta-title">Set Your Monthly Budget</div>
              <div className="bp-cta-sub">
                Create a budget to track your spending, get smart alerts, and stay
                in control of your finances every month.
              </div>
              <button className="bp-cta-btn"
                onClick={() => setIsEditing(true)}>
                <Target size={14} />
                Set Budget Now
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}