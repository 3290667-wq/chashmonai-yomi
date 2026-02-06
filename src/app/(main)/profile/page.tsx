"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
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
  Shield
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const stats = [
    {
      label: "נקודות",
      value: user?.points || 0,
      icon: Award,
      color: "from-amber-400 to-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "ימים רצופים",
      value: user?.streak || 0,
      icon: Flame,
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "פרקים שהושלמו",
      value: 0,
      icon: BookOpen,
      color: "from-sky-400 to-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      label: "דקות לימוד",
      value: 0,
      icon: Clock,
      color: "from-violet-400 to-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  const menuItems = [
    {
      label: "הגדרות חשבון",
      icon: Settings,
      href: "/profile/settings",
    },
  ];

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Profile Header */}
      <div className="bg-gradient-to-l from-brown-dark to-brown-medium rounded-2xl p-5 sm:p-6 text-cream relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute left-0 top-0 w-32 h-32 opacity-10">
          <Image
            src="/רוח חשמונאית.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sky-medium to-sky-dark rounded-full flex items-center justify-center shadow-lg border-4 border-white/20">
            <span className="text-3xl sm:text-4xl font-bold text-white">
              {user?.name?.charAt(0) || "א"}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {user?.name || "משתמש"}
            </h1>
            {user?.email && (
              <p className="text-cream/70 text-sm truncate mt-1">{user.email}</p>
            )}
            {user?.platoon && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mt-2">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-sm">{user.platoon}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-cream-dark/50 p-4 text-center"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-brown-dark">{stat.value}</p>
              <p className="text-sm text-brown-light mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* User Details Card */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-dark/30">
          <h2 className="font-bold text-brown-dark text-lg">פרטים אישיים</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl">
            <div className="w-10 h-10 bg-sky-light rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-sky-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brown-light">שם מלא</p>
              <p className="font-medium text-brown-dark truncate">
                {user?.name || "לא צוין"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl">
            <div className="w-10 h-10 bg-sky-light rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-sky-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brown-light">אימייל</p>
              <p className="font-medium text-brown-dark truncate" dir="ltr">
                {user?.email || "לא צוין"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl">
            <div className="w-10 h-10 bg-sky-light rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brown-light">פלוגה</p>
              <p className="font-medium text-brown-dark truncate">
                {user?.platoon || "לא צוין"}
              </p>
            </div>
          </div>

          {user?.role && user.role !== "USER" && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600">תפקיד</p>
                <p className="font-medium text-amber-700">
                  {user.role === "ADMIN" ? "מנהל ראשי" : "ר״מ פלוגתי"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between p-4 hover:bg-cream/30 transition-colors ${
                index < menuItems.length - 1 ? "border-b border-cream-dark/30" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brown-medium" />
                </div>
                <span className="font-medium text-brown-dark">{item.label}</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-brown-light" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>התנתק מהחשבון</span>
      </button>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-brown-light text-sm">חשמונאי יומי - גרסה 1.0</p>
        <p className="text-brown-light/70 text-xs mt-1">למען שמו באהבה</p>
      </div>
    </div>
  );
}
