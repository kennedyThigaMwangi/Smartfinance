"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// AURORA + GRID BACKGROUND CANVAS
// Draws an animated particle network and subtle grid on a <canvas> element
// ─────────────────────────────────────────────────────────────────────────────
const AuroraBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    // Resize canvas to fill the screen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Create 55 random floating particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.3,
      velocityX: (Math.random() - 0.5) * 0.25,
      velocityY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.45 + 0.1,
    }));

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(99,102,241,0.06)";
      ctx.lineWidth = 0.5;
      const gridSpacing = 70;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw particles and move them
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${particle.opacity})`;
        ctx.fill();

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.velocityX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.velocityY *= -1;
      });

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (distance < 95) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - distance / 95)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="aurora-canvas"
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER COMPONENT
// Cycles through an array of words, typing and deleting each one
// ─────────────────────────────────────────────────────────────────────────────
const Typewriter = ({ words, speed = 72, pauseDuration = 2500 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = isDeleting
      ? setTimeout(() => {
          // Delete one character at a time
          setDisplayedText(currentWord.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
          if (charIndex - 1 === 0) {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % words.length);
          }
        }, speed / 2)
      : charIndex < currentWord.length
      ? setTimeout(() => {
          // Type one character at a time
          setDisplayedText(currentWord.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, speed)
      : setTimeout(() => setIsDeleting(true), pauseDuration); // Pause at full word

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words, speed, pauseDuration]);

  return (
    <span className="typewriter-text">
      {displayedText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CAROUSEL SLIDES DATA
// Each slide has an image, tag label, accent color, and caption
// ─────────────────────────────────────────────────────────────────────────────
const CAROUSEL_SLIDES = [
  { src: "/finance-platform.png", tag: "Dashboard Overview",    accent: "#818cf8", caption: "Real-time analytics at a glance" },
  { src: "/Budjet module.png",    tag: "AI Budget Insights",    accent: "#a78bfa", caption: "Smart recommendations powered by AI" },
  { src: "/finance.png",          tag: "Investment Tracker",    accent: "#38bdf8", caption: "Monitor every asset in one place" },
  { src: "/ai insigts.png",       tag: "Spending Intelligence", accent: "#34d399", caption: "Know exactly where your money goes" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAROUSEL COMPONENT
// Auto-advances every 4 seconds with RTL slide animation.
// Responds to mouse position (tilt effect) and scroll (parallax).
// ─────────────────────────────────────────────────────────────────────────────
const Carousel = ({ mouse, scrollY }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoPlayTimer = useRef(null);

  const goToSlide = useCallback(
    (direction = 1) => {
      if (isAnimating) return;
      const nextIndex = (activeIndex + direction + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
      setPrevIndex(activeIndex);
      setActiveIndex(nextIndex);
      setIsAnimating(true);
      // Clear animating flag after transition ends
      setTimeout(() => {
        setPrevIndex(null);
        setIsAnimating(false);
      }, 680);
    },
    [isAnimating, activeIndex]
  );

  // Auto-advance timer
  useEffect(() => {
    autoPlayTimer.current = setInterval(() => goToSlide(1), 4000);
    return () => clearInterval(autoPlayTimer.current);
  }, [goToSlide]);

  // 3D tilt effect based on mouse position (0–1 normalized)
  const tiltX = (mouse.y * 2 - 1) * 1.8;
  const tiltY = (mouse.x * 2 - 1) * -1.8;
  const parallaxY = scrollY * 0.12;

  return (
    <div className="carousel-wrapper">
      {/* Colored glow behind the carousel */}
      <div
        className="carousel-glow"
        style={{ background: CAROUSEL_SLIDES[activeIndex].accent }}
      />

      {/* Main stage — 3D perspective tilt + scroll parallax */}
      <div
        className="carousel-stage"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${parallaxY}px)`,
        }}
      >
        {/* "Live Dashboard Preview" label above stage */}
        <div className="carousel-live-tag">
          <span className="carousel-live-dot" />
          Live Dashboard Preview
        </div>

        {/* Render all slides; only active/prev are visible */}
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={[
              "carousel-slide",
              index === activeIndex ? "carousel-slide--active" : "",
              index === prevIndex ? "carousel-slide--prev" : "",
              isAnimating && index === activeIndex ? "carousel-slide--entering" : "",
              isAnimating && index === prevIndex ? "carousel-slide--exiting" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Image
              src={slide.src}
              width={1280}
              height={720}
              alt={slide.tag}
              className="carousel-image"
              priority={index === 0}
            />
            {/* Overlay with badge + caption */}
            <div className="carousel-overlay">
              <span
                className="carousel-badge"
                style={{ background: slide.accent + "dd" }}
              >
                {slide.tag}
              </span>
              <p className="carousel-caption">{slide.caption}</p>
            </div>
          </div>
        ))}

        {/* Auto-play progress bar at the bottom */}
        <div className="carousel-progress-bar">
          <div
            className="carousel-progress-fill"
            key={activeIndex}
            style={{ background: CAROUSEL_SLIDES[activeIndex].accent }}
          />
        </div>

        {/* Prev / Next arrow buttons */}
        <button
          className="carousel-arrow carousel-arrow--left"
          onClick={() => goToSlide(-1)}
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="carousel-arrow carousel-arrow--right"
          onClick={() => goToSlide(1)}
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Dot navigation */}
        <div className="carousel-dots">
          {CAROUSEL_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === activeIndex ? "carousel-dot--active" : ""}`}
              style={
                index === activeIndex
                  ? { background: CAROUSEL_SLIDES[activeIndex].accent, width: "26px" }
                  : {}
              }
              onClick={() => {
                if (!isAnimating && index !== activeIndex) {
                  setPrevIndex(activeIndex);
                  setActiveIndex(index);
                  setIsAnimating(true);
                  setTimeout(() => {
                    setPrevIndex(null);
                    setIsAnimating(false);
                  }, 680);
                }
              }}
            />
          ))}
        </div>

        {/* Slide counter (e.g. 01 / 04) */}
        <div className="carousel-slide-counter">
          <span style={{ color: "white", fontWeight: 700 }}>
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span style={{ color: "rgba(255,255,255,.35)", margin: "0 3px" }}>/</span>
          <span style={{ color: "rgba(255,255,255,.4)" }}>
            {String(CAROUSEL_SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Floating stats cards around the carousel */}
      <div className="floating-card floating-card--top-left">
        <span className="floating-card-icon">📈</span>
        <div>
          <div className="floating-card-value">+24.8%</div>
          <div className="floating-card-label">Portfolio Growth</div>
        </div>
        <span className="floating-card-tag floating-card-tag--positive">▲ MoM</span>
      </div>

      <div className="floating-card floating-card--right">
        <span className="floating-card-icon">🤖</span>
        <div>
          <div className="floating-card-value">AI Insight</div>
          <div className="floating-card-label">Save Kes2340/mo detected</div>
        </div>
      </div>

      <div className="floating-card floating-card--bottom-left">
        <span className="floating-card-icon">🏦</span>
        <div>
          <div className="floating-card-value">Kes12,430</div>
          <div className="floating-card-label">Total Savings Balance</div>
        </div>
        <span className="floating-card-tag floating-card-tag--positive">▲ 8%</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION — main export
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState(null);

  useEffect(() => {
    // Trigger entrance animations after first paint
    requestAnimationFrame(() => setIsVisible(true));

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) =>
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Feature cards data
  const featureCards = [
    {
      icon: "⚡",
      title: "Real-Time Analytics",
      description: "Every transaction tracked & visualised the instant it happens — zero delays",
      accentColor: "#818cf8",
    },
    {
      icon: "🤖",
      title: "AI-Powered Forecasting",
      description: "Our ML engine studies your habits and predicts spending patterns weeks ahead",
      accentColor: "#c084fc",
    },
    {
      icon: "📊",
      title: "Smart Dashboards",
      description: "Fully customisable interactive views that make complex financial data feel effortless",
      accentColor: "#38bdf8",
    },
    {
      icon: "🔔",
      title: "Intelligent Alerts",
      description: "Context-aware notifications fire before you overspend — protecting your budget automatically",
      accentColor: "#fbbf24",
    },
    
  ];

  // Marquee tags data
  const marqueeTags = [
    { icon: "⚡", label: "Real-Time Analytics" },
    { icon: "🤖", label: "AI Forecasting" },
    { icon: "📊", label: "Smart Dashboards" },
    { icon: "🔔", label: "Intelligent Alerts" },
    { icon: "📱", label: "Mobile Ready" },
    { icon: "🚀", label: "Zero Setup" },
    { icon: "💡", label: "AI Insights" },
    { icon: "📈", label: "Portfolio Growth" },
    // Duplicate for seamless looping
    { icon: "⚡", label: "Real-Time Analytics" },
    { icon: "🤖", label: "AI Forecasting" },
    { icon: "📊", label: "Smart Dashboards" },
    { icon: "🔔", label: "Intelligent Alerts" },
    { icon: "🚀", label: "Zero Setup" },
    { icon: "💡", label: "AI Insights" },
    { icon: "📈", label: "Portfolio Growth" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        /* ════════════════════════════════════════════════════
           CANVAS — aurora particle network
        ════════════════════════════════════════════════════ */
        .aurora-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* ════════════════════════════════════════════════════
           HERO SECTION — outermost container
        ════════════════════════════════════════════════════ */
        .hero-section {
          position: relative;
          min-height: 100vh;
          padding: 7rem 1.25rem 5rem;
          overflow: hidden;
          background: #07071a;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Layered radial gradient orbs for aurora effect */
        .hero-background-orbs {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            radial-gradient(ellipse 70% 55% at 10% 0%,   rgba(99,102,241,0.28) 0%,  transparent 55%),
            radial-gradient(ellipse 50% 50% at 90% 5%,   rgba(139,92,246,0.20) 0%,  transparent 50%),
            radial-gradient(ellipse 60% 45% at 50% 100%, rgba(56,189,248,0.15) 0%,  transparent 55%),
            radial-gradient(ellipse 40% 60% at 80% 55%,  rgba(167,139,250,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 35% 35% at 20% 75%,  rgba(52,211,153,0.10) 0%,  transparent 50%);
          animation: aurora-shift 18s ease-in-out infinite alternate;
        }
        @keyframes aurora-shift {
          0%   { opacity: 1;    transform: scale(1)    rotate(0deg); }
          50%  { opacity: 0.85; transform: scale(1.04) rotate(0.6deg); }
          100% { opacity: 0.9;  transform: scale(1.02) rotate(-0.4deg); }
        }

        /* Dark vignette overlay to keep text readable */
        .hero-vignette-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(7,7,26,0.85) 100%);
        }

        /* Film grain / noise texture */
        .hero-noise-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          opacity: 0.55;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }

        /* ════════════════════════════════════════════════════
           HERO CONTENT WRAPPER — centers everything
        ════════════════════════════════════════════════════ */
        .hero-content-wrapper {
          position: relative;
          z-index: 10;
          max-width: 1140px;
          margin: 0 auto;
          text-align: center;
        }

        /* ════════════════════════════════════════════════════
           FADE-UP ENTRANCE ANIMATION
           Elements start hidden and slide up into view
        ════════════════════════════════════════════════════ */
        .fade-up-element {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.85s ease, transform 0.85s ease;
        }
        .fade-up-element.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ════════════════════════════════════════════════════
           TOP BADGE — "NEW · AI-POWERED FINANCE..."
        ════════════════════════════════════════════════════ */
        .top-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.52rem;
          padding: 0.32rem 1.05rem 0.32rem 0.58rem;
          border-radius: 999px;
          border: 1px solid rgba(139,92,246,0.45);
          background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12));
          backdrop-filter: blur(10px);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #c4b5fd;
          margin-bottom: 1.9rem;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.2), 0 4px 20px rgba(99,102,241,0.2);
        }

        /* Pulsing dot inside the badge */
        .badge-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          animation: pulse-dot 1.7s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(1.6); }
        }

        /* "NEW" pill inside the badge */
        .badge-new-pill {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.58rem;
          font-weight: 900;
          padding: 0.13rem 0.46rem;
          border-radius: 999px;
          letter-spacing: 0.08em;
        }

        /* ════════════════════════════════════════════════════
           HERO TITLE
        ════════════════════════════════════════════════════ */
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.7rem, 6.5vw, 6.2rem);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -0.04em;
          color: #f0f0ff;
          margin-bottom: 0.55rem;
        }

        /* Gradient text span inside the title */
        .hero-gradient-text {
          background: linear-gradient(128deg, #818cf8 0%, #c084fc 40%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(139,92,246,0.5));
        }

        /* Typewriter animated text */
        .typewriter-text { font-style: italic; }
        .typewriter-cursor {
          animation: cursor-blink 0.72s step-end infinite;
          color: #a78bfa;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* Italic subtitle under main headline */
        .hero-subtitle {
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.42em;
          font-weight: 400;
          font-style: italic;
          color: rgba(148,148,200,0.65);
          letter-spacing: 0.005em;
          margin-top: 0.42rem;
        }

        /* ════════════════════════════════════════════════════
           DECORATIVE RULE — line + diamond + line
        ════════════════════════════════════════════════════ */
        .decorative-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          margin: 1.3rem auto 1.9rem;
          max-width: 280px;
        }
        .decorative-rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(139,92,246,0.5));
        }
        .decorative-rule-line--right {
          background: linear-gradient(to left, transparent, rgba(139,92,246,0.5));
        }
        .decorative-rule-diamond {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          transform: rotate(45deg);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(139,92,246,0.7);
        }

        /* ════════════════════════════════════════════════════
           HERO CARD — lead paragraph + mini stats
        ════════════════════════════════════════════════════ */
        .hero-card {
          max-width: 780px;
          margin: 0 auto 2rem;
          padding: 2.2rem 2.4rem 2rem;
          background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          box-shadow:
            0 0 0 1px rgba(139,92,246,0.08),
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.07);
          position: relative;
          overflow: hidden;
        }

        /* Top shimmer line on card */
        .hero-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,214,255,0.4), transparent);
        }

        /* Subtle radial glow in top-right corner of card */
        .hero-card::after {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* "About SmartFinance" label inside the card */
        .hero-card-section-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 1rem;
        }
        .hero-card-section-label-line {
          width: 24px;
          height: 1px;
          background: #a78bfa;
          opacity: 0.6;
        }

        /* Lead paragraph text */
        .hero-lead-paragraph {
          font-size: clamp(0.96rem, 1.5vw, 1.08rem);
          color: rgba(220,220,255,0.78);
          font-weight: 400;
          line-height: 1.88;
          text-align: left;
          margin-bottom: 1.6rem;
          position: relative;
        }
        .hero-lead-paragraph strong { color: #f0f0ff; font-weight: 700; }
        .hero-lead-paragraph em {
          color: #c4b5fd;
          font-style: normal;
          font-weight: 600;
          border-bottom: 1px solid rgba(196,181,253,0.35);
          padding-bottom: 1px;
        }

        /* Mini stats row at the bottom of the hero card */
        .mini-stats-row {
          display: flex;
          gap: 0;
          border-top: 1px solid rgba(139,92,246,0.15);
          padding-top: 1.3rem;
          flex-wrap: wrap;
        }
        .mini-stat-item {
          flex: 1;
          min-width: 120px;
          text-align: center;
          padding: 0 1rem;
          border-right: 1px solid rgba(139,92,246,0.12);
        }
        .mini-stat-item:last-child { border-right: none; }
        .mini-stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mini-stat-label {
          font-size: 0.67rem;
          color: rgba(148,148,200,0.7);
          font-weight: 500;
          margin-top: 0.28rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        /* ════════════════════════════════════════════════════
           MARQUEE SCROLLING TAG BAR
        ════════════════════════════════════════════════════ */
        .marquee-wrapper {
          overflow: hidden;
          margin: 1.8rem 0;
          border-top: 1px solid rgba(139,92,246,0.12);
          border-bottom: 1px solid rgba(139,92,246,0.12);
          padding: 0.55rem 0;
          /* Fade edges with a mask */
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .marquee-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: marquee-scroll 26s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          white-space: nowrap;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: rgba(180,180,220,0.75);
          padding: 0.26rem 0.72rem;
          border-radius: 999px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          transition: all 0.25s;
          cursor: default;
        }
        .marquee-tag:hover {
          border-color: #818cf8;
          color: #c4b5fd;
          background: rgba(139,92,246,0.18);
          transform: scale(1.05);
        }
        .marquee-divider { color: rgba(139,92,246,0.35); }

        /* ════════════════════════════════════════════════════
           SECTION LABEL — decorative header above features
        ════════════════════════════════════════════════════ */
        .section-label-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          margin-bottom: 1.3rem;
        }
        .section-label-rule {
          flex: 1;
          max-width: 80px;
          height: 1px;
          background: rgba(139,92,246,0.25);
        }
        .section-label-text {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.8);
        }

        /* ════════════════════════════════════════════════════
           FEATURES GRID
        ════════════════════════════════════════════════════ */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          max-width: 920px;
          margin: 0 auto 2.4rem;
        }

        /* Individual feature card */
        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1.1rem 1.15rem;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.15);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
          animation: feature-card-slide-up 0.6s ease both;
        }
        @keyframes feature-card-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hover fill gradient behind card */
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05));
        }

        /* Shimmer line at top of card on hover */
        .feature-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.0), transparent);
          transition: background 0.35s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.4);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(139,92,246,0.15);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover::after {
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
        }
        .feature-card:hover .feature-icon-box { transform: scale(1.18) rotate(-6deg); }
        .feature-card:hover .feature-arrow-indicator { opacity: 1; transform: translateX(0) translateY(-50%); }

        /* Icon box on left side of feature card */
        .feature-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          transition: transform 0.3s;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .feature-text-body {
          flex: 1;
          text-align: left;
        }
        .feature-title {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #e8e8ff;
          letter-spacing: -0.01em;
          line-height: 1.25;
          margin-bottom: 0.22rem;
          transition: color 0.3s;
        }
        .feature-description {
          display: block;
          font-size: 0.7rem;
          color: rgba(148,148,200,0.65);
          line-height: 1.5;
        }
        /* Arrow that slides in on hover */
        .feature-arrow-indicator {
          position: absolute;
          top: 50%;
          right: 1rem;
          opacity: 0;
          transform: translateX(-6px) translateY(-50%);
          transition: all 0.28s;
          font-size: 0.9rem;
        }

        /* ════════════════════════════════════════════════════
           CALL-TO-ACTION BUTTON AREA
        ════════════════════════════════════════════════════ */
        .cta-button-wrapper {
          display: flex;
          justify-content: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-bottom: 1.6rem;
        }
        .cta-primary-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          overflow: hidden;
          padding: 0.88rem 2.2rem;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200% 100%;
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.93rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-decoration: none;
          box-shadow: 0 5px 28px rgba(99,102,241,0.45), 0 0 0 1px rgba(139,92,246,0.3);
          transition: transform 0.22s, box-shadow 0.22s, background-position 0.5s;
        }
        /* Brighter overlay on hover */
        .cta-primary-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .cta-primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.55), 0 0 0 1px rgba(139,92,246,0.4);
        }
        .cta-primary-button:hover::before { opacity: 1; }
        /* Inner span keeps content above the ::before overlay */
        .cta-primary-button-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* ════════════════════════════════════════════════════
           TRUST BAR — social proof below CTA
        ════════════════════════════════════════════════════ */
        .trust-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.1rem;
          flex-wrap: wrap;
          margin-bottom: 3.2rem;
        }
        .trust-bar-item {
          display: flex;
          align-items: center;
          gap: 0.42rem;
          font-size: 0.74rem;
          color: rgba(180,180,220,0.7);
          font-weight: 500;
        }
        .trust-bar-icon-box {
          width: 25px;
          height: 25px;
          border-radius: 8px;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.84rem;
        }
        .trust-bar-separator {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(139,92,246,0.35);
        }

        /* Stacked avatar row */
        .avatar-stack { display: flex; }
        .avatar-circle {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          border: 2px solid #07071a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.57rem;
          font-weight: 700;
          color: white;
          margin-left: -7px;
        }
        .avatar-circle:first-child { margin-left: 0; }
        .star-rating {
          color: #fbbf24;
          font-size: 0.72rem;
          letter-spacing: 1px;
        }

        /* ════════════════════════════════════════════════════
           CAROUSEL COMPONENT STYLES
        ════════════════════════════════════════════════════ */
        .carousel-wrapper {
          position: relative;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Soft glow blob behind carousel — changes color with slide */
        .carousel-glow {
          position: absolute;
          inset: -60px;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          opacity: 0.2;
          filter: blur(60px);
          transition: background 1.2s ease;
        }

        /* Main visible carousel box with 3D perspective */
        .carousel-stage {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          aspect-ratio: 16/9;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.2),
            0 12px 44px rgba(0,0,0,0.5),
            0 44px 110px rgba(99,102,241,0.18),
            0 0 0 1px rgba(139,92,246,0.25);
          will-change: transform;
          transition: transform 0.12s linear;
        }

        /* "Live Dashboard Preview" floating pill above stage */
        .carousel-live-tag {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 0.46rem;
          padding: 0.27rem 0.92rem;
          border-radius: 999px;
          z-index: 20;
          background: rgba(15,15,40,0.9);
          border: 1px solid rgba(139,92,246,0.4);
          font-size: 0.67rem;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .carousel-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-dot 1.4s infinite;
        }

        /* Each individual slide */
        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
        }
        .carousel-slide--active  { opacity: 1; pointer-events: auto; z-index: 2; }
        .carousel-slide--prev    { opacity: 1; z-index: 1; }

        /* RTL slide-in animation for new active slide */
        @keyframes carousel-enter-rtl {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        /* RTL slide-out animation for departing slide */
        @keyframes carousel-exit-rtl {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-105%); opacity: 0; }
        }
        .carousel-slide--entering { animation: carousel-enter-rtl 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .carousel-slide--exiting  { animation: carousel-exit-rtl  0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Gradient overlay at bottom of slide for badge + caption */
        .carousel-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.2rem 1.4rem;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
          display: flex;
          align-items: flex-end;
          gap: 0.85rem;
          z-index: 5;
        }
        .carousel-badge {
          padding: 0.26rem 0.7rem;
          border-radius: 999px;
          color: white;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .carousel-caption {
          color: rgba(255,255,255,0.9);
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
        }

        /* Progress bar that fills over 4 seconds */
        .carousel-progress-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: rgba(255,255,255,0.12);
          z-index: 10;
        }
        .carousel-progress-fill {
          height: 100%;
          border-radius: 2px;
          animation: progress-fill-forward 4s linear forwards;
        }
        @keyframes progress-fill-forward {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* Prev / Next arrow buttons */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(15,15,40,0.85);
          border: 1px solid rgba(139,92,246,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          color: #a78bfa;
          padding: 0;
          backdrop-filter: blur(6px);
        }
        .carousel-arrow svg { width: 17px; height: 17px; }
        .carousel-arrow:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          background: rgba(99,102,241,0.3);
        }
        .carousel-arrow--left  { left: -19px; }
        .carousel-arrow--right { right: -19px; }

        /* Dot indicators */
        .carousel-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 15;
        }
        .carousel-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: width 0.3s, background 0.3s;
          padding: 0;
        }

        /* Slide counter (01 / 04) */
        .carousel-slide-counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 0.76rem;
          z-index: 15;
        }

        /* ════════════════════════════════════════════════════
           FLOATING STAT CARDS around the carousel
        ════════════════════════════════════════════════════ */
        .floating-card {
          position: absolute;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 0.58rem;
          padding: 0.58rem 0.9rem;
          border-radius: 14px;
          background: rgba(15,15,40,0.88);
          border: 1px solid rgba(139,92,246,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          backdrop-filter: blur(14px);
          pointer-events: none;
        }
        .floating-card-icon  { font-size: 1.1rem; line-height: 1; }
        .floating-card-value {
          font-family: 'Syne', sans-serif;
          font-size: 0.88rem;
          font-weight: 800;
          color: #f0f0ff;
          line-height: 1;
        }
        .floating-card-label {
          font-size: 0.59rem;
          color: rgba(148,148,200,0.7);
          font-weight: 500;
          margin-top: 2px;
        }
        .floating-card-tag {
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.09rem 0.3rem;
          border-radius: 6px;
        }
        .floating-card-tag--positive {
          color: #4ade80;
          background: rgba(74,222,128,0.15);
        }

        /* Position each floating card */
        .floating-card--top-left    { top: -13px;  left: -22px; }
        .floating-card--right       { top: 37%;    right: -22px; }
        .floating-card--bottom-left { bottom: 26px; left: -22px; }

        /* Gentle float up-and-down animation */
        @keyframes float-vertical {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-9px); }
        }
        .floating-card--top-left    { animation: float-vertical 4.2s ease-in-out infinite; }
        .floating-card--right       { animation: float-vertical 5.1s ease-in-out infinite 1.1s; }
        .floating-card--bottom-left { animation: float-vertical 4.7s ease-in-out infinite 2.1s; }

        /* ════════════════════════════════════════════════════
           SCROLL HINT (bottom of section)
        ════════════════════════════════════════════════════ */
        .scroll-hint {
          margin-top: 2.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          opacity: 0;
          animation: fade-in-delayed 1s ease 2.2s forwards;
        }
        @keyframes fade-in-delayed { to { opacity: 1; } }

        /* Mouse icon outline */
        .scroll-hint-mouse {
          width: 21px;
          height: 32px;
          border: 2px solid rgba(139,92,246,0.45);
          border-radius: 999px;
          display: flex;
          justify-content: center;
          padding-top: 4px;
        }
        /* Scroll wheel inside the mouse icon */
        .scroll-hint-wheel {
          width: 3px;
          height: 6px;
          border-radius: 999px;
          background: rgba(139,92,246,0.6);
          animation: scroll-wheel-drop 1.5s ease-in-out infinite;
        }
        @keyframes scroll-wheel-drop {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(9px); }
        }
        .scroll-hint-text {
          font-size: 0.62rem;
          color: rgba(148,148,200,0.55);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ════════════════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr 1fr; }
          /* Hide floating cards on small screens */
          .floating-card--top-left,
          .floating-card--right,
          .floating-card--bottom-left { display: none; }
          /* Hide carousel arrows on small screens (swipe instead) */
          .carousel-arrow { display: none; }
          .mini-stats-row { justify-content: center; }
          .mini-stat-item { min-width: 100px; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="hero-section">
        {/* ── Background layers ── */}
        <AuroraBackground />
        <div className="hero-background-orbs" />
        <div className="hero-vignette-overlay" />
        <div className="hero-noise-overlay" />

        <div className="hero-content-wrapper">

          {/* ── TOP BADGE ── */}
          <div
            className={`top-badge fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.04s" }}
          >
            <span className="badge-pulse-dot" />
            <span className="badge-new-pill">NEW</span>
            AI-POWERED FINANCE MANAGEMENT SYSTEM
          </div>

          {/* ── HEADLINE ── */}
          <h1
            className={`hero-title fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.13s" }}
          >
            Take Full Control of{" "}
            <span className="hero-gradient-text">
              <Typewriter words={["Your Wealth", "Your Finances", "Your Budget", "Your Future"]} />
            </span>
            <span className="hero-subtitle">— Manage your finances efficiently</span>
          </h1>

          {/* ── DECORATIVE RULE (line + diamond + line) ── */}
          <div
            className={`decorative-rule fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.19s" }}
          >
            <span className="decorative-rule-line" />
            <span className="decorative-rule-diamond" />
            <span className="decorative-rule-line decorative-rule-line--right" />
          </div>

          {/* ── HERO CARD (lead text + mini stats) ── */}
          <div
            className={`hero-card fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.25s" }}
          >
            <div className="hero-card-section-label">
              <span className="hero-card-section-label-line" />
              About SmartFinance
              <span className="hero-card-section-label-line" />
            </div>

            <p className="hero-lead-paragraph">
              <strong>SmartFinance</strong> is a next-generation financial management platform
              that merges the power of <em>real-time data analytics</em>,{" "}
              <em>machine learning predictions</em>, and <em>intelligent automation</em> into
              one beautifully crafted experience. Designed for forward-thinking individuals and
              high-performing teams, SmartFinance transforms raw financial data into{" "}
              <strong>clear, actionable intelligence</strong> — empowering you to eliminate wasteful
              spending, grow your savings, and reach your financial goals with{" "}
              <strong>unprecedented speed and confidence</strong> every single day.
            </p>

            {/* Mini stats row — populate the array below to show stats */}
            <div className="mini-stats-row">
              {[
                /* Example: { number: "14K+", label: "Active Users" } */
              ].map((stat) => (
                <div className="mini-stat-item" key={stat.label}>
                  <div className="mini-stat-number">{stat.number}</div>
                  <div className="mini-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MARQUEE TAG BAR ── */}
          <div
            className={`marquee-wrapper fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.32s" }}
          >
            <div className="marquee-track">
              {marqueeTags.map((tag, index) => (
                <React.Fragment key={index}>
                  <span className="marquee-tag">
                    {tag.icon} {tag.label}
                  </span>
                  {index % 10 !== 9 && <span className="marquee-divider">✦</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── SECTION LABEL (above features) ── */}
          <div
            className={`section-label-row fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.37s" }}
          >
            <span className="section-label-rule" />
            <span className="section-label-text">Platform Features</span>
            <span className="section-label-rule" />
          </div>

          {/* ── FEATURES GRID ── */}
          <div
            className={`features-grid fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.41s" }}
          >
            {featureCards.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{
                  animationDelay: `${0.41 + index * 0.08}s`,
                  // Dynamic border + glow color on hover
                  borderColor: hoveredFeatureIndex === index ? feature.accentColor + "55" : undefined,
                  boxShadow:
                    hoveredFeatureIndex === index
                      ? `0 8px 30px rgba(0,0,0,0.35), 0 0 20px ${feature.accentColor}22`
                      : undefined,
                }}
                onMouseEnter={() => setHoveredFeatureIndex(index)}
                onMouseLeave={() => setHoveredFeatureIndex(null)}
              >
                {/* Icon */}
                <div
                  className="feature-icon-box"
                  style={{
                    background: hoveredFeatureIndex === index ? feature.accentColor + "22" : undefined,
                    borderColor: hoveredFeatureIndex === index ? feature.accentColor + "44" : undefined,
                  }}
                >
                  {feature.icon}
                </div>

                {/* Text */}
                <div className="feature-text-body">
                  <span
                    className="feature-title"
                    style={{ color: hoveredFeatureIndex === index ? feature.accentColor : undefined }}
                  >
                    {feature.title}
                  </span>
                  <span className="feature-description">{feature.description}</span>
                </div>

                {/* Arrow that slides in on hover */}
                <div className="feature-arrow-indicator" style={{ color: feature.accentColor }}>
                  →
                </div>
              </div>
            ))}
          </div>

          {/* ── CTA BUTTON ── */}
          <div
            className={`cta-button-wrapper fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.58s" }}
          >
            <Link href="/dashboard" className="cta-primary-button">
              <span className="cta-primary-button-inner">🚀 Get Started — It&apos;s Free</span>
            </Link>
          </div>

          {/* ── TRUST BAR ── */}
          <div
            className={`trust-bar fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.65s" }}
          >
            {/* Stacked avatars + star rating */}
            <div className="trust-bar-item">
              <div className="avatar-stack">
                {[
                  { bg: "#6366f1", initials: "AK" },
                  { bg: "#8b5cf6", initials: "BL" },
                  { bg: "#0ea5e9", initials: "CJ" },
                  { bg: "#10b981", initials: "DM" },
                ].map((avatar, index) => (
                  <div
                    className="avatar-circle"
                    key={index}
                    style={{ background: avatar.bg }}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="star-rating">★★★★★</div>
                <div style={{ fontSize: "0.69rem", color: "rgba(180,180,220,0.65)" }}>
                  Trusted by <strong style={{ color: "#f0f0ff" }}>5,000+</strong> users globally
                </div>
              </div>
            </div>

            <span className="trust-bar-separator" />
            <div className="trust-bar-item">
              <span className="trust-bar-icon-box">🔒</span>
            </div>
            <span className="trust-bar-separator" />
            <div className="trust-bar-item">
              <span className="trust-bar-icon-box">⚡</span>No Credit Card
            </div>
          </div>

          {/* ── CAROUSEL ── */}
          <div
            className={`fade-up-element ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: "0.72s" }}
          >
            <Carousel mouse={mousePosition} scrollY={scrollY} />
          </div>

          {/* ── SCROLL HINT ── */}
          <div className="scroll-hint">
            <div className="scroll-hint-mouse">
              <span className="scroll-hint-wheel" />
            </div>
            <span className="scroll-hint-text">Scroll to explore</span>
          </div>

        </div>
      </section>
    </>
  );
};

export default HeroSection;