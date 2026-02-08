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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ראשי", icon: Home },
  { href: "/daily", label: "לימוד יומי", icon: BookOpen },
  { href: "/boost", label: "חיזוק יומי", icon: Play },
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
      <aside className="hidden lg:flex w-64 bg-white border-l border-cream-dark flex-col fixed right-0 top-0 bottom-0 z-30 shadow-sm">
        <div className="p-5 border-b border-cream-dark">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={44}
              height={44}
              className="drop-shadow-sm"
            />
            <div>
              <h1 className="font-bold text-brown-dark text-lg">חשמונאי יומי</h1>
              <p className="text-xs text-brown-light">לעלות ולהתעלות</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brown-medium text-cream shadow-md"
                    : "text-brown-dark hover:bg-cream-dark/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.href === "/points" && (
                  <span className={`mr-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? "bg-cream/20 text-cream" : "bg-sky-light text-brown-dark"
                  }`}>
                    {userPoints}
                  </span>
                )}
              </Link>
            );
          })}

          {(isAdmin || isRam) && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs text-brown-light px-4 font-semibold uppercase tracking-wide">ניהול</p>
              </div>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-brown-medium text-cream shadow-md"
                    : "text-brown-dark hover:bg-cream-dark/50"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">דף ניהול</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-cream-dark">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-medium to-sky-dark rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">
                {userName?.charAt(0) || "א"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brown-dark truncate">{userName || "משתמש"}</p>
              <p className="text-xs text-brown-light">{userPoints} נקודות</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-error hover:bg-error/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 right-0 left-0 bg-white border-b border-cream-dark h-14 px-4 flex items-center justify-between z-50 shadow-sm safe-area-top">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/רוח חשמונאית.png"
            alt="רוח חשמונאית"
            width={32}
            height={32}
          />
          <span className="font-bold text-brown-dark">חשמונאי יומי</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sky-light/50 px-2.5 py-1 rounded-full text-sm">
            <Award className="w-4 h-4 text-sky-dark" />
            <span className="font-bold text-brown-dark">{userPoints}</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-cream rounded-lg transition-colors text-brown-medium"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-white z-40 animate-fade-in">
          <div className="flex flex-col p-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-brown-medium text-cream"
                      : "text-brown-dark hover:bg-cream"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {(isAdmin || isRam) && (
              <>
                <hr className="border-cream-dark my-2" />
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-brown-medium text-cream"
                      : "text-brown-dark hover:bg-cream"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">ניהול</span>
                </Link>
              </>
            )}

            <hr className="border-cream-dark my-2" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">התנתק</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 bg-white border-t border-cream-dark safe-area-bottom z-50 shadow-lg">
        <div className="flex items-center justify-around py-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "text-brown-medium" : "text-brown-light"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
