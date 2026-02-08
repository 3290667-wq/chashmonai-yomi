"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  BookOpen,
  Clock,
  Award,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  MessageCircle,
  Play,
  Search,
  Star,
  Shield,
  Crown,
  Sparkles,
  Flame,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ראשי", icon: Home },
  { href: "/daily", label: "לימוד יומי", icon: BookOpen },
  { href: "/boost", label: "שיעורי וידיאו", icon: Play },
  { href: "/chat", label: "שאל את הר\"מ", icon: MessageCircle },
  { href: "/zmanim", label: "זמנים", icon: Clock },
  { href: "/points", label: "נקודות", icon: Award },
  { href: "/profile", label: "פרופיל", icon: User },
];

interface NavbarProps {
  userName?: string;
  userPoints?: number;
  userStreak?: number;
}

export default function Navbar({ userName, userPoints = 0, userStreak = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  return (
    <>
      {/* Desktop Sidebar - Glassmorphism */}
      <aside className="hidden lg:flex w-72 flex-col fixed right-0 top-0 bottom-0 z-30">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream-white/95 via-cream-warm/90 to-cream-white/95 backdrop-blur-xl" />

        {/* Animated Glow Border */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold to-transparent animate-shimmer" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-32 h-32 rounded-full bg-gold/10 blur-3xl top-20 -left-10 animate-float" />
          <div className="absolute w-24 h-24 rounded-full bg-gold/15 blur-2xl bottom-40 right-4 animate-float" style={{ animationDelay: "-2s" }} />
          <div className="absolute w-20 h-20 rounded-full bg-amber-400/10 blur-2xl top-1/2 left-1/4 animate-float" style={{ animationDelay: "-4s" }} />
        </div>

        {/* Gold Top Border - Animated */}
        <div className="relative h-1.5 bg-gradient-to-l from-gold-dark via-gold-light to-gold-dark overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-transparent animate-shimmer" />
        </div>

        {/* Logo Header - Enhanced */}
        <div className="relative p-6 border-b border-gold/20">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="relative">
              {/* Multi-layer Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-amber-400 to-gold-dark rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all animate-pulse-gold" />
              <div className="absolute inset-0 bg-gold/30 rounded-xl blur-lg group-hover:blur-xl transition-all" />
              <Image
                src="/רוח חשמונאית.png"
                alt="רוח חשמונאית"
                width={56}
                height={56}
                className="relative drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
              />
            </div>
            <div>
              <h1 className="font-bold text-brown-deep text-xl text-glow">חשמונאי יומי</h1>
              <p className="text-xs text-gold font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                לעלות ולהתעלות
              </p>
            </div>
          </Link>
        </div>

        <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {/* Search Button - Glass */}
          <Link
            href="/search"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === "/search"
                ? "glass-card glow-gold"
                : "hover:glass hover:translate-x-[-4px]"
            }`}
          >
            <div className={`p-2 rounded-lg transition-all ${
              pathname === "/search"
                ? "bg-gradient-to-br from-gold to-gold-dark text-white"
                : "bg-gold/10 text-gold group-hover:bg-gold/20"
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <span className={`font-medium ${pathname === "/search" ? "text-brown-deep" : "text-brown-warm group-hover:text-brown-deep"}`}>
              חיפוש
            </span>
          </Link>

          <div className="gold-divider !my-4" />

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 stagger-item ${
                  isActive
                    ? "glass-card glow-gold"
                    : "hover:glass hover:translate-x-[-4px]"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-lg"
                    : "bg-gold/10 text-gold group-hover:bg-gold/20 group-hover:scale-110"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`font-medium transition-colors ${
                  isActive ? "text-brown-deep" : "text-brown-warm group-hover:text-brown-deep"
                }`}>
                  {item.label}
                </span>
                {item.href === "/points" && (
                  <span className="mr-auto flex items-center gap-1 bg-gradient-to-r from-gold to-gold-dark text-white text-xs py-1 px-2.5 rounded-full shadow-md">
                    <Star className="w-3 h-3" />
                    {userPoints}
                  </span>
                )}
              </Link>
            );
          })}

          {(isAdmin || isRam) && (
            <>
              <div className="pt-6 pb-2">
                <p className="text-xs text-gold px-4 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3 h-3 animate-pulse" />
                  ניהול
                </p>
              </div>
              <Link
                href="/admin"
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  pathname.startsWith("/admin")
                    ? "glass-card border border-gold/30 glow-gold"
                    : "hover:glass hover:translate-x-[-4px]"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-br from-gold to-gold-dark text-white"
                    : "bg-gold/10 text-gold group-hover:bg-gold/20"
                }`}>
                  <Settings className="w-4 h-4" />
                </div>
                <span className={`font-medium ${
                  pathname.startsWith("/admin") ? "text-brown-deep" : "text-brown-warm group-hover:text-brown-deep"
                }`}>
                  דף ניהול
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* User Section - Enhanced Glass */}
        <div className="relative p-4 border-t border-gold/20">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent" />

          <div className="relative glass-card p-4 mb-3 glow-gold overflow-hidden group">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />

            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold to-amber-500 rounded-xl blur opacity-50 animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brown-deep truncate text-glow">{userName || "משתמש"}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gold font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {userPoints}
                  </span>
                  <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {userStreak}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-300 hover:glass text-brown-warm hover:text-error"
          >
            <div className="p-2 rounded-lg bg-error/10 text-error group-hover:bg-error group-hover:text-white transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header - Glassmorphism */}
      <header className="lg:hidden fixed top-0 right-0 left-0 h-16 px-4 flex items-center justify-between z-50 safe-area-top">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-cream-white/80 backdrop-blur-xl" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <Link href="/dashboard" className="relative flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/30 rounded-xl blur-md group-hover:blur-lg transition-all animate-pulse-gold" />
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={40}
              height={40}
              className="relative drop-shadow-lg group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="font-bold text-brown-deep text-lg text-glow">חשמונאי יומי</span>
        </Link>

        <div className="relative flex items-center gap-2">
          <Link
            href="/search"
            className="p-2.5 glass rounded-xl transition-all text-gold hover:glow-gold"
          >
            <Search className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-1 bg-gradient-to-r from-gold to-gold-dark text-white px-3 py-1.5 rounded-full shadow-md">
            <Star className="w-4 h-4" />
            <span className="font-bold text-sm">{userPoints}</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isOpen ? "glass glow-gold text-gold rotate-90" : "text-brown-warm hover:glass hover:text-gold"
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Full Glass Effect */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 animate-fade-in-up overflow-hidden">
          {/* Glass Background with Aurora */}
          <div className="absolute inset-0 bg-cream-white/95 backdrop-blur-2xl" />

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-40 h-40 rounded-full bg-gold/20 blur-3xl top-10 right-10 animate-float" />
            <div className="absolute w-32 h-32 rounded-full bg-amber-400/15 blur-2xl bottom-20 left-10 animate-float" style={{ animationDelay: "-3s" }} />
            <div className="absolute w-24 h-24 rounded-full bg-gold/10 blur-2xl top-1/2 left-1/2 animate-float" style={{ animationDelay: "-1.5s" }} />
          </div>

          {/* Animated Gold Line */}
          <div className="relative h-1 bg-gradient-to-r from-transparent via-gold to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>

          <div className="relative flex flex-col p-5 gap-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Search Link */}
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 stagger-item ${
                pathname === "/search" ? "glass-card glow-gold" : "hover:glass"
              }`}
            >
              <div className={`p-2 rounded-lg transition-all ${
                pathname === "/search"
                  ? "bg-gradient-to-br from-gold to-gold-dark text-white"
                  : "bg-gold/10 text-gold group-hover:bg-gold/20"
              }`}>
                <Search className="w-5 h-5" />
              </div>
              <span className={`font-medium text-lg ${pathname === "/search" ? "text-brown-deep" : "text-brown-warm"}`}>
                חיפוש
              </span>
            </Link>

            <div className="gold-divider !my-3" />

            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 stagger-item ${
                    isActive ? "glass-card glow-gold" : "hover:glass"
                  }`}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-lg"
                      : "bg-gold/10 text-gold group-hover:bg-gold/20 group-hover:scale-110"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium text-lg ${isActive ? "text-brown-deep" : "text-brown-warm"}`}>
                    {item.label}
                  </span>
                  {item.href === "/points" && (
                    <span className="mr-auto flex items-center gap-1 bg-gradient-to-r from-gold to-gold-dark text-white text-sm py-1 px-3 rounded-full shadow-md">
                      <Star className="w-3 h-3" />
                      {userPoints}
                    </span>
                  )}
                </Link>
              );
            })}

            {(isAdmin || isRam) && (
              <>
                <div className="gold-divider !my-3" />
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 ${
                    pathname.startsWith("/admin") ? "glass-card glow-gold" : "hover:glass"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-gradient-to-br from-gold to-gold-dark text-white"
                      : "bg-gold/10 text-gold group-hover:bg-gold/20"
                  }`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className={`font-medium text-lg ${pathname.startsWith("/admin") ? "text-brown-deep" : "text-brown-warm"}`}>
                    ניהול
                  </span>
                </Link>
              </>
            )}

            <div className="gold-divider !my-3" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 hover:glass"
            >
              <div className="p-2 rounded-lg bg-error/10 text-error group-hover:bg-error group-hover:text-white transition-all">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-lg text-error">התנתק</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Premium Glass */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 safe-area-bottom z-50">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-cream-white/80 backdrop-blur-xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative flex items-center justify-around py-2 px-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-gold"
                    : "text-brown-soft hover:text-brown-deep active:scale-95"
                }`}
              >
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-gold to-gold-dark shadow-lg"
                    : "hover:bg-gold/10"
                }`}>
                  {/* Glow for active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gold rounded-xl blur-md opacity-50 animate-pulse" />
                  )}
                  <Icon className={`relative w-5 h-5 ${isActive ? "text-white stroke-[2.5]" : ""}`} />
                </div>
                <span className={`text-[10px] font-bold transition-colors ${
                  isActive ? "text-gold-dark" : ""
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
