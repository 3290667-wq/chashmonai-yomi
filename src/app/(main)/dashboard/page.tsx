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
  Heart,
  Shield,
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
      shadowColor: "shadow-gold/20",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "תפילות וזמנים",
      icon: Clock,
      gradient: "from-warm-orange to-amber-600",
      shadowColor: "shadow-orange-500/20",
    },
    {
      href: "/boost",
      title: "חיזוק יומי",
      description: "סרטון מחזק",
      icon: Play,
      gradient: "from-olive to-olive-light",
      shadowColor: "shadow-olive/20",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "צבירה ופדיון",
      icon: Award,
      gradient: "from-sky-dark to-sky-medium",
      shadowColor: "shadow-sky-500/20",
    },
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
    <div className="py-4 sm:py-6 space-y-6">
      {/* Hero Welcome Card with Reka Background */}
      <div className="relative overflow-hidden rounded-3xl min-h-[200px]">
        {/* Reka Background Image */}
        <Image
          src="/reka.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Semi-transparent overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-brown-dark/70 via-brown-medium/60 to-brown-dark/70" />

        {/* Logo Watermark */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-28 h-28 opacity-25 z-10">
          <Image
            src="/רוח חשמונאית.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg animate-float">
              <Shield className="w-8 h-8 text-brown-dark" />
            </div>

            <div className="flex-1">
              <p className="text-gold-light/80 text-sm mb-1">{getGreeting()},</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream mb-1">
                {user?.name?.split(" ")[0] || "חייל יקר"}!
              </h1>
              <p className="text-cream/60 text-sm">ברוך הבא לרוח חשמונאית</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cream">{user?.points || 0}</p>
                <p className="text-xs text-cream/60">נקודות זכות</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <div className="w-10 h-10 bg-warm-orange/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-warm-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cream">{user?.streak || 0}</p>
                <p className="text-xs text-cream/60">ימים רצופים</p>
              </div>
            </div>

            {user?.platoon && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-olive-light" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cream">{user.platoon}</p>
                  <p className="text-xs text-cream/60">פלוגה</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspiring Quote */}
      <div className="quote-box glass-card">
        <p className="text-brown-dark font-medium text-lg pr-6">
          חזק ואמץ - כי ה׳ אלוקיך עמך בכל אשר תלך
        </p>
        <p className="text-gold-dark text-sm mt-2 font-medium">יהושע א׳, ט׳</p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className="glass-card rounded-2xl p-5 card-hover h-full group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${link.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-brown-dark text-lg">{link.title}</h3>
                <p className="text-sm text-brown-light mt-1">{link.description}</p>
                <div className="flex items-center gap-1 text-gold-dark mt-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>המשך</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Daily Learning Preview */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-sand/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-brown-dark text-lg">לימוד היום</h2>
              <p className="text-sm text-brown-light">הלימודים שמחכים לך</p>
            </div>
          </div>
          <Link
            href="/daily"
            className="flex items-center gap-1 text-gold-dark hover:text-brown-dark transition-colors font-medium text-sm bg-gold-light/50 px-4 py-2 rounded-xl"
          >
            לכל הלימודים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <Link href="/daily" className="block">
            <div className="p-5 bg-gradient-to-br from-cream to-gold-light/30 rounded-2xl border border-gold-light/50 hover:border-gold transition-all hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-brown-dark text-lg">משנה יומית</span>
                  <p className="text-brown-light text-sm">מסכת תמורה</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-medium">2 משניות להיום</span>
                <span className="text-gold-dark font-medium">+10 נקודות</span>
              </div>
            </div>
          </Link>

          <Link href="/daily" className="block">
            <div className="p-5 bg-gradient-to-br from-cream to-warm-orange/10 rounded-2xl border border-warm-orange/30 hover:border-warm-orange transition-all hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-warm-orange to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-brown-dark text-lg">רמב״ם יומי</span>
                  <p className="text-brown-light text-sm">הלכות יומיות</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-medium">הקדמה - מסירת התורה</span>
                <span className="text-warm-orange font-medium">+15 נקודות</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-olive to-olive-light rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-brown-dark text-lg">הסטטיסטיקות שלי</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-cream to-gold-light/30 rounded-2xl border border-gold-light/50">
            <div className="w-10 h-10 mx-auto bg-gold/20 rounded-xl flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-gold-dark" />
            </div>
            <p className="text-2xl font-bold text-brown-dark">0</p>
            <p className="text-xs text-brown-light mt-1">דקות היום</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-cream to-olive-light/20 rounded-2xl border border-olive-light/30">
            <div className="w-10 h-10 mx-auto bg-olive/20 rounded-xl flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-olive" />
            </div>
            <p className="text-2xl font-bold text-brown-dark">0</p>
            <p className="text-xs text-brown-light mt-1">פרקים שהושלמו</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-cream to-warm-orange/10 rounded-2xl border border-warm-orange/30">
            <div className="w-10 h-10 mx-auto bg-warm-orange/20 rounded-xl flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-warm-orange" />
            </div>
            <p className="text-2xl font-bold text-brown-dark">{user?.streak || 0}</p>
            <p className="text-xs text-brown-light mt-1">ימים רצופים</p>
          </div>
        </div>
      </div>

      {/* Motivation Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-l from-gold via-gold-dark to-gold" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-warm-orange rounded-full blur-2xl" />
        </div>
        <div className="relative p-6 text-center">
          <Heart className="w-8 h-8 text-brown-dark/30 mx-auto mb-3" />
          <p className="text-brown-dark font-bold text-xl">
            &ldquo;לעלות ולהתעלות - למען שמו באהבה&rdquo;
          </p>
          <p className="text-brown-dark/70 text-sm mt-3 font-medium">רוח חשמונאית</p>
        </div>
      </div>
    </div>
  );
}
