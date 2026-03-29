import React from "react";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard",    label: "Dashboard",    icon: "📊" },
  { href: "/transactions", label: "Transactions", icon: "💳" },
  { href: "/accounts",     label: "Accounts",     icon: "🏦" },
  { href: "/reports",      label: "Reports",      icon: "📈" },
  { href: "/settings",     label: "Settings",     icon: "⚙️" },
];

const MainLayout = async ({ children }) => {
  await checkUser();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
                SmartFinance
              </span>
            </Link>

            {/* Nav links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* User button (Clerk) */}
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Mobile nav — scrollable row at the bottom of the navbar */}
        <div className="md:hidden flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all whitespace-nowrap"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Page content — padded below fixed navbar ── */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {children}
      </main>

    </div>
  );
};

export default MainLayout;