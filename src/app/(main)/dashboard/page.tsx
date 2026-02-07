import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  ChevronLeft,
  Flame,
  Star,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  const quickLinks = [
    {
      href: "/daily",
      title: "לימוד יומי",
      description: "משנה יומית ורמב״ם",
      icon: BookOpen,
      gradient: "from-sky-medium to-sky-dark",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "תפילות וזמנים",
      icon: Clock,
      gradient: "from-amber-400 to-amber-600",
    },
    {
      href: "/daily",
      title: "חיזוק יומי",
      description: "סרטון מחזק",
      icon: Play,
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "צבירה ופדיון",
      icon: Award,
      gradient: "from-violet-400 to-violet-600",
    },
  ];

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-l from-brown-dark to-brown-medium rounded-2xl p-5 sm:p-6 text-cream relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute left-0 top-0 w-32 h-32 opacity-10">
          <Image
            src="/רוח חשמונאית.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="relative">
          <p className="text-cream/70 text-sm mb-1">שלום וברכה,</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            {user?.name?.split(" ")[0] || "חייל יקר"}!
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <Star className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-xl font-bold">{user?.points || 0}</p>
                <p className="text-xs text-cream/70">נקודות</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xl font-bold">{user?.streak || 0}</p>
                <p className="text-xs text-cream/70">ימים רצופים</p>
              </div>
            </div>

            {user?.platoon && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <TrendingUp className="w-5 h-5 text-sky-light" />
                <div>
                  <p className="text-sm font-bold">{user.platoon}</p>
                  <p className="text-xs text-cream/70">פלוגה</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-cream-dark/50 card-hover h-full">
                <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-brown-dark">{link.title}</h3>
                <p className="text-sm text-brown-light mt-0.5">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Daily Learning Preview */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cream-dark/30">
          <div>
            <h2 className="font-bold text-brown-dark text-lg">לימוד היום</h2>
            <p className="text-sm text-brown-light">הלימודים שמחכים לך</p>
          </div>
          <Link
            href="/daily"
            className="flex items-center gap-1 text-sky-dark hover:text-brown-dark transition-colors font-medium text-sm"
          >
            לכל הלימודים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
          <Link href="/daily" className="block">
            <div className="p-4 bg-cream/50 rounded-xl border border-cream-dark/30 hover:border-sky-medium transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-sky-light rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-sky-dark" />
                </div>
                <span className="font-bold text-brown-dark">משנה יומית</span>
              </div>
              <p className="text-brown-light text-sm">2 משניות - מסכת תמורה</p>
            </div>
          </Link>

          <Link href="/daily" className="block">
            <div className="p-4 bg-cream/50 rounded-xl border border-cream-dark/30 hover:border-sky-medium transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-bold text-brown-dark">רמב״ם יומי</span>
              </div>
              <p className="text-brown-light text-sm">הקדמה - מסירת תורה שבעל פה</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 p-4 sm:p-5">
        <h2 className="font-bold text-brown-dark text-lg mb-4">הסטטיסטיקות שלי</h2>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-cream/50 rounded-xl">
            <p className="text-2xl font-bold text-brown-dark">0</p>
            <p className="text-xs text-brown-light mt-1">דקות היום</p>
          </div>
          <div className="text-center p-3 bg-cream/50 rounded-xl">
            <p className="text-2xl font-bold text-brown-dark">0</p>
            <p className="text-xs text-brown-light mt-1">פרקים שהושלמו</p>
          </div>
          <div className="text-center p-3 bg-cream/50 rounded-xl">
            <p className="text-2xl font-bold text-brown-dark">{user?.streak || 0}</p>
            <p className="text-xs text-brown-light mt-1">ימים רצופים</p>
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-l from-sky-light to-sky-medium rounded-2xl p-5 text-center">
        <p className="text-brown-dark font-medium text-lg">
          &ldquo;לעלות ולהתעלות - למען שמו באהבה&rdquo;
        </p>
        <p className="text-brown-medium text-sm mt-2">רוח חשמונאית</p>
      </div>
    </div>
  );
}
