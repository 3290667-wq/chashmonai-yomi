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
      {/* Desktop Sidebar - Artlist Dark Theme */}
      <aside className="hidden lg:flex w-72 flex-col fixed right-0 top-0 bottom-0 z-30">
        {/* Background */}
        <div className="absolute inset-0 bg-[#121212] border-l border-white/10" />

        {/* Subtle Gold Glow */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/50 to-transparent" />

        {/* Gold Top Line */}
        <div className="relative h-1 bg-gradient-to-l from-gold-dark via-gold to-gold-dark" />

        {/* Logo Header */}
        <div className="relative p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/רוח חשמונאית.png"
                alt="רוח חשמונאית"
                width={48}
                height={48}
                className="relative drop-shadow-lg group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">חשמונאי יומי</h1>
              <p className="text-xs text-gold font-medium">לעלות ולהתעלות</p>
            </div>
          </Link>
        </div>

        <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Search Button */}
          <Link
            href="/search"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/search"
                ? "bg-gold/15 text-gold"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className={`p-2 rounded-lg transition-all ${
              pathname === "/search"
                ? "bg-gold text-[#0a0a0a]"
                : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <span className="font-medium">חיפוש</span>
          </Link>

          <div className="h-px bg-white/10 my-4" />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-gold text-[#0a0a0a]"
                    : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.label}</span>
                {item.href === "/points" && (
                  <span className="mr-auto flex items-center gap-1 bg-gold text-[#0a0a0a] text-xs py-1 px-2.5 rounded-full font-bold">
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
                  <Shield className="w-3 h-3" />
                  ניהול
                </p>
              </div>
              <Link
                href="/admin"
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-gold/15 text-gold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-gold text-[#0a0a0a]"
                    : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
                }`}>
                  <Settings className="w-4 h-4" />
                </div>
                <span className="font-medium">דף ניהול</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="relative p-4 border-t border-white/10">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{userName || "משתמש"}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gold font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {userPoints}
                  </span>
                  <span className="text-xs text-orange-400 font-medium flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {userStreak}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 text-white/60 hover:bg-white/5 hover:text-red-400"
          >
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header - Dark Theme */}
      <header className="lg:hidden fixed top-0 right-0 left-0 px-4 flex items-center justify-between z-50" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.75rem', minHeight: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10" />

        <Link href="/dashboard" className="relative flex items-center gap-3 group">
          <Image
            src="/רוח חשמונאית.png"
            alt="רוח חשמונאית"
            width={36}
            height={36}
            className="drop-shadow-lg"
          />
          <span className="font-bold text-white">חשמונאי יומי</span>
        </Link>

        <div className="relative flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-gold transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-1 bg-gold text-[#0a0a0a] px-3 py-1.5 rounded-full font-bold text-sm">
            <Star className="w-4 h-4" />
            {userPoints}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl transition-all ${
              isOpen
                ? "bg-gold text-[#0a0a0a]"
                : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Dark Theme */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]/98 backdrop-blur-xl" />

          <div className="relative flex flex-col p-5 gap-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Search Link */}
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                pathname === "/search"
                  ? "bg-gold/15 text-gold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                pathname === "/search"
                  ? "bg-gold text-[#0a0a0a]"
                  : "bg-white/5"
              }`}>
                <Search className="w-5 h-5" />
              </div>
              <span className="font-medium text-lg">חיפוש</span>
            </Link>

            <div className="h-px bg-white/10 my-3" />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-gold/15 text-gold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-gold text-[#0a0a0a]"
                      : "bg-white/5"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">{item.label}</span>
                  {item.href === "/points" && (
                    <span className="mr-auto flex items-center gap-1 bg-gold text-[#0a0a0a] text-sm py-1 px-3 rounded-full font-bold">
                      <Star className="w-3 h-3" />
                      {userPoints}
                    </span>
                  )}
                </Link>
              );
            })}

            {(isAdmin || isRam) && (
              <>
                <div className="h-px bg-white/10 my-3" />
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-gold/15 text-gold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    pathname.startsWith("/admin")
                      ? "bg-gold text-[#0a0a0a]"
                      : "bg-white/5"
                  }`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">ניהול</span>
                </Link>
              </>
            )}

            <div className="h-px bg-white/10 my-3" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="group flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-white/60 hover:bg-white/5 hover:text-red-400"
            >
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-lg">התנתק</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Dark Theme */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 safe-area-bottom z-50">
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10" />

        <div className="relative flex items-center justify-around py-2 px-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "text-gold" : "text-white/50 hover:text-white active:scale-95"
                }`}
              >
                <div className={`relative p-2.5 rounded-xl transition-all ${
                  isActive ? "bg-gold shadow-lg shadow-gold/30" : "hover:bg-white/5"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#0a0a0a]" : ""}`} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? "text-gold" : ""}`}>
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
