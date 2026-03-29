"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes gridPulse {
    0%, 100% { opacity: 0.03; }
    50%       { opacity: 0.07; }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(30px,-20px) scale(1.1); }
    66%     { transform: translate(-20px,15px) scale(0.95); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-40px,30px) scale(1.08); }
  }
  @keyframes countUp {
    from { opacity:0; transform: translateY(12px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes borderGlow {
    0%,100% { border-color: rgba(56,189,248,0.3); }
    50%     { border-color: rgba(56,189,248,0.8); }
  }
  @keyframes heartbeat {
    0%,100% { transform: scale(1); }
    25%     { transform: scale(1.3); }
    45%     { transform: scale(1); }
    65%     { transform: scale(1.15); }
  }

  .sf-footer {
    font-family: 'DM Sans', sans-serif;
    background: #060d1a;
    position: relative;
    overflow: hidden;
  }
  .sf-footer::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridPulse 6s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  .sf-orb-1 {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(30,64,175,0.18) 0%, transparent 70%);
    top: -100px; left: -100px;
    animation: orb1 12s ease-in-out infinite;
    pointer-events: none; z-index: 0;
  }
  .sf-orb-2 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%);
    bottom: 80px; right: -80px;
    animation: orb2 15s ease-in-out infinite;
    pointer-events: none; z-index: 0;
  }
  .sf-footer-inner { position: relative; z-index: 1; }

  .sf-top-banner {
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 48px 0;
  }
  .sf-top-banner-grid {
    max-width: 1200px; margin: 0 auto; padding: 0 32px;
    display: grid; grid-template-columns: 1fr auto;
    gap: 40px; align-items: center;
  }
  .sf-banner-tagline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    color: white; line-height: 1.25; margin: 0;
  }
  .sf-banner-tagline span {
    background: linear-gradient(90deg, #38bdf8, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sf-subscribe-form {
    display: flex; gap: 0; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(56,189,248,0.3);
    animation: borderGlow 3s ease-in-out infinite;
  }
  .sf-subscribe-input {
    background: rgba(255,255,255,0.06); border: none; outline: none;
    padding: 14px 20px; color: white;
    font-family: 'DM Sans', sans-serif; font-size: 14px; width: 260px;
  }
  .sf-subscribe-input::placeholder { color: rgba(255,255,255,0.4); }
  .sf-subscribe-btn {
    background: linear-gradient(135deg, #1e40af, #38bdf8);
    border: none; padding: 14px 24px; color: white;
    font-weight: 600; font-size: 14px; cursor: pointer;
    transition: opacity 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .sf-subscribe-btn:hover { opacity: 0.85; }

  .sf-main-grid {
    max-width: 1200px; margin: 0 auto; padding: 60px 32px;
    display: grid; grid-template-columns: 2fr 1fr 1fr 1.4fr; gap: 48px;
  }
  @media(max-width:900px) {
    .sf-main-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
    .sf-top-banner-grid { grid-template-columns: 1fr; }
    .sf-subscribe-form { width: 100%; }
    .sf-subscribe-input { width: 100%; flex: 1; }
  }
  @media(max-width:560px) {
    .sf-main-grid { grid-template-columns: 1fr; }
  }

  .sf-brand-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .sf-logo-mark {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #1e40af, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: white; flex-shrink: 0;
  }
  .sf-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.02em;
  }
  .sf-logo-text sup {
    font-size: 10px; color: #38bdf8;
    font-family: 'DM Sans', sans-serif; font-weight: 600; letter-spacing: 0.1em;
  }
  .sf-brand-desc {
    color: #94a3b8; font-size: 14px; line-height: 1.75;
    margin-bottom: 24px; max-width: 300px;
  }
  .sf-stats-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
  .sf-stat-pill {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 10px 16px; text-align: center;
    animation: countUp 0.6s ease forwards;
  }
  .sf-stat-val { font-size: 18px; font-weight: 700; color: #38bdf8; display: block; font-family: 'DM Sans', sans-serif; }
  .sf-stat-lbl { font-size: 11px; color: #64748b; display: block; margin-top: 2px; }

  .sf-socials { display: flex; gap: 10px; flex-wrap: wrap; }
  .sf-social-btn {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8; font-size: 16px; text-decoration: none;
    transition: all 0.25s; cursor: pointer;
  }
  .sf-social-btn:hover {
    background: rgba(56,189,248,0.15); border-color: #38bdf8;
    color: #38bdf8; transform: translateY(-3px);
  }

  .sf-col-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #38bdf8; margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .sf-col-title::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(56,189,248,0.4), transparent);
  }

  .sf-link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .sf-link-list a {
    color: #94a3b8; text-decoration: none; font-size: 14px;
    display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  }
  .sf-link-list a::before {
    content: '›'; color: #38bdf8; font-size: 16px;
    opacity: 0; transform: translateX(-6px); transition: all 0.2s;
  }
  .sf-link-list a:hover { color: white; transform: translateX(4px); }
  .sf-link-list a:hover::before { opacity: 1; transform: translateX(0); }

  .sf-contact-item { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; }
  .sf-contact-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .sf-contact-label { font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .sf-contact-val { font-size: 13px; color: #e2e8f0; line-height: 1.5; }
  .sf-contact-val a { color: #38bdf8; text-decoration: none; }
  .sf-contact-val a:hover { text-decoration: underline; }

  .sf-map-box {
    margin-top: 20px; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(56,189,248,0.2); position: relative; height: 120px;
    background: linear-gradient(135deg, rgba(30,64,175,0.3), rgba(16,185,129,0.1));
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 6px; cursor: pointer; transition: border-color 0.3s;
  }
  .sf-map-box:hover { border-color: rgba(56,189,248,0.6); }
  .sf-map-box span { color: #94a3b8; font-size: 12px; }

  .sf-badges {
    max-width: 1200px; margin: 0 auto; padding: 24px 32px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
  }
  .sf-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; padding: 8px 14px; font-size: 12px; color: #64748b;
  }
  .sf-badge span { font-size: 14px; }

  .sf-bottom-bar { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px 32px; }
  .sf-bottom-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  .sf-copyright { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 8px; }
  .sf-copyright strong { color: #94a3b8; }
  .sf-bottom-links { display: flex; gap: 24px; list-style: none; padding: 0; margin: 0; }
  .sf-bottom-links a { font-size: 12px; color: #475569; text-decoration: none; transition: color 0.2s; }
  .sf-bottom-links a:hover { color: #38bdf8; }

  .sf-back-top {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: #64748b;
    cursor: pointer; border: none; background: none; transition: color 0.2s;
  }
  .sf-back-top:hover { color: #38bdf8; }

  .sf-made-with {
    text-align: center; padding: 14px 0; font-size: 12px;
    color: #334155; border-top: 1px solid rgba(255,255,255,0.03);
    letter-spacing: 0.05em;
  }
  .sf-made-with strong { color: #64748b; }
  .sf-heart { color: #ef4444; display: inline-block; animation: heartbeat 1.2s ease-in-out infinite; }
`;

export default function SmartFinanceFooter() {
  const pathname = usePathname();

  // ── Hide footer on these pages ──────────────────────
  const hideOn = [
    "/transaction/create",
    "/transaction/edit",
    "/transaction/add",
  ];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  // ────────────────────────────────────────────────────

  const socialLinks = [
    { icon: "𝕏",  href: "https://twitter.com/kennietech",          label: "Twitter / X" },
    { icon: "in", href: "https://linkedin.com/company/kennietech", label: "LinkedIn" },
    { icon: "f",  href: "https://facebook.com/kennietech",         label: "Facebook" },
    { icon: "▶",  href: "https://youtube.com/@kennietech",         label: "YouTube" },
    { icon: "📸", href: "https://instagram.com/kennietech",        label: "Instagram" },
    { icon: "📱", href: "https://tiktok.com/@kennietech",          label: "TikTok" },
  ];

  const productLinks = [
    { href: "/dashboard",    label: "Dashboard" },
    { href: "/transactions", label: "Transaction Tracker" },
    { href: "/budgets",      label: "Budget Planner" },
    { href: "/accounts",     label: "Accounts" },
    { href: "/reports",      label: "Financial Reports" },
    { href: "/ai-insights",  label: "AI Insights" },
    { href: "/goals",        label: "Savings Goals" },
  ];

  const companyLinks = [
    { href: "/about",    label: "About Us" },
    { href: "/team",     label: "Our Team" },
    { href: "/careers",  label: "Careers" },
    { href: "/blog",     label: "Blog & Updates" },
    { href: "/partners", label: "Partners" },
  ];

  const supportLinks = [
    { href: "/help",        label: "Help Center" },
    { href: "/docs",        label: "Documentation" },
    { href: "/contact",     label: "Contact Support" },
    { href: "/status",      label: "System Status" },
    { href: "/privacy",     label: "Privacy Policy" },
    { href: "/terms",       label: "Terms of Service" },
  ];

  const trustBadges = [
    { icon: "🔐", text: "256-bit SSL Encryption" },
    { icon: "🛡️", text: "GDPR Compliant" },
    { icon: "✅", text: "ISO 27001 Certified" },
    { icon: "🏦", text: "Bank-Grade Security" },
    { icon: "🌍", text: "Available Worldwide" },
    { icon: "⭐", text: "4.9 / 5 User Rating" },
  ];

  return (
    <footer className="sf-footer">
      <style dangerouslySetInnerHTML={{ __html: footerStyles }} />
      <div className="sf-orb-1" />
      <div className="sf-orb-2" />
      <div className="sf-footer-inner">

        {/* TOP BANNER */}
        <div className="sf-top-banner">
          <div className="sf-top-banner-grid">
            <div>
              <p className="sf-banner-tagline">
                Take full control of your <span>financial future</span><br />
                — smarter, faster, together.
              </p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
                📬 Subscribe for monthly finance tips &amp; product updates
              </p>
              <div className="sf-subscribe-form">
                <input className="sf-subscribe-input" type="email" placeholder="your@email.com" />
                <button className="sf-subscribe-btn">Subscribe →</button>
              </div>
              <p style={{ color: "#334155", fontSize: 11, marginTop: 8 }}>
                No spam. Unsubscribe anytime. 5,000+ subscribers.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="sf-main-grid">
          <div>
            <div className="sf-brand-logo">
              <div className="sf-logo-mark">💹</div>
              <div className="sf-logo-text">SmartFinance<sup>™</sup></div>
            </div>
            <p className="sf-brand-desc">
              SmartFinance is Kenya's leading all-in-one personal finance platform —
              helping individuals and businesses track, plan, and grow their wealth
              through AI-powered insights and beautifully simple tools.
            </p>
            <div className="sf-stats-row">
              <div className="sf-stat-pill">
                <span className="sf-stat-val">5K+</span>
                <span className="sf-stat-lbl">Active Users</span>
              </div>
              <div className="sf-stat-pill">
                <span className="sf-stat-val">KES 2M+</span>
                <span className="sf-stat-lbl">Tracked</span>
              </div>
              <div className="sf-stat-pill">
                <span className="sf-stat-val">4.9★</span>
          
              </div>
            </div>
            <p className="sf-col-title">Follow Us</p>
            <div className="sf-socials">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="sf-social-btn" title={s.label} aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="sf-col-title">Product</p>
            <ul className="sf-link-list">
              {productLinks.map((l, i) => (
                <li key={i}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sf-col-title">Company</p>
            <ul className="sf-link-list" style={{ marginBottom: 32 }}>
              {companyLinks.map((l, i) => (
                <li key={i}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
            <p className="sf-col-title">Support</p>
            <ul className="sf-link-list">
              {supportLinks.map((l, i) => (
                <li key={i}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sf-col-title">Get In Touch</p>
            <div className="sf-contact-item">
              <div className="sf-contact-icon">📍</div>
              <div>
                <div className="sf-contact-label">Head Office</div>
                <div className="sf-contact-val">
                  KennieTech Ltd<br />
                  Westlands Business Park, 4th Floor<br />
                  Waiyaki Way, Westlands<br />
                  Nairobi, Kenya — 00100
                </div>
              </div>
            </div>
            <div className="sf-contact-item">
              <div className="sf-contact-icon">✉️</div>
              <div>
                <div className="sf-contact-label">Email Us</div>
                <div className="sf-contact-val">
                  <a href="mailto:hello@smartfinance.co.ke">hello@smartfinance.co.ke</a><br />
                  <a href="mailto:support@smartfinance.co.ke">support@smartfinance.co.ke</a><br />
                  <a href="mailto:partnerships@smartfinance.co.ke">partnerships@smartfinance.co.ke</a>
                </div>
              </div>
            </div>
            <div className="sf-contact-item">
              <div className="sf-contact-icon">📞</div>
              <div>
                <div className="sf-contact-label">Phone &amp; WhatsApp</div>
                <div className="sf-contact-val">
                  <a href="tel:+254700000000">+254 700 000 000</a><br />
                  <a href="tel:+254200000000">+254 20 000 0000</a>
                </div>
              </div>
            </div>
            <div className="sf-contact-item">
              <div className="sf-contact-icon">🕐</div>
              <div>
                <div className="sf-contact-label">Business Hours</div>
                <div className="sf-contact-val">
                  Mon – Fri: 8:00 AM – 6:00 PM EAT<br />
                  Sat: 9:00 AM – 1:00 PM EAT<br />
                  <span style={{ color: "#10b981", fontSize: 12, marginTop: 4, display: "inline-block" }}>
                    ● Live chat available 24 / 7
                  </span>
                </div>
              </div>
            </div>
            <a href="https://maps.google.com/?q=Westlands,Nairobi,Kenya"
              target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div className="sf-map-box">
                <span style={{ fontSize: 32 }}>📍</span>
                <span>Nairobi, Kenya — View on Google Maps →</span>
              </div>
            </a>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="sf-badges">
          {trustBadges.map((b, i) => (
            <div key={i} className="sf-badge">
              <span>{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="sf-bottom-bar">
          <div className="sf-bottom-inner">
            <div className="sf-copyright">
              <span>©{new Date().getFullYear()}</span>
              <strong>KennieTech Ltd.</strong>
              <span>All rights reserved.</span>
              <span style={{
                background: "rgba(16,185,129,0.15)", color: "#10b981",
                fontSize: 11, padding: "2px 10px", borderRadius: 999,
                fontWeight: 600, marginLeft: 6,
              }}>v2.5.0</span>
            </div>
            <ul className="sf-bottom-links">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
              <li><Link href="/sitemap">Sitemap</Link></li>
              <li><Link href="/accessibility">Accessibility</Link></li>
            </ul>
            <button
              className="sf-back-top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
            >
              ↑ Back to top
            </button>
          </div>
        </div>

        {/* MADE BY */}
        <div className="sf-made-with">
          MADE WITH <span className="sf-heart">💗</span> BY&nbsp;
          <strong>KENNIETECH</strong>
          &nbsp;·&nbsp;Empowering Africa's Financial Future
        </div>

      </div>
    </footer>
  );
}
