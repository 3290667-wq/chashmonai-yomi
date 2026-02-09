"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCog,
  BookOpen,
  Settings,
  ChevronLeft,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalRams: number;
  totalPlatoons: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeToday: 0,
    totalRams: 0,
    totalPlatoons: 0,
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  useEffect(() => {
    if (status === "loading") return;

    if (!isAdmin && !isRam) {
      router.push("/dashboard");
      return;
    }

    fetchStats();
  }, [status, isAdmin, isRam, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (!isAdmin && !isRam)) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-white/50">טוען...</p>
      </div>
    );
  }

  const adminMenuItems = [
    {
      label: "ניהול משתמשים",
      description: "צפייה ועריכת משתמשים",
      icon: Users,
      href: "/admin/users",
      color: "from-sky-400 to-sky-600",
      adminOnly: true,
    },
    {
      label: "שיוך ר״מים לפלוגות",
      description: "הגדרת ר״מ לכל פלוגה",
      icon: UserCog,
      href: "/admin/assignments",
      color: "from-violet-400 to-violet-600",
      adminOnly: true,
    },
    {
      label: "ניהול תוכן",
      description: "העלאת סרטונים ותכנים",
      icon: BookOpen,
      href: "/admin/content",
      color: "from-amber-400 to-amber-600",
      adminOnly: false,
    },
    {
      label: "הגדרות מערכת",
      description: "הגדרות כלליות",
      icon: Settings,
      href: "/admin/settings",
      color: "from-emerald-400 to-emerald-600",
      adminOnly: true,
    },
  ];

  const filteredMenuItems = adminMenuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const statCards = [
    {
      label: "סה״כ משתמשים",
      value: stats.totalUsers,
      icon: Users,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
    },
    {
      label: "פעילים היום",
      value: stats.activeToday,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "ר״מים פעילים",
      value: stats.totalRams,
      icon: Shield,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "פלוגות",
      value: stats.totalPlatoons,
      icon: Award,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-l from-gold-dark to-gold rounded-2xl p-5 sm:p-6 text-[#1a140f]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-2xl font-bold">
            {isAdmin ? "ניהול ראשי" : "ניהול ר״מ"}
          </h1>
        </div>
        <p className="text-[#1a140f]/70 text-sm">
          {isAdmin
            ? "ניהול מערכת חשמונאי יומי"
            : `ניהול פלוגה: ${session?.user?.platoon || "לא משויך"}`}
        </p>
      </div>

      {/* Stats Grid - Admin only */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${stat.bgColor} rounded-2xl p-4 border border-white/10`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">
                  {loading ? "-" : stat.value}
                </p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Menu Items */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10">
          <h2 className="font-bold text-white text-lg">פעולות ניהול</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.label}</p>
                      <p className="text-sm text-white/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Info for RAM */}
      {isRam && !isAdmin && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-2">הרשאות ר״מ</h3>
          <ul className="text-sm text-white/70 space-y-1">
            <li>- העלאת תכני חיזוק לפלוגה</li>
            <li>- צפייה בהתקדמות החיילים</li>
            <li>- שליחת עדכונים לפלוגה</li>
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-white/40 text-xs">
          מערכת ניהול חשמונאי יומי - גרסה 1.0
        </p>
      </div>
    </div>
  );
}
