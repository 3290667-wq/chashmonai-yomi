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
  Zap,
  Target,
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
      gradient: "from-amber-400 via-yellow-500 to-amber-600",
      glow: "rgba(201, 162, 39, 0.4)",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "תפילות וזמנים",
      icon: Clock,
      gradient: "from-violet-400 via-purple-500 to-violet-600",
      glow: "rgba(139, 92, 246, 0.4)",
    },
    {
      href: "/boost",
      title: "שיעורי וידיאו",
      description: "סרטוני לימוד",
      icon: Play,
      gradient: "from-emerald-400 via-green-500 to-emerald-600",
      glow: "rgba(16, 185, 129, 0.4)",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "צבירה ופדיון",
      icon: Award,
      gradient: "from-rose-400 via-pink-500 to-rose-600",
      glow: "rgba(244, 63, 94, 0.4)",
    },
  ];

  const stats = [
    { icon: Clock, value: 0, label: "דקות היום", color: "text-violet-500" },
    { icon: BookOpen, value: 0, label: "פרקים", color: "text-emerald-500" },
    { icon: Flame, value: user?.streak || 0, label: "ימים רצופים", color: "text-orange-500" },
    { icon: Trophy, value: user?.points || 0, label: "נקודות", color: "text-amber-500" },
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
    <div className="relative min-h-screen py-6 sm:py-8 space-y-8">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Hero Welcome Card - Glassmorphism */}
      <div className="glass-card p-8 sm:p-10 relative overflow-hidden group stagger-item">
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Particles */}
        <div className="particles">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-5">
            {/* Animated Logo */}
            <div className="relative w-24 h-24 animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full blur-xl opacity-50 animate-pulse-gold" />
              <Image
                src="/shield-emblem.png"
                alt="סמל רוח חשמונאית"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
              />
            </div>

            <div className="flex-1">
              <p className="text-gold text-sm mb-1 font-semibold tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {getGreeting()},
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-brown-deep mb-2 text-glow">
                {user?.name?.split(" ")[0] || "חייל יקר"}!
              </h1>
              <p className="text-brown-warm text-lg">ברוך הבא לרוח חשמונאית</p>
            </div>
          </div>

          {/* Stats Row with Glow */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="glass-button flex items-center gap-3 glow-gold">
              <Star className="w-5 h-5 text-gold" />
              <span className="text-2xl font-bold text-brown-deep">{user?.points || 0}</span>
              <span className="text-brown-soft">נקודות</span>
            </div>

            <div className="glass-button flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-brown-deep">{user?.streak || 0}</span>
              <span className="text-brown-soft">ימים רצופים</span>
            </div>

            {user?.platoon && (
              <div className="glass-button flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <span className="text-brown-deep font-semibold">{user.platoon}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspiring Quote - Glass Effect */}
      <div className="glass-card p-8 relative overflow-hidden stagger-item">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 rotate-180">
          <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-10 text-center py-4">
          <Zap className="w-8 h-8 text-gold mx-auto mb-4 animate-pulse" />
          <p className="text-brown-deep font-bold text-2xl sm:text-3xl font-hebrew leading-relaxed">
            חזק ואמץ - כי ה׳ אלוקיך עמך בכל אשר תלך
          </p>
          <p className="text-gold text-sm mt-4 font-bold tracking-wider">יהושע א׳, ט׳</p>
        </div>
      </div>

      {/* Quick Links Grid - 3D Tilt Cards */}
      <div className="grid grid-cols-2 gap-5">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="stagger-item">
              <div
                className="glass-card p-6 h-full group cursor-pointer hover-lift relative overflow-hidden"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Gradient Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ background: `radial-gradient(circle at center, ${link.glow}, transparent 70%)` }}
                />

                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${link.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-brown-deep text-xl mb-2">{link.title}</h3>
                  <p className="text-brown-soft">{link.description}</p>
                  <div className="flex items-center gap-1 text-gold mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <span>המשך</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Ring Cards */}
      <div className="glass-card p-8 stagger-item">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-lg glow-gold">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-brown-deep text-2xl">הסטטיסטיקות שלי</h2>
            <p className="text-brown-soft">המעקב אחרי ההתקדמות שלך</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass p-6 rounded-2xl text-center hover-glow transition-all duration-300 group"
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-cream-white to-cream ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-brown-deep counter">{stat.value}</p>
                <p className="text-brown-soft text-sm mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Learning Preview - Glass */}
      <div className="glass-card overflow-hidden stagger-item">
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-brown-deep text-xl">לימוד היום</h2>
              <p className="text-brown-soft">הלימודים שמחכים לך</p>
            </div>
          </div>
          <Link
            href="/daily"
            className="glass-button flex items-center gap-2 text-sm"
          >
            לכל הלימודים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-5">
          <Link href="/daily" className="block group">
            <div className="glass p-6 rounded-2xl hover-lift border border-gold/20 group-hover:border-gold/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-brown-deep text-xl">משנה יומית</span>
                  <p className="text-brown-warm">מסכת תמורה</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-rich">2 משניות להיום</span>
                <span className="bg-gradient-to-r from-gold to-gold-dark text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">+10 נקודות</span>
              </div>
            </div>
          </Link>

          <Link href="/daily" className="block group">
            <div className="glass p-6 rounded-2xl hover-lift border border-violet-200 group-hover:border-violet-400 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-brown-deep text-xl">רמב״ם יומי</span>
                  <p className="text-brown-warm">הלכות יומיות</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-rich">הקדמה - מסירת התורה</span>
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">+15 נקודות</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Motivation Card - Premium Glass with Glow */}
      <div className="glass-card p-10 text-center relative overflow-hidden stagger-item glow-gold-intense">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-gold/10 animate-shimmer" />

        {/* Background Shield */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="relative w-48 h-48 animate-float">
            <Image src="/shield-emblem.png" alt="" fill className="object-contain" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gold rounded-full blur-xl opacity-50 animate-pulse" />
            <Image src="/shield-emblem.png" alt="רוח חשמונאית" fill className="object-contain relative z-10" />
          </div>
          <p className="text-brown-deep font-bold text-3xl sm:text-4xl font-hebrew leading-relaxed text-glow">
            &ldquo;לעלות ולהתעלות&rdquo;
          </p>
          <p className="text-gold-dark mt-2 text-xl font-semibold">למען שמו באהבה</p>
          <div className="gold-divider max-w-xs mx-auto my-6" />
          <p className="text-brown-rich font-bold text-lg flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            רוח חשמונאית
          </p>
        </div>
      </div>
    </div>
  );
}
