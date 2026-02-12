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
  Sparkles,
  Shield,
  Trophy,
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
      gradient: "from-gold to-gold-dark",
      color: "text-gold",
      bgImage: "/soldiers-studying.png",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "תפילות וזמנים",
      icon: Clock,
      gradient: "from-violet-500 to-purple-600",
      color: "text-violet-400",
      bgImage: "/soldiers-praying.png",
    },
    {
      href: "/boost",
      title: "שיעורי וידיאו",
      description: "סרטוני לימוד",
      icon: Play,
      gradient: "from-emerald-500 to-green-600",
      color: "text-emerald-400",
      bgImage: "/masada-sunset.png",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "צבירה ופדיון",
      icon: Award,
      gradient: "from-rose-500 to-pink-600",
      color: "text-rose-400",
      bgImage: "/soldiers-praying.png",
    },
  ];

  const stats = [
    { icon: Clock, value: 0, label: "דקות היום", color: "text-violet-400" },
    { icon: BookOpen, value: 0, label: "פרקים", color: "text-emerald-400" },
    { icon: Flame, value: user?.streak || 0, label: "ימים רצופים", color: "text-orange-400" },
    { icon: Trophy, value: user?.points || 0, label: "נקודות", color: "text-gold" },
  ];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 17) return "צהריים טובים";
    if (hour < 21) return "ערב טוב";
    return "לילה טוב";
  };

  return (
    <div className="relative min-h-screen py-6 sm:py-8 space-y-6">
      {/* Hero Section - Artlist Style */}
      <div className="relative rounded-2xl overflow-hidden bg-[#3b2d1f] border border-white/10">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/bbba.png"
            alt=""
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1a140f] via-[#1a140f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a140f] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Text */}
            <div className="flex-1">
              <p className="text-gold text-sm mb-1 font-semibold tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {getGreeting()},
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {user?.name?.split(" ")[0] || "חייל יקר"}!
              </h1>
              <p className="text-white/60">ברוך הבא לרוח חשמונאית</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Star className="w-5 h-5 text-gold" />
                <span className="text-xl font-bold text-white">{user?.points || 0}</span>
                <span className="text-white/50 text-sm">נקודות</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-xl font-bold text-white">{user?.streak || 0}</span>
                <span className="text-white/50 text-sm">ימים</span>
              </div>

              {user?.platoon && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30">
                  <Shield className="w-4 h-4 text-gold" />
                  <span className="text-white font-medium">{user.platoon}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gold Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      {/* Quick Links Grid - Artlist Academy Style */}
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative bg-[#3b2d1f] border border-white/10 rounded-xl overflow-hidden h-full transition-all duration-300 hover:border-white/20 hover:translate-y-[-4px] hover:shadow-xl">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={link.bgImage}
                    alt=""
                    fill
                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a140f] via-[#1a140f]/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-5">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Text */}
                  <h3 className="font-bold text-white text-lg mb-1">{link.title}</h3>
                  <p className="text-white/50 text-sm">{link.description}</p>

                  {/* Arrow */}
                  <div className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                    <ChevronLeft className={`w-5 h-5 ${link.color}`} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-xl">הסטטיסטיקות שלי</h2>
            <p className="text-white/50 text-sm">המעקב אחרי ההתקדמות שלך</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-[#251c14] border border-white/5 rounded-xl p-4 text-center hover:border-white/10 transition-all"
              >
                <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Learning Preview */}
      <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">לימוד היום</h2>
              <p className="text-white/50 text-sm">הלימודים שמחכים לך</p>
            </div>
          </div>
          <Link
            href="/daily"
            className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-medium"
          >
            לכל הלימודים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {/* Mishna Card */}
          <Link href="/daily" className="block group">
            <div className="bg-[#251c14] border border-white/5 rounded-xl p-5 hover:border-gold/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">משנה יומית</span>
                  <p className="text-white/50 text-sm">מסכת תמורה</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">2 משניות להיום</span>
                <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-bold">+10 נקודות</span>
              </div>
            </div>
          </Link>

          {/* Rambam Card */}
          <Link href="/daily" className="block group">
            <div className="bg-[#251c14] border border-white/5 rounded-xl p-5 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">רמב״ם יומי</span>
                  <p className="text-white/50 text-sm">הלכות יומיות</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">הקדמה - מסירת התורה</span>
                <span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full text-xs font-bold">+15 נקודות</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Motivation Card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image src="/bbbb.png" alt="" fill className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a140f] via-[#1a140f]/90 to-[#1a140f]/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-10 text-center">
          <p className="text-white font-bold text-2xl sm:text-3xl font-hebrew leading-relaxed">
            &ldquo;לעלות ולהתעלות&rdquo;
          </p>
          <p className="text-gold mt-2 text-lg font-semibold">למען שמו באהבה</p>
          <div className="h-px w-32 mx-auto my-6 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="text-white/60 font-medium flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            רוח חשמונאית
          </p>
        </div>
      </div>
    </div>
  );
}
