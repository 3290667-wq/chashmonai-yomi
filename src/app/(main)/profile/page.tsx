"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Users,
  Award,
  Flame,
  BookOpen,
  Clock,
  LogOut,
  Settings,
  ChevronLeft,
  Shield,
  Star,
  Key,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const stats = [
    {
      label: "נקודות",
      value: user?.points || 0,
      icon: Star,
      color: "from-gold to-amber-600",
      textColor: "text-gold",
    },
    {
      label: "ימים רצופים",
      value: user?.streak || 0,
      icon: Flame,
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-400",
    },
    {
      label: "פרקים שהושלמו",
      value: 0,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-700",
      textColor: "text-emerald-400",
    },
    {
      label: "דקות לימוד",
      value: 0,
      icon: Clock,
      color: "from-violet-500 to-violet-700",
      textColor: "text-violet-400",
    },
  ];

  const menuItems = [
    {
      label: "הגדרות חשבון",
      description: "שנה סיסמה ופרטים",
      icon: Settings,
      href: "/profile/settings",
    },
    {
      label: "שינוי סיסמה",
      description: "עדכן את הסיסמה שלך",
      icon: Key,
      href: "/profile/settings",
    },
  ];

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Profile Header */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-white to-white" />
        <div className="absolute top-0 left-0 w-40 h-40 opacity-10">
          <Image
            src="/רוח חשמונאית.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-xl shadow-gold/20">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {user?.name?.charAt(0) || "א"}
                </span>
              </div>
              {user?.role && user.role !== "USER" && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">
                {user?.name || "משתמש"}
              </h1>
              {user?.email && (
                <p className="text-slate-700 text-sm truncate mt-1" dir="ltr">
                  {user.email}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {user?.platoon && (
                  <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-full px-3 py-1 text-sm text-slate-600">
                    <Users className="w-3.5 h-3.5" />
                    פלוגה {user.platoon}
                  </span>
                )}
                {user?.role && user.role !== "USER" && (
                  <span className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1 text-sm text-violet-400">
                    <Shield className="w-3.5 h-3.5" />
                    {user.role === "ADMIN" ? "מנהל ראשי" : "ר״מ"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-sky-200 rounded-2xl p-4 text-center hover:border-gold/30 transition-colors shadow-sm"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-sm text-slate-700 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* User Details Card */}
      <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-sky-200 flex items-center gap-2">
          <User className="w-5 h-5 text-gold" />
          <h2 className="font-bold text-slate-800 text-lg">פרטים אישיים</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl">
            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700">שם מלא</p>
              <p className="font-medium text-slate-800 truncate">
                {user?.name || "לא צוין"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700">אימייל</p>
              <p className="font-medium text-slate-800 truncate" dir="ltr">
                {user?.email || "לא צוין"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700">פלוגה</p>
              <p className="font-medium text-slate-800 truncate">
                {user?.platoon || "לא צוין"}
              </p>
            </div>
          </div>

          {user?.role && user.role !== "USER" && (
            <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-xl border border-gold/20">
              <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold/70">תפקיד</p>
                <p className="font-medium text-gold">
                  {user.role === "ADMIN" ? "מנהל ראשי" : "ר״מ פלוגתי"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-sky-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-800 text-lg">הגדרות</h2>
        </div>

        <div className="divide-y divide-sky-200">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-4 hover:bg-sky-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-800 block">{item.label}</span>
                    <span className="text-xs text-slate-600">{item.description}</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-600 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-medium hover:bg-red-500/20 transition-colors group"
      >
        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span>התנתק מהחשבון</span>
      </button>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-slate-600 text-sm">חשמונאי יומי - גרסה 1.0</p>
        <p className="text-slate-300 text-xs mt-1">למען שמו באהבה</p>
      </div>
    </div>
  );
}
