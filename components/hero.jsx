"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Aurora + Grid Background ─────────────────────────────────────────────────
const AuroraBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.45 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      // Draw subtle grid
      ctx.strokeStyle = "rgba(99,102,241,0.06)";
      ctx.lineWidth = 0.5;
      const gs = 70;
      for (let x = 0; x < canvas.width; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Particles + connections
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 95) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - d / 95)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// ─── Typewriter ───────────────────────────────────────────────────────────────
const Typewriter = ({ words, speed = 72, pause = 2500 }) => {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    const t = del
      ? setTimeout(() => { setDisplay(w.slice(0, ci - 1)); setCi(c => c - 1); if (ci - 1 === 0) { setDel(false); setWi(i => (i + 1) % words.length); } }, speed / 2)
      : ci < w.length
        ? setTimeout(() => { setDisplay(w.slice(0, ci + 1)); setCi(c => c + 1); }, speed)
        : setTimeout(() => setDel(true), pause);
    return () => clearTimeout(t);
  }, [ci, del, wi, words, speed, pause]);
  return <span className="tw">{display}<span className="twc">|</span></span>;
};

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { src: "/banner.jpeg", tag: "Dashboard Overview",    accent: "#818cf8", caption: "Real-time analytics at a glance" },
  { src: "/banner.jpeg", tag: "AI Budget Insights",    accent: "#a78bfa", caption: "Smart recommendations powered by AI" },
  { src: "/banner.jpeg", tag: "Investment Tracker",    accent: "#38bdf8", caption: "Monitor every asset in one place" },
  { src: "/banner.jpeg", tag: "Spending Intelligence", accent: "#34d399", caption: "Know exactly where your money goes" },
];

// ─── RTL Carousel ─────────────────────────────────────────────────────────────
const Carousel = ({ mouse, scrollY }) => {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const go = useCallback((dir = 1) => {
    if (busy) return;
    const next = (idx + dir + SLIDES.length) % SLIDES.length;
    setPrev(idx); setIdx(next); setBusy(true);
    setTimeout(() => { setPrev(null); setBusy(false); }, 680);
  }, [busy, idx]);

  useEffect(() => { timer.current = setInterval(() => go(1), 4000); return () => clearInterval(timer.current); }, [go]);

  const tx = (mouse.y * 2 - 1) * 1.8;
  const ty = (mouse.x * 2 - 1) * -1.8;
  const py = scrollY * 0.12;

  return (
    <div className="cr">
      <div className="cglow" style={{ background: SLIDES[idx].accent }} />
      <div className="cstage" style={{ transform: `perspective(1200px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(${py}px)` }}>
        <div className="ltag"><span className="ldot" />Live Dashboard Preview</div>
        {SLIDES.map((s, i) => (
          <div key={i} className={["cslide", i === idx ? "sa" : "", i === prev ? "sp" : "", busy && i === idx ? "sen" : "", busy && i === prev ? "sex" : ""].filter(Boolean).join(" ")}>
            <Image src={s.src} width={1280} height={720} alt={s.tag} className="cimg" priority={i === 0} />
            <div className="covl">
              <span className="cbadge" style={{ background: s.accent + "dd" }}>{s.tag}</span>
              <p className="ccap">{s.caption}</p>
            </div>
          </div>
        ))}
        <div className="pbar"><div className="pfill" key={idx} style={{ background: SLIDES[idx].accent }} /></div>
        <button className="carr cleft" onClick={() => go(-1)} aria-label="Prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className="carr cright" onClick={() => go(1)} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <div className="cdots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`cdot ${i === idx ? "cdon" : ""}`}
              style={i === idx ? { background: SLIDES[idx].accent, width: "26px" } : {}}
              onClick={() => !busy && i !== idx && (setPrev(idx), setIdx(i), setBusy(true), setTimeout(() => { setPrev(null); setBusy(false); }, 680))} />
          ))}
        </div>
        <div className="sctr">
          <span style={{ color: "white", fontWeight: 700 }}>{String(idx + 1).padStart(2, "0")}</span>
          <span style={{ color: "rgba(255,255,255,.35)", margin: "0 3px" }}>/</span>
          <span style={{ color: "rgba(255,255,255,.4)" }}>{String(SLIDES.length).padStart(2, "0")}</span>
        </div>
      </div>
      {/* Floating cards */}
      <div className="fcard fc1"><span className="fcic">📈</span><div><div className="fcv">+24.8%</div><div className="fcl">Portfolio Growth</div></div><span className="fctag fcup">▲ MoM</span></div>
      <div className="fcard fc2"><span className="fcic">🤖</span><div><div className="fcv">AI Insight</div><div className="fcl">Save Kes2340/mo detected</div></div></div>
      <div className="fcard fc3"><span className="fcic">🏦</span><div><div className="fcv">Kes12,430</div><div className="fcl">Total Savings Balance</div></div><span className="fctag fcup">▲ 8%</span></div>
    </div>
  );
};

// ─── HeroSection ──────────────────────────────────────────────────────────────
const HeroSection = () => {
  const [vis, setVis] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [hov, setHov] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    const onS = () => setScrollY(window.scrollY);
    const onM = (e) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("scroll", onS, { passive: true });
    window.addEventListener("mousemove", onM);
    return () => { window.removeEventListener("scroll", onS); window.removeEventListener("mousemove", onM); };
  }, []);

  const features = [
    { icon: "⚡", title: "Real-Time Analytics",    sub: "Every transaction tracked and visualised the instant it happens — no delays, no guesswork",   color: "#818cf8", glow: "#818cf844" },
    { icon: "🤖", title: "AI-Powered Forecasting", sub: "Our machine learning engine studies your habits and predicts spending patterns weeks in advance", color: "#a78bfa", glow: "#a78bfa44" },
    { icon: "📊", title: "Smart Dashboards",       sub: "Interactive, fully customisable financial views built to make complex data feel effortless",     color: "#38bdf8", glow: "#38bdf844" },
    { icon: "🔔", title: "Intelligent Alerts",     sub: "Context-aware notifications fire before you overspend — saving you money automatically",         color: "#fbbf24", glow: "#fbbf2444" },
    { icon: "🔒", title: "Bank-Grade Security",    sub: "256-bit AES encryption, two-factor authentication, and SOC 2 compliance protect every byte",     color: "#f87171", glow: "#f8717144" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        /* ══ SECTION — deep midnight background ══ */
        .hs {
          position: relative; min-height: 100vh;
          padding: 7rem 1.25rem 5rem; overflow: hidden;
          background: #07071a;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Layered gradient orbs ── */
        .hs-bg {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(ellipse 70% 55% at 10% 0%,   rgba(99,102,241,0.28) 0%,  transparent 55%),
            radial-gradient(ellipse 50% 50% at 90% 5%,   rgba(139,92,246,0.20) 0%,  transparent 50%),
            radial-gradient(ellipse 60% 45% at 50% 100%, rgba(56,189,248,0.15) 0%,  transparent 55%),
            radial-gradient(ellipse 40% 60% at 80% 55%,  rgba(167,139,250,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 35% 35% at 20% 75%,  rgba(52,211,153,0.10) 0%,  transparent 50%);
          animation: auroraShift 18s ease-in-out infinite alternate;
        }
        @keyframes auroraShift {
          0%   { opacity: 1;   transform: scale(1)    rotate(0deg); }
          50%  { opacity: 0.85; transform: scale(1.04) rotate(0.6deg); }
          100% { opacity: 0.9; transform: scale(1.02) rotate(-0.4deg); }
        }

        /* ── Vignette ── */
        .hs-vign {
          position: absolute; inset: 0; pointer-events: none; z-index: 2;
          background: radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(7,7,26,0.85) 100%);
        }

        /* ── Noise grain ── */
        .hs-noise {
          position: absolute; inset: 0; pointer-events: none; z-index: 3; opacity: 0.55;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }

        /* ══ WRAPPER ══ */
        .hw { position: relative; z-index: 10; max-width: 1140px; margin: 0 auto; text-align: center; }

        /* ══ ENTRANCE ══ */
        .fu { opacity: 0; transform: translateY(30px); transition: opacity .85s ease, transform .85s ease; }
        .fu.in { opacity: 1; transform: translateY(0); }

        /* ══ TOP BADGE ══ */
        .badge {
          display: inline-flex; align-items: center; gap: .52rem;
          padding: .32rem 1.05rem .32rem .58rem; border-radius: 999px;
          border: 1px solid rgba(139,92,246,.45);
          background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(139,92,246,.12));
          backdrop-filter: blur(10px);
          font-size: .68rem; font-weight: 800; letter-spacing: .13em;
          text-transform: uppercase; color: #c4b5fd; margin-bottom: 1.9rem;
          box-shadow: 0 0 0 1px rgba(139,92,246,.2), 0 4px 20px rgba(99,102,241,.2);
        }
        .bdot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; animation: dp 1.7s infinite; }
        @keyframes dp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }
        .bnew {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-size: .58rem; font-weight: 900;
          padding: .13rem .46rem; border-radius: 999px; letter-spacing: .08em;
        }

        /* ══ HEADLINE ══ */
        .h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.7rem, 6.5vw, 6.2rem);
          font-weight: 800; line-height: 1.04; letter-spacing: -.04em;
          color: #f0f0ff; margin-bottom: .55rem;
        }
        .hgrad {
          background: linear-gradient(128deg, #818cf8 0%, #c084fc 40%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 30px rgba(139,92,246,.5));
        }
        .tw { font-style: italic; }
        .twc { animation: bl .72s step-end infinite; color: #a78bfa; }
        @keyframes bl { 0%,100%{opacity:1} 50%{opacity:0} }
        .h1sub {
          display: block; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .42em; font-weight: 400; font-style: italic;
          color: rgba(148,148,200,.65); letter-spacing: .005em; margin-top: .42rem;
        }

        /* ══ DECORATIVE RULE ══ */
        .rule { display:flex; align-items:center; justify-content:center; gap:.7rem; margin: 1.3rem auto 1.9rem; max-width: 280px; }
        .rl { flex:1; height:1px; background: linear-gradient(to right, transparent, rgba(139,92,246,.5)); }
        .rl.r { background: linear-gradient(to left, transparent, rgba(139,92,246,.5)); }
        .rdiam {
          width: 8px; height: 8px;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          transform: rotate(45deg); border-radius: 2px;
          box-shadow: 0 0 10px rgba(139,92,246,.7);
        }

        /* ══ HERO CONTENT CARD ══ */
        .hero-card {
          max-width: 780px; margin: 0 auto 2rem;
          padding: 2.2rem 2.4rem 2rem;
          background: linear-gradient(145deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.02) 100%);
          border: 1px solid rgba(139,92,246,.2);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          box-shadow:
            0 0 0 1px rgba(139,92,246,.08),
            0 8px 32px rgba(0,0,0,.4),
            inset 0 1px 0 rgba(255,255,255,.07);
          position: relative; overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.6), rgba(99,214,255,.4), transparent);
        }
        .hero-card::after {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Card label */
        .card-label {
          display: inline-flex; align-items: center; gap: .4rem;
          font-size: .65rem; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: #a78bfa; margin-bottom: 1rem;
        }
        .card-label-line { width: 24px; height: 1px; background: #a78bfa; opacity: .6; }

        /* Lead text */
        .lead {
          font-size: clamp(.96rem, 1.5vw, 1.08rem);
          color: rgba(220,220,255,.78);
          font-weight: 400; line-height: 1.88;
          text-align: left; margin-bottom: 1.6rem;
          position: relative;
        }
        .lead strong { color: #f0f0ff; font-weight: 700; }
        .lead em {
          color: #c4b5fd; font-style: normal; font-weight: 600;
          border-bottom: 1px solid rgba(196,181,253,.35);
          padding-bottom: 1px;
        }

        /* Stats mini-row inside card */
        .mini-stats {
          display: flex; gap: 0; border-top: 1px solid rgba(139,92,246,.15);
          padding-top: 1.3rem; margin-top: 0; flex-wrap: wrap;
        }
        .mstat {
          flex: 1; min-width: 120px; text-align: center;
          padding: 0 1rem; border-right: 1px solid rgba(139,92,246,.12);
        }
        .mstat:last-child { border-right: none; }
        .mstat-num {
          font-family: 'Syne', sans-serif; font-size: 1.65rem; font-weight: 800;
          letter-spacing: -.04em; line-height: 1;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .mstat-lbl { font-size: .67rem; color: rgba(148,148,200,.7); font-weight: 500; margin-top: .28rem; text-transform: uppercase; letter-spacing: .07em; }

        /* ══ MARQUEE ══ */
        .mq-wrap {
          overflow: hidden; margin: 1.8rem 0;
          border-top: 1px solid rgba(139,92,246,.12);
          border-bottom: 1px solid rgba(139,92,246,.12);
          padding: .55rem 0;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .mq-track { display: flex; gap: 2rem; width: max-content; animation: mqScroll 26s linear infinite; }
        .mq-track:hover { animation-play-state: paused; }
        @keyframes mqScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mtag {
          display: inline-flex; align-items: center; gap: .42rem; white-space: nowrap;
          font-size: .7rem; font-weight: 700; letter-spacing: .05em;
          color: rgba(180,180,220,.75); padding: .26rem .72rem; border-radius: 999px;
          background: rgba(139,92,246,.1); border: 1px solid rgba(139,92,246,.2);
          transition: all .25s; cursor: default;
        }
        .mtag:hover { border-color: #818cf8; color: #c4b5fd; background: rgba(139,92,246,.18); transform: scale(1.05); }
        .mdiv { color: rgba(139,92,246,.35); }

        /* ══ SECTION TITLE ══ */
        .sec-label {
          display: flex; align-items: center; justify-content: center; gap: .8rem;
          margin-bottom: 1.3rem;
        }
        .sec-rule { flex: 1; max-width: 80px; height: 1px; background: rgba(139,92,246,.25); }
        .sec-text {
          font-size: .65rem; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; color: rgba(139,92,246,.8);
        }

        /* ══ FEATURES GRID ══ */
        .fgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: .85rem; max-width: 920px; margin: 0 auto 2.4rem; }

        .fi {
          display: flex; align-items: flex-start; gap: .75rem;
          padding: 1.1rem 1.15rem; border-radius: 18px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(139,92,246,.15);
          transition: all .3s cubic-bezier(.22,1,.36,1);
          cursor: default; position: relative; overflow: hidden;
          animation: slideUpFi .6s ease both;
        }
        @keyframes slideUpFi { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fi::before {
          content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity .35s;
          background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(139,92,246,.05));
        }
        .fi::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.0), transparent);
          transition: background .35s;
        }
        .fi:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,.4);
          box-shadow: 0 8px 30px rgba(0,0,0,.3), 0 0 0 1px rgba(139,92,246,.15);
        }
        .fi:hover::before { opacity: 1; }
        .fi:hover::after { background: linear-gradient(90deg, transparent, rgba(139,92,246,.5), transparent); }
        .fi:hover .fi-icon { transform: scale(1.18) rotate(-6deg); }
        .fi:hover .fi-arrow { opacity: 1; transform: translateX(0) translateY(-50%); }

        .fi-icon {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 1.05rem;
          transition: transform .3s;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
        }
        .fi-body { flex: 1; text-align: left; }
        .fi-title { display: block; font-size: .82rem; font-weight: 700; color: #e8e8ff; letter-spacing: -.01em; line-height: 1.25; margin-bottom: .22rem; transition: color .3s; }
        .fi-sub { display: block; font-size: .7rem; color: rgba(148,148,200,.65); line-height: 1.5; }
        .fi-arrow {
          position: absolute; top: 50%; right: 1rem;
          opacity: 0; transform: translateX(-6px) translateY(-50%);
          transition: all .28s; font-size: .9rem;
        }

        /* ══ CTA ══ */
        .ctaw { display: flex; justify-content: center; gap: .85rem; flex-wrap: wrap; margin-bottom: 1.6rem; }
        .bprim {
          position: relative; display: inline-flex; align-items: center;
          overflow: hidden; padding: .88rem 2.2rem; border-radius: 14px;
          border: none; cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200% 100%;
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .93rem; font-weight: 700; letter-spacing: .01em;
          text-decoration: none;
          box-shadow: 0 5px 28px rgba(99,102,241,.45), 0 0 0 1px rgba(139,92,246,.3);
          transition: transform .22s, box-shadow .22s, background-position .5s;
        }
        .bprim::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          opacity: 0; transition: opacity .3s;
        }
        .bprim:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(99,102,241,.55), 0 0 0 1px rgba(139,92,246,.4); }
        .bprim:hover::before { opacity: 1; }
        .bpi { position: relative; z-index: 1; display: flex; align-items: center; gap: .5rem; }

        /* ══ TRUST BAR ══ */
        .tbar { display: flex; align-items: center; justify-content: center; gap: 1.1rem; flex-wrap: wrap; margin-bottom: 3.2rem; }
        .titem { display: flex; align-items: center; gap: .42rem; font-size: .74rem; color: rgba(180,180,220,.7); font-weight: 500; }
        .tic {
          width: 25px; height: 25px; border-radius: 8px;
          background: rgba(139,92,246,.15); border: 1px solid rgba(139,92,246,.2);
          display: flex; align-items: center; justify-content: center; font-size: .84rem;
        }
        .tsep { width: 3px; height: 3px; border-radius: 50%; background: rgba(139,92,246,.35); }
        .avs { display: flex; }
        .av {
          width: 27px; height: 27px; border-radius: 50%;
          border: 2px solid #07071a;
          display: flex; align-items: center; justify-content: center;
          font-size: .57rem; font-weight: 700; color: white; margin-left: -7px;
        }
        .av:first-child { margin-left: 0; }
        .stars { color: #fbbf24; font-size: .72rem; letter-spacing: 1px; }

        /* ══ CAROUSEL ══ */
        .cr { position: relative; max-width: 960px; margin: 0 auto; }
        .cglow { position: absolute; inset: -60px; border-radius: 50%; pointer-events: none; z-index: -1; opacity: .2; filter: blur(60px); transition: background 1.2s ease; }
        .cstage {
          position: relative; border-radius: 22px; overflow: hidden; aspect-ratio: 16/9;
          box-shadow: 0 2px 4px rgba(0,0,0,.2), 0 12px 44px rgba(0,0,0,.5), 0 44px 110px rgba(99,102,241,.18),
            0 0 0 1px rgba(139,92,246,.25);
          will-change: transform; transition: transform .12s linear;
        }
        .ltag {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: .46rem; padding: .27rem .92rem;
          border-radius: 999px; z-index: 20;
          background: rgba(15,15,40,.9); border: 1px solid rgba(139,92,246,.4);
          font-size: .67rem; font-weight: 700; color: #a78bfa; letter-spacing: .05em;
          box-shadow: 0 4px 14px rgba(0,0,0,.3); white-space: nowrap; backdrop-filter: blur(8px);
        }
        .ldot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: dp 1.4s infinite; }
        .cslide { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
        .sa { opacity: 1; pointer-events: auto; z-index: 2; }
        .sp { opacity: 1; z-index: 1; }
        @keyframes rtlE { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes rtlX { from{transform:translateX(0);opacity:1} to{transform:translateX(-105%);opacity:0} }
        .sen { animation: rtlE .65s cubic-bezier(.22,1,.36,1) forwards; }
        .sex { animation: rtlX .65s cubic-bezier(.22,1,.36,1) forwards; }
        .cimg { width: 100%; height: 100%; object-fit: cover; }
        .covl {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 1.2rem 1.4rem;
          background: linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 100%);
          display: flex; align-items: flex-end; gap: .85rem; z-index: 5;
        }
        .cbadge { padding: .26rem .7rem; border-radius: 999px; color: white; font-size: .66rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; }
        .ccap { color: rgba(255,255,255,.9); font-size: .85rem; font-weight: 500; margin: 0; }
        .pbar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,.12); z-index: 10; }
        .pfill { height: 100%; border-radius: 2px; animation: pf 4s linear forwards; }
        @keyframes pf { from{width:0%} to{width:100%} }
        .carr {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 15;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(15,15,40,.85); border: 1px solid rgba(139,92,246,.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.3);
          transition: transform .2s, box-shadow .2s, background .2s;
          color: #a78bfa; padding: 0; backdrop-filter: blur(6px);
        }
        .carr svg { width: 17px; height: 17px; }
        .carr:hover { transform: translateY(-50%) scale(1.1); box-shadow: 0 8px 24px rgba(0,0,0,.4); background: rgba(99,102,241,.3); }
        .cleft { left: -19px; } .cright { right: -19px; }
        .cdots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 15; }
        .cdot { width: 7px; height: 7px; border-radius: 999px; background: rgba(255,255,255,.3); border: none; cursor: pointer; transition: width .3s, background .3s; padding: 0; }
        .sctr { position: absolute; bottom: 12px; right: 12px; font-family: 'Syne', sans-serif; font-size: .76rem; z-index: 15; }
        .fcard {
          position: absolute; z-index: 20; display: flex; align-items: center; gap: .58rem;
          padding: .58rem .9rem; border-radius: 14px;
          background: rgba(15,15,40,.88); border: 1px solid rgba(139,92,246,.3);
          box-shadow: 0 4px 20px rgba(0,0,0,.4); backdrop-filter: blur(14px); pointer-events: none;
        }
        .fcic { font-size: 1.1rem; line-height: 1; }
        .fcv { font-family: 'Syne', sans-serif; font-size: .88rem; font-weight: 800; color: #f0f0ff; line-height: 1; }
        .fcl { font-size: .59rem; color: rgba(148,148,200,.7); font-weight: 500; margin-top: 2px; }
        .fctag { font-size: .58rem; font-weight: 700; padding: .09rem .3rem; border-radius: 6px; }
        .fcup { color: #4ade80; background: rgba(74,222,128,.15); }
        .fc1 { top: -13px; left: -22px; } .fc2 { top: 37%; right: -22px; } .fc3 { bottom: 26px; left: -22px; }
        @keyframes fy { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        .fc1 { animation: fy 4.2s ease-in-out infinite; }
        .fc2 { animation: fy 5.1s ease-in-out infinite 1.1s; }
        .fc3 { animation: fy 4.7s ease-in-out infinite 2.1s; }

        /* Scroll hint */
        .shint { margin-top: 2.8rem; display: flex; flex-direction: column; align-items: center; gap: .35rem; opacity: 0; animation: fin 1s ease 2.2s forwards; }
        @keyframes fin { to{opacity:1} }
        .smouse { width: 21px; height: 32px; border: 2px solid rgba(139,92,246,.45); border-radius: 999px; display: flex; justify-content: center; padding-top: 4px; }
        .swheel { width: 3px; height: 6px; border-radius: 999px; background: rgba(139,92,246,.6); animation: sw 1.5s ease-in-out infinite; }
        @keyframes sw { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(9px)} }
        .stxt { font-size: .62rem; color: rgba(148,148,200,.55); font-weight: 500; letter-spacing: .1em; text-transform: uppercase; }

        @media(max-width:768px) {
          .fgrid { grid-template-columns: 1fr 1fr; }
          .fc1,.fc2,.fc3 { display: none; }
          .carr { display: none; }
          .mini-stats { justify-content: center; }
          .mstat { min-width: 100px; }
        }
        @media(max-width:480px) { .fgrid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="hs">
        <AuroraBackground />
        <div className="hs-bg" />
        <div className="hs-vign" />
        <div className="hs-noise" />

        <div className="hw">

          {/* ── Badge ── */}
          <div className={`badge fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".04s" }}>
            <span className="bdot" />
            <span className="bnew">NEW</span>
            AI-POWERED FINANCE MANEGMENT SYSTEM
          </div>

          {/* ── Headline ── */}
          <h1 className={`h1 fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".13s" }}>
            Take Full Control of{" "}
            <span className="hgrad">
              <Typewriter words={["Your Wealth", "Your Finances", "Your Budget", "Your Future"]} />
            </span>
            <span className="h1sub">— Manege your finances Efficiently</span>
          </h1>

          {/* ── Rule ── */}
          <div className={`rule fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".19s" }}>
            <span className="rl" /><span className="rdiam" /><span className="rl r" />
          </div>

          {/* ── Hero Card — lead text + mini stats ── */}
          <div className={`hero-card fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".25s" }}>
            <div className="card-label">
              <span className="card-label-line" />
              About SmartFinance
              <span className="card-label-line" />
            </div>
            <p className="lead">
              <strong>SmartFinance</strong> is a next-generation financial management platform
              that merges the power of <em>real-time data analytics</em>,{" "}
              <em>machine learning predictions</em>, and <em>intelligent automation</em> into
              one beautifully crafted experience. Designed for forward-thinking individuals and
              high-performing teams, SmartFinance transforms raw financial data into{" "}
              <strong>clear, actionable intelligence</strong> — empowering you to eliminate wasteful
              spending, grow your savings, and reach your financial goals with{" "}
              <strong>unprecedented speed and confidence</strong> every single day.
            </p>
            {/* Mini stats inside card */}
            <div className="mini-stats">
              {[
               
              ].map(s => (
                <div className="mstat" key={s.l}>
                  <div className="mstat-num">{s.n}</div>
                  <div className="mstat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Marquee ── */}
          <div className={`mq-wrap fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".32s" }}>
            <div className="mq-track">
              {[
                { ic:"⚡", l:"Real-Time Analytics" },    { ic:"🤖", l:"AI Forecasting" },
                { ic:"📊", l:"Smart Dashboards" },      { ic:"🔔", l:"Intelligent Alerts" },
                { ic:"🔒", l:"Bank-Grade Security" },
                { ic:"📱", l:"Mobile Ready" },          { ic:"🚀", l:"Zero Setup" },
                { ic:"💡", l:"AI Insights" },           { ic:"📈", l:"Portfolio Growth" },
                { ic:"⚡", l:"Real-Time Analytics" },    { ic:"🤖", l:"AI Forecasting" },
                { ic:"📊", l:"Smart Dashboards" },      { ic:"🔔", l:"Intelligent Alerts" },
                { ic:"🔒", l:"Bank-Grade Security" },
                { ic:"🚀", l:"Zero Setup" },
                { ic:"💡", l:"AI Insights" },           { ic:"📈", l:"Portfolio Growth" },
              ].map((m, i) => (
                <React.Fragment key={i}>
                  <span className="mtag">{m.ic} {m.l}</span>
                  {i % 10 !== 9 && <span className="mdiv">✦</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── Section label ── */}
          <div className={`sec-label fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".37s" }}>
            <span className="sec-rule" /><span className="sec-text">Platform Features</span><span className="sec-rule" />
          </div>

          {/* ── Features Grid ── */}
          <div className={`fgrid fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".41s" }}>
            {[
              { icon:"⚡", title:"Real-Time Analytics",    sub:"Every transaction tracked & visualised the instant it happens — zero delays",                 color:"#818cf8" },
              { icon:"🤖", title:"AI-Powered Forecasting", sub:"Our ML engine studies your habits and predicts spending patterns weeks ahead",                  color:"#c084fc" },
              { icon:"📊", title:"Smart Dashboards",       sub:"Fully customisable interactive views that make complex financial data feel effortless",         color:"#38bdf8" },
              { icon:"🔔", title:"Intelligent Alerts",     sub:"Context-aware notifications fire before you overspend — protecting your budget automatically",  color:"#fbbf24" },
              { icon:"🔒", title:"Bank-Grade Security",    sub:"256-bit AES encryption, 2FA, and SOC 2 Type II compliance guard every byte of your data",      color:"#f87171" },
            ].map((f, i) => (
              <div
                key={f.title}
                className="fi"
                style={{
                  animationDelay: `${0.41 + i * 0.08}s`,
                  borderColor: hov === i ? f.color + "55" : undefined,
                  boxShadow: hov === i ? `0 8px 30px rgba(0,0,0,.35), 0 0 20px ${f.color}22` : undefined,
                }}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
              >
                <div className="fi-icon" style={{ background: hov === i ? f.color + "22" : undefined, borderColor: hov === i ? f.color + "44" : undefined }}>
                  {f.icon}
                </div>
                <div className="fi-body">
                  <span className="fi-title" style={{ color: hov === i ? f.color : undefined }}>{f.title}</span>
                  <span className="fi-sub">{f.sub}</span>
                </div>
                <div className="fi-arrow" style={{ color: f.color }}>→</div>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className={`ctaw fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".58s" }}>
            <Link href="/dashboard" className="bprim">
              <span className="bpi">🚀 Get Started — It&apos;s Free</span>
            </Link>
          </div>

          {/* ── Trust bar ── */}
          <div className={`tbar fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".65s" }}>
            <div className="titem">
              <div className="avs">
                {[["#6366f1","AK"],["#8b5cf6","BL"],["#0ea5e9","CJ"],["#10b981","DM"]].map(([bg,l],i)=>(
                  <div className="av" key={i} style={{background:bg}}>{l}</div>
                ))}
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <div style={{fontSize:".69rem",color:"rgba(180,180,220,.65)"}}>Trusted by <strong style={{color:"#f0f0ff"}}>14,000+</strong> users globally</div>
              </div>
            </div>
            <span className="tsep"/>
            <div className="titem"><span className="tic">🔒</span>SOC 2 Type II</div>
            <span className="tsep"/>
          
            <div className="titem"><span className="tic">⚡</span>No Credit Card</div>
          </div>

          {/* ── RTL Carousel ── */}
          <div className={`fu ${vis ? "in" : ""}`} style={{ transitionDelay: ".72s" }}>
            <Carousel mouse={mouse} scrollY={scrollY} />
          </div>

          {/* ── Scroll hint ── */}
          <div className="shint">
            <div className="smouse"><span className="swheel" /></div>
            <span className="stxt">Scroll to explore</span>
          </div>

        </div>
      </section>
    </>
  );
};

export default HeroSection;