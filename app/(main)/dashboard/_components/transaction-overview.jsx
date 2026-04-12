"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";

import {
  format, startOfMonth, endOfMonth, subMonths,
  startOfWeek, endOfWeek, startOfYear, endOfYear,
  startOfDay, endOfDay, subDays, eachDayOfInterval,
  isWithinInterval, differenceInDays,
} from "date-fns";

import {
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
  Eye, EyeOff, ChevronRight, ChevronLeft, Clock,
  Brain, Shield, PiggyBank, BarChart2, Calendar,
  ArrowRight, Sparkles, TrendingUp, TrendingDown,
  Search, Download, X, Bell, Zap, Award,
  Repeat, AlertCircle, Target, CheckCircle,
  AlertTriangle, Filter, RefreshCw, Star,
} from "lucide-react";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════════════
// §2 · CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const PALETTE = [
  "#38bdf8","#4ECDC4","#96CEB4","#FFEEAD",
  "#FF6B6B","#D4A5A5","#9FA8DA","#F9844A",
  "#43AA8B","#F3722C","#90BE6D","#577590",
];

const COLORS = PALETTE;

const PERIODS = [
  { key:"day",   label:"Day"   },
  { key:"week",  label:"Week"  },
  { key:"month", label:"Month" },
  { key:"year",  label:"Year"  },
];

const AI_TABS = [
  { key:"recommendations", label:"💡 Insights"     },
  { key:"predictions",     label:"🔮 Predictions"  },
  { key:"alerts",          label:"🔔 Alerts"       },
];

const GOAL_PRESETS = [
  { icon:"🛡️", name:"Emergency Fund",  multiplier:3,   color:"#38bdf8" },
  { icon:"✈️", name:"Travel Reserve",  multiplier:0.5, color:"#4ECDC4" },
  { icon:"📚", name:"Education Fund",  multiplier:2,   color:"#9FA8DA" },
  { icon:"🚗", name:"Vehicle Reserve", multiplier:4,   color:"#F9844A" },
  { icon:"🏠", name:"Home Deposit",    multiplier:12,  color:"#96CEB4" },
  { icon:"💼", name:"Business Seed",   multiplier:6,   color:"#FFEEAD" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 · STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

.dov-root*{box-sizing:border-box;-webkit-font-smoothing:antialiased}
.dov-root{font-family:'DM Sans',sans-serif;--blue:#1e40af;--sky:#38bdf8;--teal:#0d9488;--rose:#be123c;--amber:#b45309;--violet:#6d28d9;--navy:#0f2552}

@keyframes dovFadeUp   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes dovSlideIn  {from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
@keyframes dovPulse    {0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.04);opacity:.82}}
@keyframes dovShimmer  {0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes dovGlow     {0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,.28)}50%{box-shadow:0 0 22px 7px rgba(56,189,248,.11)}}
@keyframes dovBarFill  {from{width:0%}to{width:var(--tw)}}
@keyframes dovBlink    {0%,100%{opacity:1}50%{opacity:.38}}
@keyframes dovFloat    {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes dovSpin     {to{transform:rotate(360deg)}}
@keyframes dovModalIn  {from{opacity:0;transform:scale(.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes dovOverlayIn{from{opacity:0}to{opacity:1}}

.dov-auth-gate{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center;padding:40px}
.dov-auth-icon{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#dbeafe,#eff6ff);display:flex;align-items:center;justify-content:center;font-size:34px;animation:dovFloat 3s ease-in-out infinite}
.dov-auth-title{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:#0f172a}
.dov-auth-sub{font-size:14px;color:#64748b;max-width:320px;line-height:1.6}
.dov-auth-btn{background:linear-gradient(135deg,#1e40af,#2563eb);color:white;border:none;border-radius:12px;padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:8px;transition:all .25s}
.dov-auth-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(30,64,175,.3)}

.dov-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;animation:dovFadeUp .45s ease forwards}
.dov-greeting{font-family:'Syne',sans-serif;font-size:clamp(1.25rem,2.4vw,1.85rem);font-weight:800;color:#0f172a;line-height:1.2}
.dov-greeting span{background:linear-gradient(90deg,#1e40af,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dov-sub{font-size:12px;color:#64748b;margin-top:4px;display:flex;align-items:center;gap:5px}

.dov-period-tabs{display:flex;gap:3px;background:#f1f5f9;border-radius:10px;padding:3px}
.dov-tab{padding:6px 13px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .18s;color:#64748b;background:transparent;font-family:'DM Sans',sans-serif;white-space:nowrap}
.dov-tab.active{background:white;color:#1e40af;box-shadow:0 1px 4px rgba(0,0,0,.09)}
.dov-tab:hover:not(.active){color:#1e40af}

.dov-stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:13px;margin-bottom:22px}
.dov-stat-card{border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;transition:transform .22s,box-shadow .22s;animation:dovFadeUp .5s ease both;cursor:default}
.dov-stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.13)}
.dov-stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);pointer-events:none}
.dov-sc-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;margin-bottom:11px;color:white}
.dov-sc-label{font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;margin-bottom:5px;opacity:.75}
.dov-kes-amount{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:700;line-height:1.1;margin-bottom:5px;color:inherit}
.dov-sc-change{font-size:10.5px;font-weight:600;display:flex;align-items:center;gap:4px;color:rgba(255,255,255,.72)}
.dov-sc-blue  {background:linear-gradient(135deg,#1e40af,#2563eb);color:white}
.dov-sc-teal  {background:linear-gradient(135deg,#0d9488,#14b8a6);color:white}
.dov-sc-rose  {background:linear-gradient(135deg,#be123c,#e11d48);color:white}
.dov-sc-amber {background:linear-gradient(135deg,#b45309,#d97706);color:white}
.dov-sc-violet{background:linear-gradient(135deg,#6d28d9,#7c3aed);color:white}
.dov-sc-navy  {background:linear-gradient(135deg,#0f2552,#1e3a8a);color:white}

.dov-main-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.dov-full-row{grid-column:1/-1}
@media(max-width:768px){.dov-main-grid{grid-template-columns:1fr}.dov-full-row{grid-column:1}}

.dov-card{background:white;border-radius:18px;border:1px solid #e2e8f0;overflow:hidden;transition:box-shadow .22s;animation:dovFadeUp .55s ease both}
.dov-card:hover{box-shadow:0 10px 36px rgba(0,0,0,.07)}
.dov-card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0;flex-wrap:wrap;gap:8px}
.dov-card-title{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:7px}
.dov-title-dot{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#1e40af);flex-shrink:0;animation:dovPulse 2.2s ease-in-out infinite}

.dov-dark-card{background:linear-gradient(135deg,#0a1628,#0f2552);border-radius:18px;overflow:hidden;border:1px solid rgba(56,189,248,.11);animation:dovFadeUp .6s ease both}
.dov-dark-header{padding:20px 24px 10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.dov-dark-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:white;display:flex;align-items:center;gap:7px}
.dov-live-badge{font-size:10.5px;padding:3px 9px;border-radius:999px;font-weight:700;background:rgba(56,189,248,.14);color:#38bdf8;animation:dovBlink 2.5s ease-in-out infinite}

.dov-tx-row{display:flex;align-items:center;justify-content:space-between;padding:9px 20px;border-radius:11px;transition:background .17s;animation:dovSlideIn .38s ease both}
.dov-tx-row:hover{background:#f8fafc}
.dov-tx-icon{width:33px;height:33px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-right:11px}
.dov-tx-icon.income{background:#dcfce7;color:#16a34a}
.dov-tx-icon.expense{background:#fee2e2;color:#dc2626}
.dov-tx-desc{font-size:12.5px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
.dov-tx-date{font-size:10.5px;color:#94a3b8;margin-top:1px}
.dov-tx-amount{font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;white-space:nowrap}
.dov-tx-amount.income{color:#16a34a}
.dov-tx-amount.expense{color:#dc2626}
.dov-tx-cat-pill{font-size:9.5px;font-weight:600;padding:2px 7px;border-radius:999px;background:#f1f5f9;color:#64748b;margin-top:2px;display:inline-block}

.dov-cat-row{padding:7px 20px}
.dov-cat-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.dov-cat-name{font-size:11.5px;font-weight:500;color:#374151}
.dov-cat-amt{font-size:11.5px;font-weight:700;color:#1e293b;font-family:'DM Sans',sans-serif}
.dov-cat-track{height:5px;background:#f1f5f9;border-radius:999px;overflow:hidden}
.dov-cat-fill{height:100%;border-radius:999px;animation:dovBarFill 1s cubic-bezier(.16,1,.3,1) both}

.dov-budget-row{padding:8px 20px;border-radius:10px;transition:background .15s}
.dov-budget-row:hover{background:#fafafa}
.dov-budget-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
.dov-budget-name{font-size:12px;font-weight:500;color:#1e293b}
.dov-budget-vals{font-size:11px;color:#64748b;font-family:'DM Sans',sans-serif}
.dov-budget-track{height:6px;background:#f1f5f9;border-radius:999px;overflow:hidden}
.dov-budget-fill{height:100%;border-radius:999px;animation:dovBarFill 1.1s cubic-bezier(.16,1,.3,1) both;transition:background .3s}

.dov-alert-item{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:12px;margin-bottom:8px;animation:dovSlideIn .4s ease both;border:1px solid transparent}
.dov-alert-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:1px}
.dov-alert-title{font-size:12.5px;font-weight:600;color:#1e293b;margin-bottom:3px}
.dov-alert-body{font-size:11.5px;color:#64748b;line-height:1.5}
.dov-alert-kes{font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;margin-top:4px}
.dov-alert-critical{background:#fff5f5;border-color:#fecaca}
.dov-alert-warning {background:#fffbeb;border-color:#fde68a}
.dov-alert-info    {background:#eff6ff;border-color:#bfdbfe}
.dov-alert-success {background:#f0fdf4;border-color:#bbf7d0}

.dov-rec-tx-row{display:flex;align-items:center;justify-content:space-between;padding:9px 20px;border-radius:10px;transition:background .15s;animation:dovSlideIn .38s ease both}
.dov-rec-tx-row:hover{background:#f8fafc}
.dov-rec-tx-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(30,64,175,.08));display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-right:10px}
.dov-rec-tx-name{font-size:12.5px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
.dov-rec-tx-freq{font-size:10.5px;color:#94a3b8;margin-top:1px}
.dov-rec-tx-amt{font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;color:#1e40af}

.dov-goals-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:14px 20px}
@media(max-width:700px){.dov-goals-grid{grid-template-columns:1fr 1fr}}
.dov-goal-card{border-radius:13px;border:1px solid #e2e8f0;padding:14px 16px;transition:all .2s;animation:dovFadeUp .5s ease both}
.dov-goal-card:hover{border-color:#bfdbfe;box-shadow:0 4px 18px rgba(30,64,175,.07);transform:translateY(-2px)}
.dov-goal-icon{font-size:20px;margin-bottom:8px}
.dov-goal-name{font-size:11.5px;font-weight:600;color:#1e293b;margin-bottom:4px}
.dov-goal-target{font-size:10.5px;color:#64748b;font-family:'DM Sans',sans-serif}
.dov-goal-track{height:4px;background:#f1f5f9;border-radius:999px;overflow:hidden;margin-top:8px}
.dov-goal-fill{height:100%;border-radius:999px;animation:dovBarFill 1.2s cubic-bezier(.16,1,.3,1) both}
.dov-goal-pct{font-size:10px;font-weight:700;margin-top:4px}

.dov-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;padding:14px 20px}
.dov-cal-day{aspect-ratio:1;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:rgba(255,255,255,.8);cursor:default;transition:transform .15s}
.dov-cal-day:hover{transform:scale(1.25);z-index:1}
.dov-cal-label{font-size:9px;font-weight:700;color:#94a3b8;text-align:center;padding-bottom:4px;text-transform:uppercase;letter-spacing:.06em}
.dov-cal-legend{display:flex;align-items:center;gap:6px;padding:0 20px 14px;font-size:10.5px;color:#94a3b8}

.dov-compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px 20px}
.dov-compare-col{border-radius:12px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0}
.dov-compare-col.current{background:linear-gradient(135deg,#eff6ff,#dbeafe);border-color:#bfdbfe}
.dov-compare-head{font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px}
.dov-compare-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.dov-compare-label{font-size:11.5px;color:#475569}
.dov-compare-val{font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif}
.dov-compare-delta{font-size:10.5px;font-weight:600;display:flex;align-items:center;gap:3px;margin-top:2px}

.dov-ai-section{background:linear-gradient(135deg,#0a1628,#1e3a5f);border-radius:18px;padding:24px 26px;border:1px solid rgba(56,189,248,.14);animation:dovFadeUp .65s ease both}
.dov-ai-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;flex-wrap:wrap}
.dov-ai-brain{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#1e40af,#38bdf8);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;animation:dovGlow 3s ease-in-out infinite}
.dov-ai-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:white}
.dov-ai-sub{font-size:12px;color:#64748b;margin-top:2px}
.dov-ai-tabs-row{display:flex;gap:7px;margin-bottom:20px;flex-wrap:wrap}
.dov-ai-tab{padding:7px 16px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.1);transition:all .18s;color:#64748b;background:transparent;font-family:'DM Sans',sans-serif}
.dov-ai-tab.active{background:rgba(56,189,248,.18);color:#38bdf8;border-color:rgba(56,189,248,.38)}
.dov-ai-tab:hover:not(.active){color:#94a3b8;border-color:rgba(255,255,255,.14)}

.dov-health-box{display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.04);border-radius:13px;padding:14px 18px;border:1px solid rgba(255,255,255,.07);flex-wrap:wrap;margin-left:auto}
.dov-health-num{font-family:'Syne',sans-serif;font-size:2.7rem;font-weight:800;line-height:1}
.dov-health-lbl{font-size:10.5px;color:#64748b;margin-top:2px}
.dov-health-bars{flex:1;min-width:180px;display:flex;flex-direction:column;gap:7px}
.dov-hbar{display:flex;align-items:center;gap:9px}
.dov-hbar-name{font-size:10.5px;color:#94a3b8;width:110px;flex-shrink:0}
.dov-hbar-track{flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:999px}
.dov-hbar-fill{height:100%;border-radius:999px;transition:width 1.1s ease}
.dov-hbar-val{font-size:10.5px;font-weight:700;color:white;width:30px;text-align:right;flex-shrink:0}

.dov-rec-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px}
@media(max-width:900px){.dov-rec-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.dov-rec-grid{grid-template-columns:1fr}}
.dov-rec-card{border-radius:13px;padding:15px 16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04);transition:all .22s;animation:dovFadeUp .5s ease both}
.dov-rec-card:hover{background:rgba(255,255,255,.07);border-color:rgba(56,189,248,.24);transform:translateY(-2px)}
.dov-rec-icon{width:33px;height:33px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;margin-bottom:11px}
.dov-rec-badge{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}
.dov-rec-title{font-size:12.5px;font-weight:600;color:white;margin-bottom:5px;line-height:1.35}
.dov-rec-body{font-size:11.5px;color:#94a3b8;line-height:1.55}
.dov-rec-kes{font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;margin-top:9px}
.p-high  {background:rgba(239,68,68,.12);color:#f87171}
.p-medium{background:rgba(245,158,11,.12);color:#fbbf24}
.p-low   {background:rgba(16,185,129,.12);color:#34d399}
.p-info  {background:rgba(56,189,248,.12);color:#38bdf8}

.dov-predict-list{display:flex;flex-direction:column;gap:0}
.dov-predict-row{display:flex;align-items:flex-start;gap:14px;padding:13px 0;position:relative}
.dov-predict-row+.dov-predict-row::before{content:'';position:absolute;top:0;left:19px;width:1px;height:13px;background:linear-gradient(to bottom,rgba(56,189,248,.28),transparent)}
.dov-predict-bullet{width:38px;height:38px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}
.dov-predict-horizon{font-size:9.5px;color:#38bdf8;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
.dov-predict-title{font-size:12.5px;font-weight:600;color:white;margin-bottom:3px}
.dov-predict-body{font-size:11.5px;color:#94a3b8;line-height:1.55}
.dov-predict-kes{font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:700;margin-top:4px}

.dov-modal-overlay{position:fixed;inset:0;background:rgba(10,22,40,.78);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px;animation:dovOverlayIn .22s ease forwards;overflow-y:auto}
.dov-modal{background:white;border-radius:22px;width:100%;max-width:860px;overflow:hidden;animation:dovModalIn .3s cubic-bezier(.16,1,.3,1) forwards;max-height:90vh;display:flex;flex-direction:column}
.dov-modal-head{padding:22px 26px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;flex-shrink:0}
.dov-modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#0f172a}
.dov-modal-close{width:34px;height:34px;border-radius:9px;border:none;background:#f1f5f9;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .17s;color:#64748b;flex-shrink:0}
.dov-modal-close:hover{background:#e2e8f0;color:#1e293b}
.dov-modal-filters{padding:16px 26px;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;flex-wrap:wrap;flex-shrink:0}
.dov-modal-search{flex:1;min-width:180px;border:1px solid #e2e8f0;border-radius:10px;padding:8px 14px 8px 36px;font-size:13px;font-family:'DM Sans',sans-serif;color:#1e293b;outline:none;transition:border .17s;background:#fafafa}
.dov-modal-search:focus{border-color:#38bdf8;background:white}
.dov-modal-search-wrap{position:relative;flex:1;min-width:180px}
.dov-modal-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
.dov-modal-select{border:1px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:12px;font-family:'DM Sans',sans-serif;color:#374151;outline:none;background:#fafafa;cursor:pointer;transition:border .17s}
.dov-modal-select:focus{border-color:#38bdf8}
.dov-modal-body{overflow-y:auto;flex:1}
.dov-modal-table{width:100%;border-collapse:collapse}
.dov-modal-table th{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;padding:10px 26px;text-align:left;background:#fafafa;border-bottom:1px solid #f1f5f9;white-space:nowrap}
.dov-modal-table td{padding:11px 26px;border-bottom:1px solid #f8fafc;font-size:12.5px;color:#1e293b}
.dov-modal-table tr:hover td{background:#fafafa}
.dov-modal-table tr:last-child td{border-bottom:none}
.dov-modal-footer{padding:14px 26px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:#fafafa;flex-shrink:0}
.dov-modal-page-btn{padding:6px 12px;border-radius:8px;border:1px solid #e2e8f0;background:white;font-size:12px;font-weight:600;color:#374151;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.dov-modal-page-btn:hover:not(:disabled){border-color:#38bdf8;color:#1e40af}
.dov-modal-page-btn:disabled{opacity:.45;cursor:not-allowed}
.dov-modal-page-info{font-size:12px;color:#64748b;font-weight:500}
.dov-modal-export{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;border:none;background:linear-gradient(135deg,#1e40af,#2563eb);color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
.dov-modal-export:hover{box-shadow:0 4px 14px rgba(30,64,175,.3);transform:translateY(-1px)}

.dov-view-all{display:flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:#1e40af;text-decoration:none;padding:5px 12px;border-radius:8px;background:#eff6ff;transition:background .17s;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}
.dov-view-all:hover{background:#dbeafe}
.dov-balance-toggle{background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;padding:0;transition:color .17s}
.dov-balance-toggle:hover{color:#38bdf8}
.dov-empty{text-align:center;padding:36px 20px;color:#94a3b8;font-size:12.5px}
.dov-empty-icon{font-size:30px;margin-bottom:9px;opacity:.7}
.dov-ring-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center}
.dov-ring-lbl{position:absolute;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:#1e40af}
.dov-section-divider{height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:20px 0}
.dov-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.04em}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// §4 · UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function fKes(n) {
  const v = Math.abs(parseFloat(n) || 0);
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `KES ${(v / 1_000).toFixed(1)}K`;
  return `KES ${v.toFixed(2)}`;
}

function getPeriodRange(period) {
  const now = new Date();
  switch (period) {
    case "day":   return { start: startOfDay(now),   end: endOfDay(now)   };
    case "week":  return { start: startOfWeek(now),  end: endOfWeek(now)  };
    case "year":  return { start: startOfYear(now),  end: endOfYear(now)  };
    default:      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

function periodLabel(period) {
  return { day:"Today", week:"This Week", month:"This Month", year:"This Year" }[period] ?? "This Period";
}

function downloadCSV(rows, filename = "transactions.csv") {
  const header = ["Date","Description","Category","Type","Amount (KES)"];
  const lines  = [
    header.join(","),
    ...rows.map(t => [
      format(new Date(t.date), "yyyy-MM-dd"),
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.category || "",
      t.type,
      t.amount.toFixed(2),
    ].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 · DATA ENGINES
// ═══════════════════════════════════════════════════════════════════════════════

function buildTrendData(txs) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { label: format(d, "MMM"), start: startOfMonth(d), end: endOfMonth(d), income: 0, expense: 0 };
  });
  txs.forEach(t => {
    const d = new Date(t.date);
    const b = months.find(m => d >= m.start && d <= m.end);
    if (!b) return;
    if (t.type === "INCOME")  b.income  += t.amount;
    if (t.type === "EXPENSE") b.expense += t.amount;
  });
  return months.map(({ label, income, expense }) => ({ label, income, expense, net: income - expense }));
}

function buildWeeklyData(txs) {
  const days   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = Array(7).fill(0);
  txs.filter(t => t.type === "EXPENSE")
     .forEach(t => { totals[new Date(t.date).getDay()] += t.amount; });
  return days.map((d, i) => ({ day: d, amount: totals[i] }));
}

function buildHeatmapData(txs, days = 28) {
  const today = new Date();
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
  return range.map(day => {
    const total = txs
      .filter(t => t.type === "EXPENSE" && isWithinInterval(new Date(t.date), { start: startOfDay(day), end: endOfDay(day) }))
      .reduce((s, t) => s + t.amount, 0);
    return { date: day, total, label: format(day, "d") };
  });
}

function detectRecurring(txs) {
  const map = {};
  txs.forEach(t => {
    const key = `${(t.description || "").trim().toLowerCase()}|${t.type}`;
    if (!map[key]) map[key] = [];
    const month = format(new Date(t.date), "yyyy-MM");
    if (!map[key].includes(month)) map[key].push(month);
    map[key].push({ ...t, _monthKey: month });
  });
  const result = [];
  Object.entries(map).forEach(([key, entries]) => {
    const months = entries.filter(e => typeof e === "string");
    if (months.length >= 2) {
      const txList = entries.filter(e => typeof e !== "string");
      const avg = txList.reduce((s, t) => s + t.amount, 0) / txList.length;
      result.push({ description: txList[0]?.description || key.split("|")[0], type: txList[0]?.type, avgAmount: avg, count: months.length, category: txList[0]?.category });
    }
  });
  return result.sort((a, b) => b.avgAmount - a.avgAmount).slice(0, 6);
}

function buildBudgets(txs, currentMonthExpenses) {
  const cutoff = subMonths(startOfMonth(new Date()), 3);
  const historical = txs.filter(t => t.type === "EXPENSE" && new Date(t.date) >= cutoff);
  const catAvg = {};
  historical.forEach(t => { if (!catAvg[t.category]) catAvg[t.category] = []; catAvg[t.category].push(t.amount); });
  return Object.entries(catAvg).map(([cat, amounts]) => {
    const avg     = amounts.reduce((s, v) => s + v, 0) / 3;
    const current = currentMonthExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    const pct     = avg > 0 ? Math.round((current / avg) * 100) : 0;
    return { cat, budget: Math.round(avg * 1.1), current, pct: Math.min(pct, 150) };
  }).sort((a, b) => b.pct - a.pct).slice(0, 6);
}

function buildAlerts(savingsRate, budgets, expTrend, topCat, income, expense) {
  const alerts = [];
  if (savingsRate < 10)
    alerts.push({ level:"critical", icon:"🚨", title:"Critical: Savings Rate Below 10%", body:`You're only saving ${savingsRate}% of income. Cut non-essential spending immediately.`, kes:null });
  if (savingsRate >= 20)
    alerts.push({ level:"success", icon:"🏆", title:"Excellent Savings Rate", body:`${savingsRate}% savings rate puts you in the top tier. Consider investing surplus.`, kes:null });
  const overBudget = budgets.filter(b => b.pct > 100);
  overBudget.slice(0, 2).forEach(b =>
    alerts.push({ level:"warning", icon:"⚠️", title:`Budget Exceeded: ${b.cat}`, body:`Spending is ${b.pct}% of your typical monthly average.`, kes:`Over by ${fKes(b.current - b.budget)}` }));
  if (expTrend > income * 0.05)
    alerts.push({ level:"warning", icon:"📈", title:"Expenses Rising", body:"Your expenses increased significantly compared to last month.", kes:null });
  if (income > 0 && expense / income > 0.9)
    alerts.push({ level:"critical", icon:"🔥", title:"High Expense Ratio", body:`Expenses are ${Math.round((expense/income)*100)}% of income. You need an immediate spending audit.`, kes:null });
  if (alerts.length === 0)
    alerts.push({ level:"info", icon:"✅", title:"Finances On Track", body:"No critical alerts this period. Keep maintaining your spending discipline.", kes:null });
  return alerts.slice(0, 5);
}

function computeHealthScore(income, expense, savingsRate, txCount) {
  let s = 100;
  if (savingsRate < 10) s -= 30; else if (savingsRate < 20) s -= 15;
  const r = income > 0 ? expense / income : 1;
  if (r > 0.9) s -= 25; else if (r > 0.75) s -= 12;
  if (txCount < 5) s -= 10;
  return Math.max(10, Math.min(100, Math.round(s)));
}

function genRecs(income, expense, savingsRate, cats, trend, daysLeft) {
  const net    = income - expense;
  const burn   = expense / Math.max(new Date().getDate(), 1);
  const topCat = cats[0];
  const last2  = trend.slice(-2);
  const expTrend = last2.length === 2 ? last2[1].expense - last2[0].expense : 0;
  const recs   = [];
  if (savingsRate < 10)
    recs.push({ icon:"💡", p:"high",   badge:"Critical",    title:"Savings rate critically low",        body:`Only ${savingsRate}% saved. Cut one major category and automate ${fKes(income*.05)}/month.`, kes:`Target: ${fKes(income*.20)}/month` });
  else if (savingsRate < 20)
    recs.push({ icon:"📈", p:"medium", badge:"Opportunity", title:"Grow savings from good to great",    body:`${savingsRate}% is decent. Pushing to 20-30% builds a 6-month cushion much faster.`,         kes:`Add ${fKes((income*.20)-net)} more/month` });
  else
    recs.push({ icon:"🏆", p:"low",    badge:"Excellent",   title:"Strong savings — consider investing",body:`${savingsRate}% savings rate. Allocate 30% of surplus to a unit trust or SACCO.`,            kes:`Investable: ${fKes(net)}` });
  if (topCat && topCat.pct > 30)
    recs.push({ icon:"⚠️", p:"high",   badge:"Overspend",   title:`${topCat.name} at ${topCat.pct}% of expenses`, body:`High concentration. Cap it at 25% to free up cash flow.`, kes:`Potential saving: ${fKes(topCat.val*.15)}/month` });
  if (expTrend > income * 0.05)
    recs.push({ icon:"🔺", p:"medium", badge:"Rising Costs",title:"Expenses trending upward",           body:`Expenses rose by ${fKes(expTrend)} last month.`,                                           kes:`Burn rate: ${fKes(burn)}/day` });
  recs.push({ icon:"🛡️", p:"medium",  badge:"Safety Net",  title:"Build a 3-month emergency fund",     body:`You need ${fKes(expense*3)} in an accessible account. Automate ${fKes(income*.05)}/month.`,kes:`Goal: ${fKes(expense*3)}` });
  recs.push({ icon:"📅", p:"info",     badge:"Month Plan",  title:`${daysLeft} days left — finish strong`,body:`Daily allowance remaining: ${fKes(net/Math.max(daysLeft,1))}.`,                          kes:null });
  if (savingsRate > 15)
    recs.push({ icon:"🚀", p:"info",   badge:"Invest",      title:"Put idle savings to work",           body:`Allocate ${fKes(net*.3)}/month to a diversified portfolio.`,                               kes:`5-yr at 12% p.a: ${fKes(net*.3*12*5*1.12)}` });
  return recs.slice(0, 6);
}

function genPredictions(income, expense, trend, savingsRate, topCat) {
  const avgI   = trend.reduce((s, m) => s + m.income, 0) / Math.max(trend.filter(m => m.income > 0).length, 1);
  const avgE   = trend.reduce((s, m) => s + m.expense, 0) / Math.max(trend.filter(m => m.expense > 0).length, 1);
  const growth = avgI > 0 ? ((income - avgI) / avgI) * 100 : 0;
  return [
    { emoji:"📊", horizon:"Next 30 Days",    title:"Projected Net Position",      body:`Based on 6-month averages: earn ~${fKes(avgI)}, spend ~${fKes(avgE)}.`,                                          kes:fKes(avgI-avgE),         positive:avgI>avgE },
    { emoji:"📈", horizon:"Next Quarter",    title:"Income Trajectory",           body:growth>5?`Income grew ${growth.toFixed(1)}% — projected ${fKes(avgI*1.05*3)} over 3 months.`:`Income stable at ~${fKes(avgI)}/month.`, kes:fKes(avgI*3), positive:growth>=0 },
    { emoji:"🏦", horizon:"6-Month Savings", title:"Emergency Fund Milestone",    body:`At ${savingsRate}% you'll accumulate ${fKes((income-expense)*6)} in 6 months.`,                                  kes:fKes((income-expense)*6), positive:savingsRate>=15 },
    { emoji:"⚡", horizon:"Risk Alert",      title:topCat?`${topCat.name} Risk`:"Spending Risk", body:topCat?`If ${topCat.name} grows 5%/month it costs an extra ${fKes(topCat.val*.05*6)} over 6 months.`:"Diversify categories to reduce risk.", kes:topCat?fKes(topCat.val*.05*6):null, positive:false },
    { emoji:"🌱", horizon:"1-Year Wealth",   title:"Annualised Net Worth Growth", body:`Maintaining discipline adds ~${fKes((income-expense)*12)} to net worth this year.`,                               kes:fKes((income-expense)*12),positive:income>expense },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 · ATOMIC UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ProgressRing({ pct, color, size = 52 }) {
  const r = (size - 6) / 2, circ = 2 * Math.PI * r, dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="dov-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)" }}/>
      </svg>
      <div className="dov-ring-lbl">{pct}%</div>
    </div>
  );
}

function EmptyState({ icon = "📭", message = "No data available" }) {
  return (
    <div className="dov-empty">
      <div className="dov-empty-icon">{icon}</div>
      {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 · VIEW-ALL TRANSACTIONS MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 25;

function ViewAllModal({ transactions, onClose, hideBalance }) {
  const [search, setSearch] = useState("");
  const [typeF,  setTypeF]  = useState("ALL");
  const [catF,   setCatF]   = useState("ALL");
  const [sortF,  setSortF]  = useState("newest");
  const [page,   setPage]   = useState(1);

  const categories = useMemo(() => {
    const s = new Set(transactions.map(t => t.category).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search.trim())   list = list.filter(t => (t.description||"").toLowerCase().includes(search.toLowerCase()) || (t.category||"").toLowerCase().includes(search.toLowerCase()));
    if (typeF !== "ALL") list = list.filter(t => t.type === typeF);
    if (catF  !== "ALL") list = list.filter(t => t.category === catF);
    list.sort((a, b) => {
      if (sortF === "newest")  return new Date(b.date) - new Date(a.date);
      if (sortF === "oldest")  return new Date(a.date) - new Date(b.date);
      if (sortF === "highest") return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return list;
  }, [transactions, search, typeF, catF, sortF]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalIncome  = filtered.filter(t => t.type === "INCOME" ).reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="dov-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dov-modal">
        <div className="dov-modal-head">
          <div>
            <div className="dov-modal-title">All Transactions</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>
              {filtered.length} records ·{" "}
              <span style={{ color:"#16a34a", fontWeight:700 }}>{fKes(totalIncome)}</span> in ·{" "}
              <span style={{ color:"#dc2626", fontWeight:700 }}>{fKes(totalExpense)}</span> out
            </div>
          </div>
          <button className="dov-modal-close" onClick={onClose}><X size={16}/></button>
        </div>

        <div className="dov-modal-filters">
          <div className="dov-modal-search-wrap">
            <Search size={13} className="dov-modal-search-icon"/>
            <input className="dov-modal-search" placeholder="Search by description or category…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="dov-modal-select" value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }}>
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select className="dov-modal-select" value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }}>
            {categories.map(c => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
          </select>
          <select className="dov-modal-select" value={sortF} onChange={e => setSortF(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        <div className="dov-modal-body">
          {pageRows.length === 0 ? (
            <EmptyState icon="🔍" message="No transactions match your filters"/>
          ) : (
            <table className="dov-modal-table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category</th><th>Type</th>
                  <th style={{ textAlign:"right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((t, i) => (
                  <tr key={t.id || i}>
                    <td style={{ color:"#64748b", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                      {format(new Date(t.date), "dd MMM yyyy")}
                    </td>
                    <td style={{ fontWeight:500 }}>{t.description || "Untitled"}</td>
                    <td>
                      <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:999, background:"#f1f5f9", color:"#475569", fontWeight:600 }}>
                        {t.category || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:999, fontWeight:700, background:t.type==="INCOME"?"#dcfce7":"#fee2e2", color:t.type==="INCOME"?"#16a34a":"#dc2626" }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ textAlign:"right", fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:t.type==="INCOME"?"#16a34a":"#dc2626" }}>
                      {t.type==="INCOME"?"+":"−"}{hideBalance ? "••••" : fKes(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dov-modal-footer">
          <button className="dov-modal-export" onClick={() => downloadCSV(filtered)}>
            <Download size={13}/> Export CSV
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button className="dov-modal-page-btn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={currentPage===1}>
              <ChevronLeft size={13} style={{ display:"inline" }}/>
            </button>
            <span className="dov-modal-page-info">Page {currentPage} of {totalPages}</span>
            <button className="dov-modal-page-btn" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>
              <ChevronRight size={13} style={{ display:"inline" }}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 · BUDGET PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function BudgetPanel({ budgets, hideBalance }) {
  if (!budgets.length) return <EmptyState icon="📊" message="Not enough history to compute budgets"/>;
  return (
    <div style={{ padding:"12px 0 8px" }}>
      {budgets.map((b, i) => {
        const over  = b.pct > 100;
        const warn  = b.pct > 80;
        const color = over ? "#ef4444" : warn ? "#f59e0b" : "#4ECDC4";
        return (
          <div key={b.cat} className="dov-budget-row" style={{ animationDelay:`${i*.07}s` }}>
            <div className="dov-budget-meta">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }}/>
                <span className="dov-budget-name">{b.cat}</span>
                {over && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:999, background:"#fef2f2", color:"#ef4444", fontWeight:700 }}>OVER</span>}
              </div>
              <span className="dov-budget-vals">
                {hideBalance ? "••••" : fKes(b.current)} / {hideBalance ? "••••" : fKes(b.budget)}
              </span>
            </div>
            <div className="dov-budget-track">
              <div className="dov-budget-fill" style={{ "--tw":`${Math.min(b.pct,100)}%`, width:`${Math.min(b.pct,100)}%`, background:color }}/>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize:10.5, color:"#94a3b8", padding:"8px 20px", borderTop:"1px solid #f1f5f9", marginTop:6 }}>
        Budgets auto-computed from your 3-month category averages ×1.1
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 · RECURRING PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function RecurringPanel({ recurring, hideBalance }) {
  if (!recurring.length) return <EmptyState icon="🔄" message="No recurring patterns detected yet"/>;
  return (
    <div style={{ padding:"10px 0 6px" }}>
      {recurring.map((r, i) => (
        <div key={i} className="dov-rec-tx-row" style={{ animationDelay:`${i*.06}s` }}>
          <div style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
            <div className="dov-rec-tx-icon"><Repeat size={13} color="#38bdf8"/></div>
            <div style={{ minWidth:0 }}>
              <div className="dov-rec-tx-name">{r.description || "Recurring transaction"}</div>
              <div className="dov-rec-tx-freq">Detected {r.count}× · {r.category || "Uncategorised"}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="dov-rec-tx-amt">
              {hideBalance ? "••••" : fKes(r.avgAmount)}
              <span style={{ fontSize:9, color:"#94a3b8", fontWeight:500 }}>/mo</span>
            </div>
            <span style={{ fontSize:10, padding:"2px 6px", borderRadius:999, background:r.type==="INCOME"?"#dcfce7":"#fee2e2", color:r.type==="INCOME"?"#16a34a":"#dc2626", fontWeight:700 }}>
              {r.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 · COMPARISON PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function ComparisonPanel({ txs, hideBalance }) {
  const now     = new Date();
  const cmStart = startOfMonth(now), cmEnd = endOfMonth(now);
  const pmStart = startOfMonth(subMonths(now,1)), pmEnd = endOfMonth(subMonths(now,1));
  const cm = txs.filter(t => { const d = new Date(t.date); return d >= cmStart && d <= cmEnd; });
  const pm = txs.filter(t => { const d = new Date(t.date); return d >= pmStart && d <= pmEnd; });
  const stats = type => ({
    current: cm.filter(t => t.type === type).reduce((s,t) => s+t.amount, 0),
    prev:    pm.filter(t => t.type === type).reduce((s,t) => s+t.amount, 0),
  });
  const inc = stats("INCOME"), exp = stats("EXPENSE");
  const incDelta  = inc.prev > 0 ? ((inc.current - inc.prev) / inc.prev * 100) : 0;
  const expDelta  = exp.prev > 0 ? ((exp.current - exp.prev) / exp.prev * 100) : 0;
  const netCurrent = inc.current - exp.current, netPrev = inc.prev - exp.prev;
  const netDelta  = netPrev > 0 ? ((netCurrent - netPrev) / netPrev * 100) : 0;

  const Row = ({ label, current, prev, delta, positive }) => (
    <div className="dov-compare-row">
      <span className="dov-compare-label">{label}</span>
      <div style={{ textAlign:"right" }}>
        <div className="dov-compare-val" style={{ color:positive?"#16a34a":"#dc2626" }}>
          {hideBalance ? "••••" : fKes(current)}
        </div>
        {prev > 0 && (
          <div className="dov-compare-delta" style={{ color:(delta>=0)===positive?"#16a34a":"#dc2626", justifyContent:"flex-end" }}>
            {delta >= 0 ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
            {Math.abs(delta).toFixed(1)}% vs last month
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dov-compare-grid">
      <div className="dov-compare-col current">
        <div className="dov-compare-head">📅 {format(now,"MMMM yyyy")}</div>
        <Row label="Income"   current={inc.current} prev={inc.prev} delta={incDelta} positive={true}/>
        <Row label="Expenses" current={exp.current} prev={exp.prev} delta={expDelta} positive={false}/>
        <Row label="Net"      current={netCurrent}  prev={netPrev}  delta={netDelta} positive={netCurrent>=0}/>
      </div>
      <div className="dov-compare-col">
        <div className="dov-compare-head">📅 {format(subMonths(now,1),"MMMM yyyy")}</div>
        <div className="dov-compare-row"><span className="dov-compare-label">Income</span>   <span className="dov-compare-val">{hideBalance?"••••":fKes(inc.prev)}</span></div>
        <div className="dov-compare-row"><span className="dov-compare-label">Expenses</span> <span className="dov-compare-val">{hideBalance?"••••":fKes(exp.prev)}</span></div>
        <div className="dov-compare-row"><span className="dov-compare-label">Net</span>       <span className="dov-compare-val" style={{ color:netPrev>=0?"#16a34a":"#dc2626" }}>{hideBalance?"••••":fKes(netPrev)}</span></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §11 · CALENDAR HEATMAP
// ═══════════════════════════════════════════════════════════════════════════════

function CalendarHeatmap({ heatmapData }) {
  const max = Math.max(...heatmapData.map(d => d.total), 1);
  const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function heatColor(val) {
    if (val === 0) return "#f1f5f9";
    const pct = val / max;
    if (pct < 0.25) return "#bfdbfe";
    if (pct < 0.5)  return "#60a5fa";
    if (pct < 0.75) return "#2563eb";
    return "#1e3a8a";
  }
  const firstDay = heatmapData[0]?.date?.getDay() ?? 0;
  const padded   = [...Array(firstDay).fill(null), ...heatmapData];
  return (
    <div>
      <div className="dov-cal-grid">
        {dayLabels.map(d => <div key={d} className="dov-cal-label">{d}</div>)}
        {padded.map((d, i) => (
          <div key={i} className="dov-cal-day"
            style={{ background:d?heatColor(d.total):"transparent", color:d&&d.total>max*0.5?"white":"#64748b" }}
            title={d?`${format(d.date,"d MMM")} — ${fKes(d.total)}`:""}>
            {d ? d.label : ""}
          </div>
        ))}
      </div>
      <div className="dov-cal-legend">
        <span>Less</span>
        {["#f1f5f9","#bfdbfe","#60a5fa","#2563eb","#1e3a8a"].map(c => (
          <div key={c} style={{ width:14, height:14, borderRadius:3, background:c, flexShrink:0 }}/>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12 · SAVINGS GOALS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function SavingsGoalsPanel({ netSavings, expense, hideBalance }) {
  const accumulated = Math.max(netSavings, 0);
  return (
    <div className="dov-goals-grid">
      {GOAL_PRESETS.map((g, i) => {
        const target = Math.round(expense * g.multiplier);
        const pct    = target > 0 ? Math.min(Math.round((accumulated / target) * 100), 100) : 0;
        return (
          <div key={i} className="dov-goal-card" style={{ animationDelay:`${i*.08}s` }}>
            <div className="dov-goal-icon">{g.icon}</div>
            <div className="dov-goal-name">{g.name}</div>
            <div className="dov-goal-target">Target: {hideBalance ? "••••" : fKes(target)}</div>
            <div className="dov-goal-track">
              <div className="dov-goal-fill" style={{ "--tw":`${pct}%`, width:`${pct}%`, background:g.color }}/>
            </div>
            <div className="dov-goal-pct" style={{ color:pct>=100?"#16a34a":g.color }}>{pct}% funded</div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §13 · MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardOverview({ accounts, transactions }) {

  // ── ALL HOOKS FIRST — no early returns until every hook is declared ──────
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [selectedAccountId, setSelectedAccountId] = useState(
    () => accounts?.find(a => a.isDefault)?.id || accounts?.[0]?.id
  );
  const [period,       setPeriod]       = useState("month");
  const [chartType,    setChartType]    = useState("area");
  const [hideBalance,  setHideBalance]  = useState(false);
  const [aiTab,        setAiTab]        = useState("recommendations");
  const [showModal,    setShowModal]    = useState(false);
  const [rightCardTab, setRightCardTab] = useState("breakdown");
  const [leftCardTab,  setLeftCardTab]  = useState("recent");

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  // ── ALL useMemo HOOKS — before any early return ──────────────────────────
  const accountTransactions = useMemo(
    () => (transactions || []).filter(t => t.accountId === selectedAccountId),
    [transactions, selectedAccountId]
  );

  const periodTransactions = useMemo(() => {
    const { start, end } = getPeriodRange(period);
    return accountTransactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [accountTransactions, period]);

  const stats = useMemo(() => {
    const income  = periodTransactions.filter(t => t.type === "INCOME" ).reduce((s,t) => s+t.amount, 0);
    const expense = periodTransactions.filter(t => t.type === "EXPENSE").reduce((s,t) => s+t.amount, 0);
    const net     = income - expense;
    const rate    = income > 0 ? Math.round((net / income) * 100) : 0;
    return { income, expense, net, rate };
  }, [periodTransactions]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return accountTransactions.filter(t => {
      const d = new Date(t.date);
      return t.type === "EXPENSE" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [accountTransactions]);

  const pieChartData = useMemo(() => {
    const map = currentMonthExpenses.reduce((acc,t) => { acc[t.category]=(acc[t.category]||0)+t.amount; return acc; }, {});
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [currentMonthExpenses]);

  const categoryBars = useMemo(() => {
    const total = currentMonthExpenses.reduce((s,t) => s+t.amount, 0) || 1;
    const map   = currentMonthExpenses.reduce((acc,t) => { acc[t.category]=(acc[t.category]||0)+t.amount; return acc; }, {});
    return Object.entries(map)
      .sort((a,b) => b[1]-a[1]).slice(0,5)
      .map(([name,val],i) => ({ name, val, pct:Math.round((val/total)*100), color:PALETTE[i%PALETTE.length] }));
  }, [currentMonthExpenses]);

  const recentTransactions = useMemo(
    () => [...periodTransactions].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,8),
    [periodTransactions]
  );

  const trendData   = useMemo(() => buildTrendData(accountTransactions),   [accountTransactions]);
  const weeklyData  = useMemo(() => buildWeeklyData(accountTransactions),  [accountTransactions]);
  const heatmapData = useMemo(() => buildHeatmapData(accountTransactions), [accountTransactions]);
  const recurring   = useMemo(() => detectRecurring(accountTransactions),  [accountTransactions]);
  const budgets     = useMemo(() => buildBudgets(accountTransactions, currentMonthExpenses), [accountTransactions, currentMonthExpenses]);

  const hScore = useMemo(
    () => computeHealthScore(stats.income, stats.expense, stats.rate, periodTransactions.length),
    [stats, periodTransactions]
  );

  const last2    = trendData.slice(-2);
  const expTrend = last2.length === 2 ? last2[1].expense - last2[0].expense : 0;
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate() - new Date().getDate();

  const aiRecs  = useMemo(() => genRecs(stats.income, stats.expense, stats.rate, categoryBars, trendData, daysLeft),       [stats, categoryBars, trendData, daysLeft]);
  const aiPreds = useMemo(() => genPredictions(stats.income, stats.expense, trendData, stats.rate, categoryBars[0]),        [stats, trendData, categoryBars]);
  const alerts  = useMemo(() => buildAlerts(stats.rate, budgets, expTrend, categoryBars[0], stats.income, stats.expense),   [stats, budgets, expTrend, categoryBars]);

  // ── EARLY RETURN — safe now, ALL hooks already called above ─────────────
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="dov-root">
        <style dangerouslySetInnerHTML={{ __html: styles }}/>
        <div className="dov-auth-gate">
          <div className="dov-auth-icon">🔐</div>
          <div className="dov-auth-title">Sign in to view your Dashboard</div>
          <div className="dov-auth-sub">Your financial overview is private. Please log in to access your accounts.</div>
          <button className="dov-auth-btn" onClick={() => router.push("/sign-in")}>
            <Shield size={15}/> Sign In to Continue <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    );
  }

  // ── DERIVED VALUES (not hooks) ───────────────────────────────────────────
  const hColor = hScore >= 75 ? "#10b981" : hScore >= 50 ? "#f59e0b" : "#ef4444";
  const hLabel = hScore >= 75 ? "Excellent" : hScore >= 50 ? "Fair" : "Needs Work";
  const selectedAccount = (accounts || []).find(a => a.id === selectedAccountId);
  const tooltipStyle = { background:"#0f2552", border:"1px solid rgba(56,189,248,.2)", borderRadius:12, fontSize:12 };

  const statCards = [
    { t:"dov-sc-blue",   icon:<Wallet size={16}/>,         label:"Balance",      val:selectedAccount?fKes(selectedAccount.balance??0):"—", chg:null },
    { t:"dov-sc-teal",   icon:<ArrowUpRight size={16}/>,   label:"Income",       val:fKes(stats.income),           chg:{ pos:true,         lbl:periodLabel(period) } },
    { t:"dov-sc-rose",   icon:<ArrowDownRight size={16}/>, label:"Expenses",     val:fKes(stats.expense),          chg:{ pos:false,        lbl:periodLabel(period) } },
    { t:"dov-sc-amber",  icon:<PiggyBank size={16}/>,      label:"Net Savings",  val:fKes(Math.max(stats.net,0)),  chg:{ pos:stats.net>=0, lbl:`${stats.rate}% rate` } },
    { t:"dov-sc-violet", icon:<Brain size={16}/>,          label:"Health Score", val:`${hScore}/100`,              chg:{ pos:hScore>=60,   lbl:hLabel } },
    { t:"dov-sc-navy",   icon:<Calendar size={16}/>,       label:"Days Left",    val:`${daysLeft} days`,           chg:{ pos:true,         lbl:format(new Date(),"MMMM") } },
  ];

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="dov-root">
      <style dangerouslySetInnerHTML={{ __html: styles }}/>

      {showModal && (
        <ViewAllModal transactions={accountTransactions} onClose={() => setShowModal(false)} hideBalance={hideBalance}/>
      )}

      {/* HEADER */}
      <div className="dov-header">
        <div>
          <h2 className="dov-greeting">Welcome back, <span>{user?.firstName || "there"}</span> 👋</h2>
          <p className="dov-sub"><Clock size={10}/> Updated {format(new Date(),"PPp")}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <button className="dov-balance-toggle" onClick={() => setHideBalance(v => !v)}>
            {hideBalance ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
          <div className="dov-period-tabs">
            {PERIODS.map(p => (
              <button key={p.key} className={`dov-tab ${period===p.key?"active":""}`} onClick={() => setPeriod(p.key)}>{p.label}</button>
            ))}
          </div>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px]" style={{ borderRadius:10, fontSize:13 }}>
              <SelectValue placeholder="Select account"/>
            </SelectTrigger>
            <SelectContent>
              {(accounts||[]).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dov-stat-grid">
        {statCards.map((sc, i) => (
          <div key={i} className={`dov-stat-card ${sc.t}`} style={{ animationDelay:`${i*.07}s` }}>
            <div className="dov-sc-icon">{sc.icon}</div>
            <div className="dov-sc-label">{sc.label}</div>
            <div className="dov-kes-amount">
              {hideBalance && sc.label !== "Health Score" && sc.label !== "Days Left" ? "••••••" : sc.val}
            </div>
            {sc.chg && (
              <div className="dov-sc-change">
                {sc.chg.pos ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}{sc.chg.lbl}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="dov-main-grid">

        {/* 6-MONTH TREND */}
        <div className="dov-dark-card dov-full-row">
          <div className="dov-dark-header">
            <div className="dov-dark-title">
              <Activity size={13} color="#38bdf8"/> 6-Month Cash Flow
              <span className="dov-live-badge">● Live</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:14 }}>
                {[["#4ECDC4","Income"],["#FF6B6B","Expenses"],["#9FA8DA","Net"]].map(([c,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:"#94a3b8" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:c }}/>{l}
                  </div>
                ))}
              </div>
              <div className="dov-period-tabs" style={{ background:"rgba(255,255,255,.07)" }}>
                {["area","bar","line"].map(ct => (
                  <button key={ct}
                    className={`dov-tab ${chartType===ct?"active":""}`}
                    style={chartType===ct?{background:"rgba(255,255,255,.15)",color:"white"}:{color:"#64748b"}}
                    onClick={() => setChartType(ct)}>
                    {ct.charAt(0).toUpperCase()+ct.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height:240, padding:"0 14px 18px" }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={trendData}>
                  <defs>
                    {[["gI","#4ECDC4"],["gE","#FF6B6B"],["gN","#9FA8DA"]].map(([id,c]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={.28}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                  <XAxis dataKey="label" tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                  <Tooltip formatter={(v,n) => [fKes(v),n]} contentStyle={tooltipStyle} labelStyle={{ color:"#94a3b8" }}/>
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.08)"/>
                  <Area type="monotone" dataKey="income"  stroke="#4ECDC4" strokeWidth={2} fill="url(#gI)"/>
                  <Area type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={2} fill="url(#gE)"/>
                  <Area type="monotone" dataKey="net"     stroke="#9FA8DA" strokeWidth={1.5} fill="url(#gN)" strokeDasharray="4 2"/>
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart data={trendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                  <XAxis dataKey="label" tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                  <Tooltip formatter={(v,n) => [fKes(v),n]} contentStyle={tooltipStyle} labelStyle={{ color:"#94a3b8" }}/>
                  <Bar dataKey="income"  fill="#4ECDC4" radius={[4,4,0,0]}/>
                  <Bar dataKey="expense" fill="#FF6B6B" radius={[4,4,0,0]}/>
                  <Bar dataKey="net"     fill="#9FA8DA" radius={[4,4,0,0]}/>
                </BarChart>
              ) : (
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                  <XAxis dataKey="label" tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                  <Tooltip formatter={(v,n) => [fKes(v),n]} contentStyle={tooltipStyle} labelStyle={{ color:"#94a3b8" }}/>
                  <Line type="monotone" dataKey="income"  stroke="#4ECDC4" strokeWidth={2} dot={{ r:4 }}/>
                  <Line type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={2} dot={{ r:4 }}/>
                  <Line type="monotone" dataKey="net"     stroke="#9FA8DA" strokeWidth={1.5} dot={{ r:3 }} strokeDasharray="4 2"/>
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* WEEKLY SPEND */}
        <div className="dov-dark-card">
          <div className="dov-dark-header">
            <div className="dov-dark-title"><BarChart2 size={13} color="#38bdf8"/> Weekly Spend Pattern</div>
          </div>
          <div style={{ height:180, padding:"0 14px 16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                <XAxis dataKey="day" tick={{ fill:"#64748b",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                <Tooltip formatter={v => [fKes(v),"Expenses"]} contentStyle={tooltipStyle} labelStyle={{ color:"#94a3b8" }}/>
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {weeklyData.map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HEATMAP */}
        <div className="dov-dark-card">
          <div className="dov-dark-header">
            <div className="dov-dark-title"><Calendar size={13} color="#38bdf8"/> 28-Day Spending Heatmap</div>
          </div>
          <CalendarHeatmap heatmapData={heatmapData}/>
        </div>

        {/* LEFT TABBED CARD */}
        <div className="dov-card">
          <div className="dov-card-header">
            <div className="dov-period-tabs" style={{ padding:"3px", borderRadius:10 }}>
              {[{k:"recent",l:"Transactions"},{k:"recurring",l:"Recurring"},{k:"budget",l:"Budget"}].map(t => (
                <button key={t.k} className={`dov-tab ${leftCardTab===t.k?"active":""}`} onClick={() => setLeftCardTab(t.k)}>{t.l}</button>
              ))}
            </div>
            {leftCardTab === "recent" && (
              <button className="dov-view-all" onClick={() => setShowModal(true)}>
                View all <ChevronRight size={11}/>
              </button>
            )}
          </div>

          {leftCardTab === "recent" && (
            <div style={{ padding:"12px 0 6px" }}>
              {recentTransactions.length === 0 ? (
                <EmptyState icon="📭" message={`No transactions ${periodLabel(period).toLowerCase()}`}/>
              ) : recentTransactions.map((t, idx) => (
                <div key={t.id} className="dov-tx-row" style={{ animationDelay:`${idx*.055}s` }}>
                  <div style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
                    <div className={`dov-tx-icon ${t.type==="EXPENSE"?"expense":"income"}`}>
                      {t.type==="EXPENSE" ? <ArrowDownRight size={13}/> : <ArrowUpRight size={13}/>}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div className="dov-tx-desc">{t.description || "Untitled Transaction"}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span className="dov-tx-date">{format(new Date(t.date),"PP")}</span>
                        {t.category && <span className="dov-tx-cat-pill">{t.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={cn("dov-tx-amount", t.type==="EXPENSE"?"expense":"income")}>
                    {t.type==="EXPENSE"?"−":"+"}{hideBalance?"••••":fKes(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {leftCardTab === "recurring" && <RecurringPanel recurring={recurring} hideBalance={hideBalance}/>}
          {leftCardTab === "budget"    && <BudgetPanel    budgets={budgets}     hideBalance={hideBalance}/>}
        </div>

        {/* RIGHT TABBED CARD */}
        <div className="dov-card">
          <div className="dov-card-header">
            <div className="dov-period-tabs" style={{ padding:"3px", borderRadius:10 }}>
              {[{k:"breakdown",l:"Breakdown"},{k:"comparison",l:"vs Last Mo."},{k:"goals",l:"Goals"}].map(t => (
                <button key={t.k} className={`dov-tab ${rightCardTab===t.k?"active":""}`} onClick={() => setRightCardTab(t.k)}>{t.l}</button>
              ))}
            </div>
            {rightCardTab === "breakdown" && stats.rate > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <ProgressRing pct={Math.min(stats.rate,100)} color="#4ECDC4"/>
                <span style={{ fontSize:10.5, color:"#64748b" }}>saved</span>
              </div>
            )}
          </div>

          {rightCardTab === "breakdown" && (
            pieChartData.length === 0 ? (
              <EmptyState icon="📊" message="No expenses this month"/>
            ) : (
              <>
                <div style={{ height:200, padding:"8px 0 0" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={70} innerRadius={30}
                        fill="#8884d8" dataKey="value" paddingAngle={3}
                        label={({ name, value }) => `${name}: ${fKes(value)}`}>
                        {pieChartData.map((_,i) => <Cell key={`c-${i}`} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={v => fKes(v)} contentStyle={{ backgroundColor:"hsl(var(--popover))", border:"1px solid hsl(var(--border))", borderRadius:"var(--radius)", fontSize:12 }}/>
                      <Legend wrapperStyle={{ fontSize:11 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ padding:"4px 0 14px" }}>
                  {categoryBars.map((c,i) => (
                    <div key={i} className="dov-cat-row" style={{ animationDelay:`${i*.07}s` }}>
                      <div className="dov-cat-top">
                        <span className="dov-cat-name">{c.name}</span>
                        <span className="dov-cat-amt">{hideBalance?"••••":fKes(c.val)}</span>
                      </div>
                      <div className="dov-cat-track">
                        <div className="dov-cat-fill" style={{ "--tw":`${c.pct}%`, width:`${c.pct}%`, background:c.color }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}

          {rightCardTab === "comparison" && <ComparisonPanel txs={accountTransactions} hideBalance={hideBalance}/>}
          {rightCardTab === "goals"      && <SavingsGoalsPanel netSavings={stats.net} expense={stats.expense} hideBalance={hideBalance}/>}
        </div>

        {/* AI INTELLIGENCE PANEL */}
        <div className="dov-full-row">
          <div className="dov-ai-section">
            <div className="dov-ai-top">
              <div className="dov-ai-brain">🧠</div>
              <div>
                <div className="dov-ai-title">
                  <Sparkles size={13} style={{ display:"inline", marginRight:6, color:"#38bdf8" }}/>
                  AI Financial Intelligence
                </div>
                <div className="dov-ai-sub">Personalised insights powered by your real account data</div>
              </div>
              <div className="dov-health-box">
                <div>
                  <div className="dov-health-num" style={{ color:hColor }}>{hScore}</div>
                  <div className="dov-health-lbl">Health Score</div>
                  <div style={{ fontSize:10.5, color:hColor, fontWeight:700, marginTop:2 }}>{hLabel}</div>
                </div>
                <div className="dov-health-bars">
                  {[
                    { name:"Savings Rate",    val:stats.rate,                                                              color:"#4ECDC4" },
                    { name:"Expense Control", val:stats.income>0?Math.round((1-stats.expense/stats.income)*100):0,         color:"#45B7D1" },
                    { name:"Tx Activity",     val:Math.min(accountTransactions.length*3,100),                              color:"#96CEB4" },
                  ].map((h,i) => (
                    <div key={i} className="dov-hbar">
                      <div className="dov-hbar-name">{h.name}</div>
                      <div className="dov-hbar-track">
                        <div className="dov-hbar-fill" style={{ width:`${Math.max(h.val,0)}%`, background:h.color }}/>
                      </div>
                      <div className="dov-hbar-val">{Math.max(h.val,0)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dov-ai-tabs-row">
              {AI_TABS.map(t => (
                <button key={t.key} className={`dov-ai-tab ${aiTab===t.key?"active":""}`} onClick={() => setAiTab(t.key)}>{t.label}</button>
              ))}
            </div>

            {aiTab === "recommendations" && (
              <div className="dov-rec-grid">
                {aiRecs.map((r,i) => (
                  <div key={i} className="dov-rec-card" style={{ animationDelay:`${i*.06}s` }}>
                    <div className={`dov-rec-icon p-${r.p}`}>{r.icon}</div>
                    <div className={`dov-rec-badge p-${r.p}`}>{r.badge}</div>
                    <div className="dov-rec-title">{r.title}</div>
                    <div className="dov-rec-body">{r.body}</div>
                    {r.kes && <div className="dov-rec-kes" style={{ color:r.p==="high"?"#f87171":r.p==="low"?"#34d399":"#38bdf8" }}>{r.kes}</div>}
                  </div>
                ))}
              </div>
            )}

            {aiTab === "predictions" && (
              <div className="dov-predict-list">
                {aiPreds.map((p,i) => (
                  <div key={i} className="dov-predict-row" style={{ animationDelay:`${i*.07}s` }}>
                    <div className="dov-predict-bullet" style={{ background:p.positive?"rgba(16,185,129,.14)":"rgba(239,68,68,.11)" }}>{p.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div className="dov-predict-horizon">{p.horizon}</div>
                      <div className="dov-predict-title">{p.title}</div>
                      <div className="dov-predict-body">{p.body}</div>
                      {p.kes && <div className="dov-predict-kes" style={{ color:p.positive?"#34d399":"#f87171" }}>{p.kes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aiTab === "alerts" && (
              <div>
                {alerts.map((a,i) => (
                  <div key={i} className={`dov-alert-item dov-alert-${a.level}`} style={{ animationDelay:`${i*.07}s` }}>
                    <div className="dov-alert-icon"
                      style={{ background:a.level==="critical"?"#fef2f2":a.level==="warning"?"#fffbeb":a.level==="success"?"#f0fdf4":"#eff6ff" }}>
                      {a.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="dov-alert-title">{a.title}</div>
                      <div className="dov-alert-body">{a.body}</div>
                      {a.kes && (
                        <div className="dov-alert-kes" style={{ color:a.level==="critical"?"#ef4444":a.level==="warning"?"#f59e0b":a.level==="success"?"#16a34a":"#1e40af" }}>
                          {a.kes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}