"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HeaderClient = () => {
  const pathname = usePathname();

  useEffect(() => {
    /* ── 1. Scroll effect ─────────────────────────────────────────────── */
    const nav = document.getElementById("sf-nav");

    const handleScroll = () => {
      if (!nav) return;
      if (window.scrollY > 18) nav.classList.add("is-scrolled");
      else                      nav.classList.remove("is-scrolled");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run immediately on mount

    /* ── 2. Active link highlight ─────────────────────────────────────── */
    document.querySelectorAll(".sf-link, .sf-mob-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href !== "#" && pathname.startsWith(href) && href !== "/") {
        link.classList.add("active");
      }
    });

    /* ── 3. Mobile hamburger ──────────────────────────────────────────── */
    const ham  = document.getElementById("sf-ham");
    const menu = document.getElementById("sf-mob");
    const bars = ham?.querySelectorAll(".sf-ham-bar");
    let isOpen = false;

    const openMenu = () => {
      isOpen = true;
      if (menu) menu.style.display = "block";
      ham?.setAttribute("aria-expanded", "true");
      if (bars?.[0]) bars[0].style.cssText = "transform:translateY(6.5px) rotate(45deg)";
      if (bars?.[1]) bars[1].style.cssText = "opacity:0; transform:scaleX(0)";
      if (bars?.[2]) bars[2].style.cssText = "transform:translateY(-6.5px) rotate(-45deg)";
    };

    const closeMenu = () => {
      isOpen = false;
      if (menu) menu.style.display = "none";
      ham?.setAttribute("aria-expanded", "false");
      if (bars?.[0]) bars[0].style.cssText = "";
      if (bars?.[1]) bars[1].style.cssText = "";
      if (bars?.[2]) bars[2].style.cssText = "";
    };

    const toggleMenu = () => (isOpen ? closeMenu() : openMenu());

    ham?.addEventListener("click", toggleMenu);

    // Close on outside click
    const onOutside = (e) => {
      if (isOpen && !ham?.contains(e.target) && !menu?.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener("click", onOutside);

    // Close when any link inside mobile menu is tapped
    menu?.querySelectorAll("a, button").forEach((el) =>
      el.addEventListener("click", () => {
        if (isOpen) closeMenu();
      })
    );

    /* ── 4. Keyboard accessibility ────────────────────────────────────── */
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);

    /* ── Cleanup ──────────────────────────────────────────────────────── */
    return () => {
      window.removeEventListener("scroll", handleScroll);
      ham?.removeEventListener("click", toggleMenu);
      document.removeEventListener("click", onOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  return null;
};

export default HeaderClient;