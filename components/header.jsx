import React from "react";
import {
  PenBox,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Shield,
  Bell,
  ChevronDown,
  BookOpen,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";
import HeaderClient from "./HeaderClient";

const Header = async () => {
  await checkUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        /* ─────────────────────────────────────────
           HEADER SHELL
        ───────────────────────────────────────── */
        .sf-header {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Rainbow top bar */
        .sf-topbar {
          height: 2.5px;
          background: linear-gradient(
            90deg,
            #6366f1 0%, #8b5cf6 25%, #38bdf8 50%, #34d399 75%, #6366f1 100%
          );
          background-size: 300% 100%;
          animation: topbarFlow 5s linear infinite;
        }
        @keyframes topbarFlow {
          0%   { background-position: 0% 0;   }
          100% { background-position: 300% 0; }
        }

        /* Main nav band */
        .sf-nav {
          background: rgba(6, 6, 20, 0.65);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid rgba(139,92,246, 0.18);
          box-shadow: 0 4px 32px rgba(0,0,0, 0.4);
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .sf-nav.is-scrolled {
          background: rgba(6, 6, 20, 0.92);
          border-bottom-color: rgba(139,92,246, 0.32);
          box-shadow: 0 8px 48px rgba(0,0,0, 0.55),
                      0 0 0 1px rgba(139,92,246, 0.1);
        }

        .sf-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex; align-items: center;
          justify-content: space-between; gap: 1.5rem;
        }

        /* ─────────────────────────────────────────
           LOGO
        ───────────────────────────────────────── */
        .sf-logo {
          display: flex; align-items: center; gap: 0.55rem;
          text-decoration: none; flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .sf-logo:hover { opacity: 0.82; }

        .sf-logo-badge {
          display: inline-flex; align-items: center; gap: 0.28rem;
          padding: 0.12rem 0.52rem; border-radius: 999px;
          background: rgba(99,102,241, 0.2);
          border: 1px solid rgba(139,92,246, 0.38);
          font-size: 0.56rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #c4b5fd;
        }
        .sf-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #a78bfa;
          animation: badgePulse 1.8s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%,100% { opacity: 1; transform: scale(1);   }
          50%      { opacity: 0.3; transform: scale(1.6); }
        }

        /* ─────────────────────────────────────────
           NAV LINKS  (desktop)
        ───────────────────────────────────────── */
        .sf-links {
          display: flex; align-items: center; gap: 0.15rem;
          flex: 1; justify-content: center;
        }

        .sf-link {
          display: inline-flex; align-items: center; gap: 0.28rem;
          padding: 0.45rem 0.78rem; border-radius: 10px;
          font-size: 0.81rem; font-weight: 600;
          color: rgba(200,200,240, 0.72);
          text-decoration: none; white-space: nowrap;
          background: transparent; border: none; cursor: pointer;
          transition: color 0.22s, background 0.22s;
          position: relative;
        }
        .sf-link::after {
          content: '';
          position: absolute; bottom: 4px;
          left: 50%; right: 50%;
          height: 1.5px;
          background: linear-gradient(90deg, #818cf8, #c084fc);
          border-radius: 999px;
          transition: left 0.28s ease, right 0.28s ease, opacity 0.28s;
          opacity: 0;
        }
        .sf-link:hover {
          color: #f0f0ff;
          background: rgba(139,92,246, 0.1);
        }
        .sf-link:hover::after { left: 18%; right: 18%; opacity: 1; }

        /* ─────────────────────────────────────────
           DROPDOWN
        ───────────────────────────────────────── */
        .sf-dd { position: relative; }

        .sf-dd-chevron {
          transition: transform 0.25s ease;
          opacity: 0.6;
        }
        .sf-dd:hover .sf-dd-chevron { transform: rotate(180deg); }

        .sf-dd-panel {
          position: absolute; top: calc(100% + 10px);
          left: 50%; transform: translateX(-50%) translateY(-8px);
          min-width: 220px; border-radius: 18px;
          background: rgba(10, 10, 32, 0.96);
          border: 1px solid rgba(139,92,246, 0.25);
          box-shadow: 0 12px 48px rgba(0,0,0, 0.55),
                      0 0 0 1px rgba(139,92,246, 0.06);
          padding: 0.5rem;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s cubic-bezier(.22,1,.36,1),
                      transform 0.25s cubic-bezier(.22,1,.36,1);
          backdrop-filter: blur(20px);
        }
        .sf-dd:hover .sf-dd-panel {
          opacity: 1; pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }

        /* Tooltip arrow */
        .sf-dd-panel::before {
          content: '';
          position: absolute; top: -5px; left: 50%; transform: translateX(-50%);
          width: 10px; height: 10px;
          background: rgba(10,10,32,0.96);
          border-left: 1px solid rgba(139,92,246,0.25);
          border-top: 1px solid rgba(139,92,246,0.25);
          transform: translateX(-50%) rotate(45deg);
        }

        .sf-dd-item {
          display: flex; align-items: center; gap: 0.7rem;
          padding: 0.65rem 0.8rem; border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
        }
        .sf-dd-item:hover { background: rgba(139,92,246, 0.14); }

        .sf-dd-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(139,92,246, 0.14);
          border: 1px solid rgba(139,92,246, 0.22);
          color: #a78bfa;
          transition: background 0.2s;
        }
        .sf-dd-item:hover .sf-dd-icon { background: rgba(139,92,246, 0.25); }

        .sf-dd-label {
          display: block; font-size: 0.8rem; font-weight: 700;
          color: #e8e8ff; line-height: 1.2;
        }
        .sf-dd-sub {
          display: block; font-size: 0.68rem;
          color: rgba(148,148,200, 0.62); margin-top: 1px;
        }

        /* ─────────────────────────────────────────
           ACTION BUTTONS
        ───────────────────────────────────────── */
        .sf-actions {
          display: flex; align-items: center;
          gap: 0.55rem; flex-shrink: 0;
        }

        /* Dashboard — ghost */
        .sf-btn-dash {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.46rem 1rem; border-radius: 10px;
          background: rgba(139,92,246, 0.1);
          border: 1px solid rgba(139,92,246, 0.25);
          color: #c4b5fd; font-size: 0.79rem; font-weight: 700;
          text-decoration: none; white-space: nowrap;
          transition: background 0.22s, border-color 0.22s,
                      color 0.22s, transform 0.22s;
        }
        .sf-btn-dash:hover {
          background: rgba(139,92,246, 0.22);
          border-color: rgba(139,92,246, 0.5);
          color: #e8e8ff; transform: translateY(-1px);
        }

        /* Add Transaction — primary gradient */
        .sf-btn-txn {
          display: inline-flex; align-items: center; gap: 0.42rem;
          padding: 0.5rem 1.1rem; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white; font-size: 0.79rem; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(99,102,241, 0.42);
          transition: transform 0.22s, box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .sf-btn-txn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .sf-btn-txn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241, 0.58);
        }
        .sf-btn-txn:hover::before { opacity: 1; }
        .sf-btn-txn-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 0.42rem;
        }

        /* Login — outlined */
        .sf-btn-login {
          display: inline-flex; align-items: center; gap: 0.38rem;
          padding: 0.5rem 1.15rem; border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(139,92,246, 0.35);
          color: #c4b5fd; font-size: 0.81rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.22s, border-color 0.22s,
                      color 0.22s, transform 0.22s;
        }
        .sf-btn-login:hover {
          background: rgba(139,92,246, 0.14);
          border-color: rgba(139,92,246, 0.55);
          color: #e8e8ff; transform: translateY(-1px);
        }

        /* Separator */
        .sf-sep {
          width: 1px; height: 22px;
          background: rgba(139,92,246, 0.22);
          margin: 0 0.1rem;
        }

        /* ─────────────────────────────────────────
           HAMBURGER (mobile)
        ───────────────────────────────────────── */
        .sf-ham {
          display: none; flex-direction: column;
          gap: 4.5px; background: none; border: none;
          cursor: pointer; padding: 0.45rem;
          border-radius: 9px;
          transition: background 0.2s;
        }
        .sf-ham:hover { background: rgba(139,92,246, 0.12); }
        .sf-ham-bar {
          width: 22px; height: 2px; border-radius: 999px;
          background: rgba(200,200,240, 0.8);
          transition: transform 0.3s, opacity 0.3s;
          transform-origin: center;
        }

        /* ─────────────────────────────────────────
           MOBILE MENU
        ───────────────────────────────────────── */
        .sf-mob {
          display: none;
          position: absolute; top: 100%; left: 0; right: 0;
          background: rgba(6,6,20, 0.97);
          border-bottom: 1px solid rgba(139,92,246, 0.2);
          backdrop-filter: blur(24px);
          padding: 0.6rem 1.25rem 1.25rem;
          box-shadow: 0 16px 48px rgba(0,0,0, 0.55);
          animation: mobSlide 0.25s cubic-bezier(.22,1,.36,1);
        }
        @keyframes mobSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        .sf-mob-link {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.7rem 0.8rem; border-radius: 10px;
          font-size: 0.88rem; font-weight: 600;
          color: rgba(200,200,240, 0.8);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .sf-mob-link:hover {
          background: rgba(139,92,246, 0.12);
          color: #f0f0ff;
        }
        .sf-mob-link svg { opacity: 0.6; }
        .sf-mob-divider {
          height: 1px; background: rgba(139,92,246, 0.12);
          margin: 0.5rem 0;
        }
        .sf-mob-actions {
          display: flex; flex-direction: column;
          gap: 0.5rem; padding-top: 0.25rem;
        }
        .sf-mob-primary {
          display: flex; align-items: center; justify-content: center;
          gap: 0.4rem; padding: 0.7rem;
          border-radius: 10px; font-size: 0.88rem; font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; text-decoration: none;
          box-shadow: 0 4px 18px rgba(99,102,241,0.4);
        }

        /* ─────────────────────────────────────────
           RESPONSIVE
        ───────────────────────────────────────── */
        @media (max-width: 768px) {
          .sf-links { display: none !important; }
          .sf-ham   { display: flex !important; }
        }
        @media (max-width: 520px) {
          .sf-btn-dash span,
          .sf-btn-txn span  { display: none; }
          .sf-inner         { padding: 0.65rem 1rem; }
        }
      `}</style>

      <header className="sf-header" id="sf-header">
        {/* Animated top accent */}
        <div className="sf-topbar" />

        {/* Nav band */}
        <div className="sf-nav" id="sf-nav">
          <div className="sf-inner">

            {/* ── Logo ── */}
            <Link href="/" className="sf-logo">
              <Image
                src="/logo.png"
                alt="SmartFinance Logo"
                width={180}
                height={44}
                className="h-9 w-auto object-contain"
                priority
              />
              <span className="sf-logo-badge">
                <span className="sf-badge-dot" />
                Pro
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="sf-links" aria-label="Main navigation">

              {/* Signed-out nav */}
              <SignedOut>
                {/* Features with dropdown */}
                <div className="sf-dd">
                  <a href="#features" className="sf-link">
                    Features
                    <ChevronDown size={13} className="sf-dd-chevron" />
                  </a>
                  <div className="sf-dd-panel">
                    {[
                      { Icon: TrendingUp, label: "AI Analytics",  sub: "Real-time financial insights"  },
                      { Icon: Shield,     label: "Security",       sub: "256-bit bank-grade protection" },
                      { Icon: Bell,       label: "Smart Alerts",   sub: "Budget notifications & nudges" },
                    ].map(({ Icon, label, sub }) => (
                      <a href="#features" className="sf-dd-item" key={label}>
                        <span className="sf-dd-icon"><Icon size={14} /></span>
                        <span>
                          <span className="sf-dd-label">{label}</span>
                          <span className="sf-dd-sub">{sub}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <a href="#testimonials" className="sf-link">Testimonials</a>

                <Link href="/about" className="sf-link">
                  <BookOpen size={13} />
                  About
                </Link>

                <Link href="/contact" className="sf-link">
                  <Mail size={13} />
                  Contact
                </Link>
              </SignedOut>

              {/* Signed-in nav */}
              <SignedIn>
                <Link href="/dashboard"          className="sf-link">Overview</Link>
                <Link href="/transaction/create" className="sf-link">Transactions</Link>
                <Link href="/budgets"            className="sf-link">Budgets</Link>
                <Link href="/reports"            className="sf-link">Reports</Link>
              </SignedIn>

            </nav>

            {/* ── Action buttons ── */}
            <div className="sf-actions">

              <SignedIn>
                <Link href="/dashboard" className="sf-btn-dash">
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </Link>

                <a href="/transaction/create" className="sf-btn-txn">
                  <span className="sf-btn-txn-inner">
                    <PenBox size={14} />
                    <span>Add Transaction</span>
                  </span>
                </a>

                <span className="sf-sep" />

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-purple-500/30 ring-offset-1 ring-offset-transparent rounded-full",
                      userButtonPopoverCard:
                        "bg-[#08081e] border border-purple-500/20 shadow-2xl",
                      userButtonPopoverActionButton:
                        "text-purple-200 hover:bg-purple-500/10 rounded-lg",
                      userButtonPopoverFooter: "border-purple-500/10",
                    },
                  }}
                />
              </SignedIn>

              <SignedOut>
                <SignInButton forceRedirectUrl="/dashboard">
                  <button className="sf-btn-login">
                    <Sparkles size={13} />
                    Login
                  </button>
                </SignInButton>
              </SignedOut>

              {/* Hamburger (mobile) */}
              <button
                className="sf-ham"
                id="sf-ham"
                aria-label="Toggle navigation"
                aria-expanded="false"
              >
                <span className="sf-ham-bar" />
                <span className="sf-ham-bar" />
                <span className="sf-ham-bar" />
              </button>

            </div>
          </div>

          {/* ── Mobile menu ── */}
          <div className="sf-mob" id="sf-mob" style={{ display: "none" }}>
            <SignedOut>
              <a href="#features"     className="sf-mob-link"><TrendingUp size={15} />Features</a>
              <a href="#testimonials" className="sf-mob-link"><Bell size={15} />Testimonials</a>
              <Link href="/about"     className="sf-mob-link"><BookOpen size={15} />About</Link>
              <Link href="/contact"   className="sf-mob-link"><Mail size={15} />Contact</Link>
              <div className="sf-mob-divider" />
              <div className="sf-mob-actions">
                <SignInButton forceRedirectUrl="/dashboard">
                  <button className="sf-btn-login" style={{ width: "100%", justifyContent: "center" }}>
                    <Sparkles size={13} /> Login to SmartFinance
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard"          className="sf-mob-link"><LayoutDashboard size={15} />Overview</Link>
              <Link href="/budgets"            className="sf-mob-link">📊 Budgets</Link>
              <Link href="/reports"            className="sf-mob-link">📈 Reports</Link>
              <div className="sf-mob-divider" />
              <a href="/transaction/create" className="sf-mob-primary">
                <PenBox size={15} /> Add Transaction
              </a>
            </SignedIn>
          </div>
        </div>

        {/* Client: scroll detection + hamburger toggle */}
        <HeaderClient />
      </header>
    </>
  );
};

export default Header;
