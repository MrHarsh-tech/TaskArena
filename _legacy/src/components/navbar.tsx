"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Trophy,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Zap,
  Map,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoading = status === "loading";

  const navLinks = session
    ? getLinksForRole(session.user.role)
    : [
        { href: "/challenges", label: "Challenges", icon: BookOpen },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
      ];

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-lg dark:border-surface-700 dark:bg-surface-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-brand-500/25" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)' }}>
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-gradient">TaskArena</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons / user menu */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <ThemeToggle />
            {isLoading ? (
              <div className="h-9 w-24 shimmer" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md group-hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
                    {getInitials(session.user.name || "U")}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-surface-900 dark:text-surface-100">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-surface-500 capitalize">
                      {session.user.role.toLowerCase()}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost text-sm"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="rounded-lg p-2 text-surface-600 hover:bg-surface-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-surface-200 py-4 md:hidden animate-slide-up">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 border-t border-surface-200 pt-4">
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    href="/login"
                    className="btn-secondary text-sm w-full text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm w-full text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function getLinksForRole(role: string) {
  const common = [
    { href: "/challenges", label: "Challenges", icon: BookOpen },
    { href: "/quick-play", label: "Quick Play", icon: Zap },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  switch (role) {
    case "INSTRUCTOR":
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...common,
      ];
    case "ADMIN":
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...common,
        { href: "/admin", label: "Admin", icon: Shield },
      ];
    default: // STUDENT
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...common,
      ];
  }
}
