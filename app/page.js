"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

/* ─── INLINE KEYFRAMES & GLOBAL STYLES ─────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --navy:   #0a1628;
    --blue:   #1e40af;
    --sky:    #38bdf8;
    --mint:   #10b981;
    --gold:   #f59e0b;
    --cream:  #fefce8;
    --white:  #ffffff;
    --gray50: #f8fafc;
    --gray100:#f1f5f9;
    --gray600:#475569;
    --gray900:#0f172a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--white);
    color: var(--gray900);
    overflow-x: hidden;
  }

  h1, h2, h3 { font-family: 'Playfair Display', serif; }

  /* ── MARQUEE ── */
  @keyframes marquee-ltr {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track { animation: marquee-ltr 28s linear infinite; }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── FADE UP on scroll ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { opacity: 0; }
  .fade-up.visible { animation: fadeUp 0.7s ease forwards; }

  /* ── FLOAT badge ── */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  .float-badge { animation: float 4s ease-in-out infinite; }

  /* ── PULSE ring ── */
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(56,189,248,0.4); }
    70%  { box-shadow: 0 0 0 20px rgba(56,189,248,0); }
    100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
  }
  .pulse-ring { animation: pulseRing 2.5s ease-out infinite; }

  /* ── SHIMMER ── */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .shimmer-btn {
    background: linear-gradient(90deg, #1e40af 25%, #38bdf8 50%, #1e40af 75%);
    background-size: 400px 100%;
    animation: shimmer 2.5s linear infinite;
    color: white;
    border: none;
  }

  /* ── SLIDE IN from right ── */
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(80px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .slide-right { opacity: 0; }
  .slide-right.visible { animation: slideRight 0.8s cubic-bezier(.16,1,.3,1) forwards; }

  /* ── SLIDE IN from left ── */
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-80px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .slide-left { opacity: 0; }
  .slide-left.visible { animation: slideLeft 0.8s cubic-bezier(.16,1,.3,1) forwards; }

  /* ── CARD HOVER ── */
  .adv-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 20px;
    background: white;
    overflow: hidden;
  }
  .adv-card:hover {
    transform: translateY(-8px) scale(1.015);
    box-shadow: 0 24px 60px rgba(30,64,175,0.14);
  }

  /* ── GRADIENT MESH BG ── */
  .mesh-bg {
    background:
      radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(30,64,175,0.10) 0%, transparent 55%),
      radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 50%),
      #f8fafc;
  }

  /* ── NUMBERED STEP CONNECTOR ── */
  .step-line::after {
    content: '';
    position: absolute;
    top: 32px; right: -50%;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, #38bdf8, transparent);
  }

  /* ── OBJECTIVE CARD BORDER ── */
  .obj-card {
    border-left: 4px solid;
    border-radius: 0 16px 16px 0;
    transition: all 0.3s;
  }
  .obj-card:hover { transform: translateX(6px); }

  /* ── TAG PILL ── */
  .tag-pill {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── GLASS CARD ── */
  .glass {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.8);
  }

  /* ── DARK SECTION ── */
  .dark-section {
    background: linear-gradient(135deg, #0a1628 0%, #0f2552 60%, #0a1628 100%);
  }

  /* stagger helpers */
  .delay-1 { animation-delay: 0.1s !important; }
  .delay-2 { animation-delay: 0.2s !important; }
  .delay-3 { animation-delay: 0.3s !important; }
  .delay-4 { animation-delay: 0.4s !important; }
  .delay-5 { animation-delay: 0.5s !important; }
`;

/* ─── SCROLL OBSERVER HOOK ───────────────────────────────────────────────── */
function useScrollReveal(className = "visible") {
  useEffect(() => {
    const els = document.querySelectorAll(
      ".fade-up, .slide-right, .slide-left"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(className);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── MARQUEE FEATURE STRIP ─────────────────────────────────────────────── */
const marqueeItems = [
  { icon: "🔐", text: "Secure Registration" },
  { icon: "📊", text: "Income & Expense Tracking" },
  { icon: "🤖", text: "AI Financial Insights" },
  { icon: "📈", text: "Financial Reports & Dashboards" },
  { icon: "📧", text: "Monthly Budget Notifications" },
  { icon: "💳", text: "Finances Management" },
  { icon: "🎯", text: "Budget Tracking" },
  { icon: "📉", text: "Net Worth Monitoring" },
  { icon: "💡", text: "Smart Predictions" },
];

function MarqueeStrip() {
  const doubled = [...marqueeItems, ...marqueeItems];
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0a1628, #1e40af, #0a1628)",
        overflow: "hidden",
        padding: "18px 0",
        borderTop: "1px solid rgba(56,189,248,0.3)",
        borderBottom: "1px solid rgba(56,189,248,0.3)",
      }}
    >
      <div className="marquee-track" style={{ display: "flex", width: "max-content", gap: 0 }}>
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 40px",
              color: "white",
              whiteSpace: "nowrap",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.text}
            <span style={{ color: "#38bdf8", marginLeft: 20 }}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SPECIFIC OBJECTIVES SECTION ───────────────────────────────────────── */
const objectives = [
  {
    num: "01",
    color: "#3b82f6",
    bg: "#eff6ff",
    tag: "User Management",
    title: "Secure User Registration & Authentication",
    desc: "Every user journey begins with enterprise-grade security. The system features multi-layer authentication, encrypted credential storage, and role-based access controls — ensuring your financial data stays private.",
    bullets: [
      "Email & password authentication with hashing",
      "OAuth social login (Google, GitHub)",
      "Two-factor authentication (2FA)",
      "Session management",
    ],
    icon: "🔐",
  },
  {
    num: "02",
    color: "#10b981",
    bg: "#ecfdf5",
    tag: "Core Tracking",
    title: "Accurate Income & Expense Tracking",
    desc: "Say goodbye to lost receipts and forgotten transactions. The system automatically categorises every financial movement in real time, giving you a crystal-clear picture of where your money comes from and where it goes.",
    bullets: [
      "Manual & bulk transaction import (CSV, PDF)",
      "Smart auto-categorisation engine",
      "Recurring transaction scheduler",
      "Multi account support",
    ],
    icon: "📊",
  },
  {
    num: "03",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    tag: "AI Engine",
    title: "AI-Based Financial Insights & Predictions",
    desc: "Powered by machine learning, the system analyses your spending patterns, detects anomalies, and predicts future cash flows — delivering personalised advice that evolves as your financial life evolves.",
    bullets: [
      "Predictive cash-flow forecasting (30/60/90 days)",
      "Anomaly & overspending alerts",
      "Personalised savings recommendations",
      "AI-powered budget optimisation",
    ],
    icon: "🤖",
  },
  {
    num: "04",
    color: "#f59e0b",
    bg: "#fffbeb",
    tag: "Analytics",
    title: "Financial Reports & Interactive Dashboards",
    desc: "Transform raw numbers into actionable intelligence. Intuitive charts, drill-down reports, and exportable summaries give you everything you need to make informed decisions at a glance.",
    bullets: [
      "Real-time net-worth dashboard",
      "Monthly / quarterly / annual P&L reports",
      "Category-level spending breakdowns",
      "Export to PDF",
    ],
    icon: "📈",
  },
  {
    num: "05",
    color: "#ef4444",
    bg: "#fef2f2",
    tag: "Notifications",
    title: "Monthly Budget Email Notifications",
    desc: "Stay on track without logging in. The system sends rich, beautifully formatted monthly summaries straight to your inbox — budget progress, top spending categories, savings milestones, and next-month recommendations.",
    bullets: [
      "Automated monthly digest emails",
      "Over-budget & bill-due alerts",
      "Goal milestone celebrations",
      "Custom notification preferences",
    ],
    icon: "📧",
  },
];

function ObjectivesSection() {
  return (
    <section
      className="mesh-bg"
      style={{ padding: "100px 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 70 }}>
          <span
            className="tag-pill"
            style={{ background: "#dbeafe", color: "#1e40af", marginBottom: 16, display: "inline-block" }}
          >
            System Objectives
          </span>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "#0a1628",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            What the System Is Designed to Do
          </h2>
          <p style={{ color: "#475569", maxWidth: 560, margin: "0 auto", fontSize: 17 }}>
            Five carefully engineered objectives form the backbone of a Finance Management
            System built for real people and real decisions.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {objectives.map((obj, i) => (
            <div
              key={i}
              className={`adv-card obj-card ${i % 2 === 0 ? "slide-left" : "slide-right"} delay-${i + 1}`}
              style={{
                borderColor: obj.color,
                background: "white",
                padding: "36px 40px",
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: 32,
                alignItems: "flex-start",
              }}
            >
              {/* Number + Icon */}
              <div style={{ textAlign: "center" }}>
                <div
                  className="pulse-ring"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: obj.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    margin: "0 auto 8px",
                  }}
                >
                  {obj.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: obj.color,
                    letterSpacing: "0.1em",
                  }}
                >
                  {obj.num}
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <span
                    className="tag-pill"
                    style={{ background: obj.bg, color: obj.color }}
                  >
                    {obj.tag}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    color: "#0a1628",
                    marginBottom: 10,
                  }}
                >
                  {obj.title}
                </h3>
                <p style={{ color: "#475569", marginBottom: 16, lineHeight: 1.7 }}>
                  {obj.desc}
                </p>
                <ul
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "8px 24px",
                    paddingLeft: 0,
                    listStyle: "none",
                  }}
                >
                  {obj.bullets.map((b, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: "#374151",
                      }}
                    >
                      <span style={{ color: obj.color, fontWeight: 700 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AI INSIGHTS SHOWCASE ──────────────────────────────────────────────── */
function AIInsightsSection() {
  const [active, setActive] = useState(0);
  const insights = [
    {
      label: "Cash Flow Forecast",
      value: "+KES 42,800",
      change: "+12.4%",
      positive: true,
      desc: "AI predicts your net inflow for the next 30 days based on historical patterns.",
      color: "#10b981",
    },
    {
      label: "Overspending Risk",
      value: "Dining Out",
      change: "34% over budget",
      positive: false,
      desc: "You're trending 34% over your dining budget. AI recommends cutting by KES 2,400.",
      color: "#ef4444",
    },
    {
      label: "Savings Opportunity",
      value: "KES 8,500",
      change: "Transferable",
      positive: true,
      desc: "Based on current spend, you could move KES 8,500 to your emergency fund this month.",
      color: "#3b82f6",
    },
  ];

  return (
    <section
      className="dark-section"
      style={{ padding: "100px 0", position: "relative", overflow: "hidden" }}
    >
      {/* decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.08), transparent 70%)",
          top: -100,
          right: -100,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="tag-pill"
            style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", marginBottom: 16, display: "inline-block" }}
          >
            AI Engine
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)", color: "white", marginBottom: 12 }}>
            Intelligence Behind Every Decision
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: 520, margin: "0 auto" }}>
            Our AI engine continuously learns from your financial behaviour and delivers
            forward-looking recommendations — not just historical summaries.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left – tabs */}
          <div className="slide-left" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {insights.map((ins, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                style={{
                  padding: "20px 24px",
                  borderRadius: 16,
                  cursor: "pointer",
                  background: active === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active === i ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.3s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{ins.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: ins.positive ? "#10b981" : "#ef4444",
                      background: ins.positive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      padding: "2px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {ins.change}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: "DM Sans" }}>
                  {ins.value}
                </div>
                {active === i && (
                  <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                    {ins.desc}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right – visual card */}
          <div className="slide-right" style={{ position: "relative" }}>
            <div
              className="glass float-badge"
              style={{
                borderRadius: 24,
                padding: 36,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #3b82f6, #38bdf8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  🤖
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 600 }}>AI Financial Advisor</div>
                  <div style={{ color: "#38bdf8", fontSize: 12 }}>● Online & Learning</div>
                </div>
              </div>

              {/* Mini bars */}
              {[
                { label: "Savings Rate", pct: 72, color: "#10b981" },
                { label: "Budget Adherence", pct: 61, color: "#3b82f6" },
                { label: "Investment Growth", pct: 85, color: "#f59e0b" },
              ].map((bar, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{bar.label}</span>
                    <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{bar.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${bar.pct}%`,
                        background: bar.color,
                        borderRadius: 999,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 24,
                  padding: "14px 16px",
                  background: "rgba(56,189,248,0.1)",
                  borderRadius: 12,
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              >
                <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  💡 AI Recommendation
                </div>
                <div style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5 }}>
                  {insights[active].desc}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── NOTIFICATION PREVIEW SECTION ─────────────────────────────────────── */
function NotificationSection() {
  return (
    <section style={{ background: "#f8fafc", padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          {/* Left text */}
          <div className="slide-left">
            <span
              className="tag-pill"
              style={{ background: "#fef3c7", color: "#d97706", marginBottom: 20, display: "inline-block" }}
            >
              Email Notifications
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", color: "#0a1628", marginBottom: 16, lineHeight: 1.25 }}>
              Your Monthly Finance<br />Digest, Delivered
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.75, marginBottom: 28 }}>
              Never miss a budget milestone. At the close of every month, the system compiles a
              rich email report — income vs expenses, category breakdowns, goal progress,
              and AI-tailored tips for the month ahead.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["📬", "Automated monthly summary emails"],
                ["⚠️", "Real-time over-budget alerts"],
                ["🏆", "Savings milestone celebrations"],
                ["📅", "Upcoming bill & due-date reminders"],
                ["⚙️", "Fully customisable notification preferences"],
              ].map(([icon, text], i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#fffbeb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </span>
                  <span style={{ color: "#374151", fontSize: 15 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right – email mock */}
          <div className="slide-right">
            <div
              className="adv-card float-badge"
              style={{
                boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Email header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0a1628, #1e40af)",
                  padding: "24px 28px",
                  color: "white",
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                  From: reports@welth.app
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 12 }}>
                  Subject: 📊 Your March 2026 Financial Summary
                </div>
                <div style={{ fontSize: 20, fontFamily: "Playfair Display, serif", fontWeight: 700 }}>
                  March 2026 — Monthly Report
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Hi Alex, here's your financial snapshot 👋</div>
              </div>

              {/* Email body */}
              <div style={{ padding: "24px 28px" }}>
                {/* Summary row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {[
                    { label: "Income", value: "KES 95,000", color: "#10b981" },
                    { label: "Expenses", value: "KES 58,400", color: "#ef4444" },
                    { label: "Saved", value: "KES 36,600", color: "#3b82f6" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: "12px 14px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Category bars */}
                {[
                  { cat: "🍽 Food & Dining", pct: 28, color: "#f59e0b" },
                  { cat: "🚗 Transport", pct: 15, color: "#3b82f6" },
                  { cat: "🏠 Housing", pct: 35, color: "#8b5cf6" },
                  { cat: "🛍 Shopping", pct: 22, color: "#10b981" },
                ].map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#374151" }}>{c.cat}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{c.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${c.pct}%`,
                          background: c.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* AI tip */}
                <div
                  style={{
                    marginTop: 16,
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: 13,
                    color: "#1e40af",
                  }}
                >
                  💡 <strong>AI Tip:</strong> You could save an extra KES 4,200 next month by reducing dining out by 2 meals per week.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SECURITY FEATURES ENHANCED ────────────────────────────────────────── */
function SecurityEnhanced() {
  const feats = [
    { icon: "🔐", title: "End-to-End Encryption", desc: "AES-256 encryption protects every byte of your financial data in transit and at rest." },
    { icon: "🛡️", title: "Two-Factor Authentication", desc: "Add a second layer of protection with TOTP authenticator apps or SMS verification." },
    { icon: "👁️", title: "Session Monitoring", desc: "Real-time detection of suspicious logins with automatic session revocation." },
    { icon: "🚫", title: "Zero Data Selling", desc: "Your financial data is yours. We never sell, share, or monetise your personal information." },
    
  ];

  return (
    <section
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)",
        padding: "100px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="tag-pill"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", marginBottom: 16, display: "inline-block" }}
          >
            Security
          </span>
          <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3vw,2.8rem)", marginBottom: 12 }}>
            Bank-Grade Security, Built In
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto" }}>
            We've built every layer of the system with security-first thinking so you
            can focus on your finances, not your worries.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {feats.map((f, i) => (
            <div
              key={i}
              className={`adv-card fade-up delay-${(i % 5) + 1}`}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "28px 24px",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ color: "white", fontSize: "1rem", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROCESS TIMELINE ───────────────────────────────────────────────────── */
function ProcessTimeline() {
  const steps = [
    { num: 1, icon: "📝", title: "Create Your Account", desc: "Register securely in under 2 minutes. Your data is encrypted from the very first click.", color: "#3b82f6" },
    { num: 2, icon: "🔗", title: "Connect Your Finances", desc: "add transactions manually.", color: "#10b981" },
    { num: 3, icon: "🤖", title: "AI Analyses Your Data", desc: "The system categorises transactions and builds your personal financial model.", color: "#8b5cf6" },
    { num: 4, icon: "📊", title: "Get Actionable Insights", desc: "View your dashboard, reports, and AI recommendations all in one place.", color: "#f59e0b" },
    { num: 5, icon: "📈", title: "Grow Your Wealth", desc: "Track goals, reduce debt, and increase savings month over month.", color: "#ef4444" },
  ];

  return (
    <section style={{ background: "white", padding: "100px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="tag-pill"
            style={{ background: "#eff6ff", color: "#1e40af", marginBottom: 16, display: "inline-block" }}
          >
            How It Works
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", color: "#0a1628" }}>
            From Sign-Up to Financial Freedom
          </h2>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* vertical line */}
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 20,
              bottom: 20,
              width: 2,
              background: "linear-gradient(to bottom, #3b82f6, #ef4444)",
              borderRadius: 999,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`fade-up delay-${i + 1}`}
              style={{
                display: "flex",
                gap: 32,
                alignItems: "flex-start",
                padding: "20px 0",
                paddingLeft: 8,
              }}
            >
              {/* Icon bubble */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: step.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                  boxShadow: `0 8px 24px ${step.color}40`,
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {step.icon}
              </div>

              {/* Text */}
              <div style={{ paddingTop: 12 }}>
                <h3 style={{ fontSize: "1.15rem", color: "#0a1628", marginBottom: 6 }}>
                  {step.num}. {step.title}
                </h3>
                <p style={{ color: "#475569", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── MAIN LANDING PAGE ─────────────────────────────────────────────────── */
const LandingPage = () => {
  useScrollReveal();

  return (
    <>
      {/* Inject global styles */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">

        {/* ══ ORIGINAL: Hero Section ══════════════════════════════════════ */}
        <HeroSection />

        {/* ══ NEW: Marquee Feature Strip ══════════════════════════════════ */}
        <MarqueeStrip />

        {/* ══ ORIGINAL: Hero Finance Visual Section ══════════════════════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div className="slide-left">
              <h2 className="text-4xl font-bold mb-6">
                Take Control of Your Financial Life
              </h2>
              <p className="text-gray-600 mb-6">
                Track income, control expenses, and grow your wealth with smart
                financial insights. Our system helps you understand your money
                in a simple and powerful way.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li>✔ Real-time expense tracking</li>
                <li>✔ Smart budgeting insights</li>
                <li>✔ Net worth monitoring</li>
                <li>✔ Financial goal tracking</li>
              </ul>
            </div>
            <div className="flex justify-center slide-right">
              <Image
                src="/Dashbord.png"
                alt="Finance Dashboard"
                width={500}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* ══ ORIGINAL: Stats Section ═════════════════════════════════════ */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsData.map((stat, index) => (
                <div key={index} className="text-center fade-up">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ORIGINAL: Features Section ══════════════════════════════════ */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 fade-up">
              Everything you need to manage your finances
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuresData.map((feature, index) => (
                <Card className="p-6 card-hover adv-card fade-up" key={index}>
                  <CardContent className="space-y-4 pt-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEW: System Objectives Section ══════════════════════════════ */}
        <ObjectivesSection />

        {/* ══ ORIGINAL: Financial Insights Section ════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10 fade-up">Smart Financial Insights</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 shadow-lg hover:scale-105 transition adv-card slide-left">
                <CardContent>
                  <Image src="/budget.png" alt="Budget" width={80} height={80} className="mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Budget Tracking</h3>
                  <p className="text-gray-600">Monitor your spending habits and stay within your financial limits.</p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-lg hover:scale-105 transition adv-card fade-up">
                <CardContent>
                  <Image src="/savings.png" alt="Savings" width={80} height={80} className="mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Savings Growth</h3>
                  <p className="text-gray-600">Track how your savings grow over time and achieve your goals faster.</p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-lg hover:scale-105 transition adv-card slide-right">
                <CardContent>
                  <Image src="/investment.png" alt="Investment" width={80} height={80} className="mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Investment Tracking</h3>
                  <p className="text-gray-600">Monitor your portfolio and understand your financial growth.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ══ NEW: AI Insights Showcase ════════════════════════════════════ */}
        <AIInsightsSection />

        {/* ══ NEW: Process Timeline ════════════════════════════════════════ */}
        <ProcessTimeline />

        {/* ══ ORIGINAL: How It Works Section ══════════════════════════════ */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 fade-up">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {howItWorksData.map((step, index) => (
                <div key={index} className="text-center fade-up">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEW: Notification Section ════════════════════════════════════ */}
        <NotificationSection />

        {/* ══ ORIGINAL: Financial Planning Section ═══════════════════════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 fade-up">Plan Your Financial Future</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Emergency Savings", desc: "Prepare for unexpected expenses by building a strong financial safety net." },
                { title: "Investment Tracking", desc: "Monitor your investments and watch your wealth grow over time." },
                { title: "Financial Reports", desc: "Get insights and reports to make smarter financial decisions." },
              ].map((item, i) => (
                <Card key={i} className={`p-6 adv-card ${i % 2 === 0 ? "slide-left" : "slide-right"}`}>
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEW: Enhanced Security Section ══════════════════════════════ */}
        <SecurityEnhanced />
{/* ══ ORIGINAL: Testimonials Section ══════════════════════════════ */}
<section id="testimonials" className="py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-16 fade-up">
      What Our Users Say
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonialsData.map((testimonial, index) => (
        <Card
          key={index}
          className={`p-6 adv-card ${
            index === 1
              ? "fade-up"
              : index === 0
              ? "slide-left"
              : "slide-right"
          }`}
        >
          <CardContent className="pt-4">
            <div className="flex items-center mb-4">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={40}
                height={40}
                className="rounded-full"
              />

              <div className="ml-4">
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="text-yellow-500 mb-2 text-sm">
              ⭐⭐⭐⭐⭐
            </div>

            <p className="text-gray-600">
              "{testimonial.quote}"
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
        {/* ══ ORIGINAL: Security Section ══════════════════════════════════ */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Bank-Level Security You Can Trust</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-10">
              Your financial data is protected with advanced encryption and modern security practices.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-sm">
              <div>🔐 End-to-end encryption</div>
              <div>🛡️ Secure authentication</div>
              <div>🚫 No data selling</div>
            </div>
          </div>
        </section>

        {/* ══ ORIGINAL: CTA Section ═══════════════════════════════════════ */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 fade-up">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their finances smarter with Welth
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="shimmer-btn animate-bounce text-white font-semibold px-10 py-4 text-lg rounded-full"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
};

export default LandingPage;