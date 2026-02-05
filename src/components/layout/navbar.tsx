"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Clock,
  MessageCircle,
  Award,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ראשי", icon: Home },
  { href: "/daily", label: "לימוד יומי", icon: BookOpen },
  { href: "/zmanim", label: "זמני היום", icon: Clock },
  { href: "/chat", label: "צ'אט", icon: MessageCircle },
  { href: "/points", label: "נקודות", icon: Award },
];

interface NavbarProps {
  userName?: string;
  userPoints?: number;
}

export default function Navbar({ userName, userPoints = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 right-0 left-0 bg-primary text-white h-16 px-6 items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <span className="text-secondary">חשמונאי</span>
            <span>יומי</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-full">
            <Award size={18} className="text-secondary" />
            <span className="font-bold">{userPoints}</span>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <User size={20} />
            <span>{userName || "משתמש"}</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 right-0 left-0 bg-primary text-white h-14 px-4 flex items-center justify-between z-50 shadow-md">
        <Link href="/dashboard" className="text-lg font-bold">
          <span className="text-secondary">חשמונאי</span> יומי
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded-full text-sm">
            <Award size={14} className="text-secondary" />
            <span className="font-bold">{userPoints}</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-primary z-40">
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-lg">{item.label}</span>
                </Link>
              );
            })}

            <hr className="border-white/20 my-2" />

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10"
            >
              <User size={22} />
              <span className="text-lg">{userName || "פרופיל"}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 right-0 left-0 bg-card border-t border-card-border h-16 flex items-center justify-around z-50">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted hover:text-primary"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
