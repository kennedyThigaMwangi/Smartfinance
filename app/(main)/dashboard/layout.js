// app/(dashboard)/dashboard/layout.js
// SERVER COMPONENT — auth() runs server-side

import DashboardPage from "./page";
import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── RESET & BASE ── */
  .dl-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .dl-root { font-family: 'DM Sans', sans-serif; }

  /* ── FULL PAGE BACKGROUND ── */
  .dl-bg {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 10% 20%,  rgba(56,189,248,0.08)  0%, transparent 50%),
      radial-gradient(ellipse at 90% 5%,   rgba(30,64,175,0.07)   0%, transparent 45%),
      radial-gradient(ellipse at 55% 90%,  rgba(16,185,129,0.06)  0%, transparent 50%),
      #f0f4f8;
  }
  .dl-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(rgba(30,64,175,0.045) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 0;
  }
  .dl-wrap { position: relative; z-index: 1; }

  /* ════════════════════════════════════════
     STICKY TOPBAR
  ════════════════════════════════════════ */
  .dl-topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 66px;
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(226,232,240,0.9);
    box-shadow: 0 1px 12px rgba(0,0,0,0.04);
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  /* left: logo + breadcrumb */
  .dl-topbar-left { display: flex; align-items: center; gap: 16px; }
  .dl-logo-mark {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #1e40af, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(30,64,175,0.25);
  }
  .dl-logo-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 800;
    color: #0f172a; letter-spacing: -0.01em;
  }
  .dl-topbar-divider { width: 1px; height: 22px; background: #e2e8f0; }
  .dl-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .dl-bc-home { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
  .dl-bc-home:hover { color: #1e40af; }
  .dl-bc-sep { color: #cbd5e1; font-size: 14px; }
  .dl-bc-cur {
    color: #1e40af; font-weight: 600;
    background: #eff6ff; padding: 2px 10px; border-radius: 6px;
  }

  /* right: live badge + user chip */
  .dl-topbar-right { display: flex; align-items: center; gap: 14px; }
  .dl-live-badge {
    display: flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 999px; padding: 5px 12px;
    font-size: 11px; font-weight: 700; color: #15803d;
    letter-spacing: 0.04em;
  }
  .dl-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
    animation: dlPulse 1.8s ease-in-out infinite;
  }
  .dl-user-chip { display: flex; align-items: center; gap: 10px; }
  .dl-user-text { text-align: right; }
  .dl-user-name  { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.3; }
  .dl-user-email { font-size: 11px; color: #94a3b8; }
  .dl-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid #dbeafe; object-fit: cover;
    box-shadow: 0 2px 8px rgba(30,64,175,0.15);
  }
  .dl-avatar-init {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #1e40af, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 700; flex-shrink: 0;
    border: 2px solid #dbeafe;
    box-shadow: 0 2px 8px rgba(30,64,175,0.2);
  }

  /* ════════════════════════════════════════
     HERO HEADER
  ════════════════════════════════════════ */
  .dl-hero {
    padding: 56px 40px 48px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 32px;
    animation: dlFadeUp 0.5s ease forwards;
  }

  .dl-hero-left { flex: 1; min-width: 260px; }

  .dl-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #dbeafe, #e0f2fe);
    border: 1px solid rgba(56,189,248,0.3);
    padding: 5px 14px; border-radius: 999px; margin-bottom: 18px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #1e40af;
  }
  .dl-eyebrow-pulse {
    width: 7px; height: 7px; border-radius: 50%; background: #38bdf8;
    animation: dlPulse 2s ease-in-out infinite;
  }

  .dl-h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.2rem, 4.5vw, 3.6rem);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.025em; color: #0f172a;
    margin-bottom: 14px;
  }
  .dl-h1-gradient {
    background: linear-gradient(90deg, #1e40af 0%, #0ea5e9 55%, #10b981 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .dl-datetime {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-top: 4px;
  }
  .dl-dt-chip {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: #64748b; font-weight: 500;
  }
  .dl-dt-sep { color: #cbd5e1; font-size: 16px; }

  /* hero right: summary cards */
  .dl-hero-right {
    display: flex; gap: 14px; flex-wrap: wrap; flex-shrink: 0;
    animation: dlFadeUp 0.55s ease 0.1s forwards; opacity: 0;
  }
  .dl-hero-card {
    background: white; border: 1px solid #e2e8f0; border-radius: 18px;
    padding: 18px 22px; min-width: 140px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .dl-hero-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.09);
  }
  .dl-hc-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; margin-bottom: 12px;
  }
  .dl-hc-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
  .dl-hc-val   { font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3; }

  /* ════════════════════════════════════════
     SECTION SEPARATOR
  ════════════════════════════════════════ */
  .dl-section-sep {
    margin: 0 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e2e8f0 15%, #e2e8f0 85%, transparent 100%);
  }

  /* ════════════════════════════════════════
     QUICK STAT STRIP
  ════════════════════════════════════════ */
  .dl-strip-section {
    padding: 36px 40px;
    animation: dlFadeUp 0.55s ease 0.15s forwards; opacity: 0;
  }
  .dl-strip-label-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  }
  .dl-strip-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.01em;
  }
  .dl-strip-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #e2e8f0, transparent);
  }

  .dl-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  @media(max-width:768px) { .dl-strip { grid-template-columns: 1fr 1fr; } }
  @media(max-width:480px) { .dl-strip { grid-template-columns: 1fr; } }

  .dl-strip-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
    cursor: default;
  }
  .dl-strip-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.08);
    border-color: rgba(56,189,248,0.3);
  }
  .dl-strip-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; flex-shrink: 0;
  }
  .dl-strip-info { min-width: 0; }
  .dl-strip-lbl {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;
  }
  .dl-strip-val {
    font-size: 14px; font-weight: 700; color: #0f172a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dl-strip-sub {
    font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 500;
  }

  /* ════════════════════════════════════════
     MAIN CONTENT AREA
  ════════════════════════════════════════ */
  .dl-content-section {
    padding: 0 40px 72px;
    animation: dlFadeUp 0.6s ease 0.22s forwards; opacity: 0;
  }
  .dl-content-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  }
  .dl-content-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: #0f172a;
  }
  .dl-content-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #e2e8f0, transparent);
  }
  .dl-content-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 999px; background: #eff6ff; color: #1e40af;
    border: 1px solid #dbeafe;
  }

  /* ════════════════════════════════════════
     LOADER
  ════════════════════════════════════════ */
  .dl-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 0; gap: 20px;
  }
  .dl-loader-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #dbeafe; border-top-color: #1e40af;
    animation: dlSpin 0.85s linear infinite;
  }
  .dl-loader-text {
    font-size: 14px; color: #64748b; font-weight: 500;
    display: flex; align-items: center; gap: 6px;
  }
  .dl-loader-dots span {
    display: inline-block;
    animation: dlBlink 1.4s ease-in-out infinite;
  }
  .dl-loader-dots span:nth-child(2) { animation-delay: 0.2s; }
  .dl-loader-dots span:nth-child(3) { animation-delay: 0.4s; }

  .dl-shimmer-bar {
    width: 100%; height: 3px; border-radius: 999px;
    background: #f1f5f9; overflow: hidden; margin-bottom: 32px;
  }
  .dl-shimmer-fill {
    height: 100%; width: 45%; border-radius: 999px;
    background: linear-gradient(90deg, #1e40af, #38bdf8, #10b981);
    background-size: 200% 100%;
    animation: dlShimmer 1.5s linear infinite;
  }

  /* ════════════════════════════════════════
     KEYFRAMES
  ════════════════════════════════════════ */
  @keyframes dlFadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dlBlink   { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes dlSpin    { to{transform:rotate(360deg)} }
  @keyframes dlPulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
  @keyframes dlShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  /* ════════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════════ */
  @media(max-width:768px) {
    .dl-topbar          { padding: 0 20px; height: 58px; }
    .dl-hero            { padding: 36px 20px 32px; }
    .dl-strip-section   { padding: 28px 20px; }
    .dl-section-sep     { margin: 0 20px; }
    .dl-content-section { padding: 0 20px 56px; }
    .dl-hero-right      { width: 100%; }
    .dl-hero-card       { flex: 1; min-width: 120px; }
    .dl-topbar-divider,
    .dl-logo-name       { display: none; }
  }
`;

// ─── LOADER COMPONENT ─────────────────────────────────────────────────────────
function DashboardLoader() {
  return (
    <div className="dl-loader">
      <div className="dl-loader-ring" />
      <div className="dl-loader-text">
        Loading your financial data
        <span className="dl-loader-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export default async function Layout() {

  // ── AUTH GUARD ────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // ── USER DATA ─────────────────────────────────────────────────────────────
  const user       = await currentUser();
  const firstName  = user?.firstName || "there";
  const lastName   = user?.lastName  || "";
  const fullName   = [firstName, lastName].filter(Boolean).join(" ");
  const userEmail  = user?.emailAddresses?.[0]?.emailAddress || "";
  const avatarUrl  = user?.imageUrl || null;

  const now        = new Date();
  const hour       = now.getHours();
  const greeting   = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel  = format(now, "EEEE, MMMM do yyyy");
  const timeLabel  = format(now, "h:mm a");
  const monthLabel = format(now, "MMMM yyyy");

  const stripCards = [
    { icon: "💰", bg: "#dbeafe", color: "#1e40af", label: "Account",    val: "Default Active",    sub: "Primary account" },
    { icon: "📊", bg: "#dcfce7", color: "#15803d", label: "Tracking",   val: "Income & Expenses", sub: "Real-time sync"  },
    { icon: "🤖", bg: "#f3e8ff", color: "#7c3aed", label: "AI Engine",  val: "Insights Ready",    sub: "6-month model"   },
    { icon: "📧", bg: "#fef3c7", color: "#d97706", label: "Digest",     val: "Email Alerts On",   sub: monthLabel        },
  ];

  const heroCards = [
    { icon: "📅", bg: "#eff6ff", color: "#1e40af", label: "Today",    val: format(now, "MMM do") },
    { icon: "🔐", bg: "#f0fdf4", color: "#15803d", label: "Security", val: "Verified"             },
    { icon: "⚡", bg: "#fefce8", color: "#d97706", label: "Session",  val: "Active"               },
  ];

  return (
    <>
      {/* ── STYLES ─────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── HIDE FOOTER FOR LOGGED-IN USERS ──────────────────────────── */}
      <style>{`.sf-footer { display: none !important; }`}</style>

      <div className="dl-root dl-bg">
        <div className="dl-wrap">

          {/* ══════════════════════════════════════════════════════════════
              STICKY TOPBAR
          ══════════════════════════════════════════════════════════════ */}
          <nav className="dl-topbar">

            {/* Left: logo + breadcrumb */}
            <div className="dl-topbar-left">
              <div className="dl-logo-mark">💹</div>
              <span className="dl-logo-name">SmartFinance</span>
              <div className="dl-topbar-divider" />
              <div className="dl-breadcrumb">
                <span className="dl-bc-home">Home</span>
                <span className="dl-bc-sep">›</span>
                <span className="dl-bc-cur">Dashboard</span>
              </div>
            </div>

            {/* Right: live badge + user chip */}
            <div className="dl-topbar-right">
              <div className="dl-live-badge">
                <div className="dl-live-dot" />
                All Systems Live
              </div>
              <div className="dl-user-chip">
                <div className="dl-user-text">
                  <div className="dl-user-name">{fullName}</div>
                  <div className="dl-user-email">{userEmail}</div>
                </div>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="dl-avatar" />
                ) : (
                  <div className="dl-avatar-init">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* ══════════════════════════════════════════════════════════════
              HERO HEADER
          ══════════════════════════════════════════════════════════════ */}
          <header className="dl-hero">

            {/* Left: greeting + date */}
            <div className="dl-hero-left">
              <div className="dl-eyebrow">
                <div className="dl-eyebrow-pulse" />
                Live Financial Overview
              </div>

              <h1 className="dl-h1">
                {greeting},&nbsp;
                <span className="dl-h1-gradient">{firstName}</span>&nbsp;👋
              </h1>

              <div className="dl-datetime">
                <div className="dl-dt-chip">📅 {dateLabel}</div>
                <span className="dl-dt-sep">·</span>
                <div className="dl-dt-chip">🕐 {timeLabel} EAT</div>
              </div>
            </div>

            {/* Right: compact info cards */}
            <div className="dl-hero-right">
              {heroCards.map((c, i) => (
                <div key={i} className="dl-hero-card">
                  <div
                    className="dl-hc-icon"
                    style={{ background: c.bg, color: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div className="dl-hc-label">{c.label}</div>
                  <div
                    className="dl-hc-val"
                    style={c.label === "Security" ? { color: "#15803d" } : {}}
                  >
                    {c.val}
                  </div>
                </div>
              ))}
            </div>
          </header>

          {/* ── SEPARATOR ──────────────────────────────────────────────── */}
          <div className="dl-section-sep" />

          {/* ══════════════════════════════════════════════════════════════
              QUICK-STAT STRIP
          ══════════════════════════════════════════════════════════════ */}
          <section className="dl-strip-section">
            <div className="dl-strip-label-row">
              <span className="dl-strip-section-title">System Status</span>
              <div className="dl-strip-line" />
            </div>

            <div className="dl-strip">
              {stripCards.map((s, i) => (
                <div key={i} className="dl-strip-card">
                  <div
                    className="dl-strip-icon"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div className="dl-strip-info">
                    <div className="dl-strip-lbl">{s.label}</div>
                    <div className="dl-strip-val">{s.val}</div>
                    <div className="dl-strip-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SEPARATOR ──────────────────────────────────────────────── */}
          <div className="dl-section-sep" />

          {/* ══════════════════════════════════════════════════════════════
              MAIN DASHBOARD CONTENT
          ══════════════════════════════════════════════════════════════ */}
          <section className="dl-content-section">

            {/* Section heading */}
            <div className="dl-content-header">
              <span className="dl-content-title">Financial Analytics</span>
              <div className="dl-content-line" />
              <span className="dl-content-badge">{monthLabel}</span>
            </div>

            {/* Suspense with enhanced loader */}
            <Suspense
              fallback={
                <>
                  <div className="dl-shimmer-bar">
                    <div className="dl-shimmer-fill" />
                  </div>
                  <DashboardLoader />
                </>
              }
            >
              <DashboardPage />
            </Suspense>

          </section>

        </div>
      </div>
    </>
  );
}