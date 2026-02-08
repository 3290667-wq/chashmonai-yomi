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
}

export default function Navbar({ userName, userPoints = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-cream-white border-l-2 border-sand flex-col fixed right-0 top-0 bottom-0 z-30 shadow-lg">
        {/* Gold Top Border */}
        <div className="h-1 bg-gradient-to-l from-gold-dark via-gold to-gold-dark" />

        {/* Logo Header */}
        <div className="p-6 border-b border-sand">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/30 rounded-xl blur-lg group-hover:blur-xl transition-all animate-pulse-gold" />
              <Image
                src="/רוח חשמונאית.png"
                alt="רוח חשמונאית"
                width={52}
                height={52}
                className="relative drop-shadow-lg group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h1 className="font-bold text-brown-deep text-xl">חשמונאי יומי</h1>
              <p className="text-xs text-gold font-semibold">לעלות ולהתעלות</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Search Button */}
          <Link
            href="/search"
            className={`nav-link-premium ${pathname === "/search" ? "active" : ""}`}
          >
            <Search className="w-5 h-5" />
            <span>חיפוש</span>
          </Link>

          <div className="gold-divider !my-4" />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link-premium ${isActive ? "active" : ""}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.href === "/points" && (
                  <span className="mr-auto badge-gold text-xs py-1 px-2">
                    <Star className="w-3 h-3" />
                    {userPoints}
                  </span>
                )}
              </Link>
            );
          })}

          {(isAdmin || isRam) && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs text-gold px-4 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  ניהול
                </p>
              </div>
              <Link
                href="/admin"
                className={`nav-link-premium ${pathname.startsWith("/admin") ? "active" : ""}`}
              >
                <Settings className="w-5 h-5" />
                <span>דף ניהול</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sand bg-gradient-to-t from-cream-warm to-transparent">
          <div className="flex items-center gap-3 p-3 mb-3 card-luxury !rounded-xl">
            <div className="icon-circle-gold w-12 h-12">
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brown-deep truncate">{userName || "משתמש"}</p>
              <p className="text-xs text-gold font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                {userPoints} נקודות
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 w-full transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 right-0 left-0 bg-cream-white border-b-2 border-sand h-16 px-4 flex items-center justify-between z-50 safe-area-top shadow-md">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-lg blur-sm" />
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={40}
              height={40}
              className="relative"
            />
          </div>
          <span className="font-bold text-brown-deep text-lg">חשמונאי יומי</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2.5 hover:bg-gold-light/50 rounded-xl transition-colors text-brown-warm"
          >
            <Search className="w-5 h-5" />
          </Link>

          <div className="badge-gold">
            <Star className="w-4 h-4" />
            <span className="font-bold">{userPoints}</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 hover:bg-cream-warm rounded-xl transition-colors text-brown-warm"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-cream-white z-40 animate-fade-in-up overflow-y-auto">
          {/* Gold line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="flex flex-col p-5 gap-2">
            {/* Search Link */}
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`nav-link-premium py-4 ${pathname === "/search" ? "active" : ""}`}
            >
              <Search className="w-5 h-5" />
              <span>חיפוש</span>
            </Link>

            <div className="gold-divider !my-3" />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`nav-link-premium py-4 ${isActive ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {(isAdmin || isRam) && (
              <>
                <div className="gold-divider !my-3" />
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`nav-link-premium py-4 ${pathname.startsWith("/admin") ? "active" : ""}`}
                >
                  <Settings className="w-5 h-5" />
                  <span>ניהול</span>
                </Link>
              </>
            )}

            <div className="gold-divider !my-3" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-error hover:bg-error/10 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 bg-cream-white border-t-2 border-sand safe-area-bottom z-50 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-gold"
                    : "text-brown-soft hover:text-brown-deep"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-gold-light to-gold-shine shadow-md"
                    : ""
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5] text-gold-dark" : ""}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-gold-dark" : ""}`}>
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
