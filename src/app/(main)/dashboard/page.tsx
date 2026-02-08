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
  Crown,
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
      color: "gold",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "תפילות וזמנים",
      icon: Clock,
      color: "bronze",
    },
    {
      href: "/boost",
      title: "חיזוק יומי",
      description: "סרטון מחזק",
      icon: Play,
      color: "olive",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "צבירה ופדיון",
      icon: Award,
      color: "gold",
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
    <div className="py-6 sm:py-8 space-y-8">
      {/* Hero Welcome Card */}
      <div className="hero-premium p-8 sm:p-10 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/hero-banner.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-5">
            {/* User Avatar with Shield Emblem */}
            <div className="relative w-20 h-20 animate-float">
              <Image
                src="/shield-emblem.png"
                alt="סמל רוח חשמונאית"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>

            <div className="flex-1">
              <p className="text-gold-light text-sm mb-1 font-medium">{getGreeting()},</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-cream-white mb-2">
                {user?.name?.split(" ")[0] || "חייל יקר"}!
              </h1>
              <p className="text-cream/70">ברוך הבא לרוח חשמונאית</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="badge-gold">
              <Star className="w-4 h-4" />
              <span className="text-lg font-bold">{user?.points || 0}</span>
              <span className="text-sm">נקודות</span>
            </div>

            <div className="badge-dark">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold">{user?.streak || 0}</span>
              <span className="text-sm">ימים רצופים</span>
            </div>

            {user?.platoon && (
              <div className="badge-gold">
                <Shield className="w-4 h-4" />
                <span>{user.platoon}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logo Watermark */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-32 h-32 opacity-10 hidden sm:block">
          <Image
            src="/רוח חשמונאית.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Inspiring Quote */}
      <div className="quote-box relative overflow-hidden">
        {/* Corner Ornaments */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-30">
          <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 opacity-30 rotate-180">
          <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
        </div>

        <p className="text-brown-deep font-semibold text-xl pr-8 font-hebrew relative z-10">
          חזק ואמץ - כי ה׳ אלוקיך עמך בכל אשר תלך
        </p>
        <p className="text-gold-dark text-sm mt-3 font-bold relative z-10">יהושע א׳, ט׳</p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 gap-5">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className="card-luxury p-6 h-full group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`icon-circle-${link.color === 'gold' ? 'gold' : 'dark'} w-14 h-14 mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-brown-deep text-xl mb-1">{link.title}</h3>
                <p className="text-brown-soft">{link.description}</p>
                <div className="flex items-center gap-1 text-gold mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>המשך</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Daily Learning Preview */}
      <div className="card-luxury overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-sand">
          <div className="flex items-center gap-4">
            <div className="icon-circle-gold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-brown-deep text-xl">לימוד היום</h2>
              <p className="text-brown-soft">הלימודים שמחכים לך</p>
            </div>
          </div>
          <Link
            href="/daily"
            className="btn-premium btn-outline text-sm py-2 px-4"
          >
            לכל הלימודים
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Link>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-5">
          <Link href="/daily" className="block">
            <div className="card-gold p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4 mb-4">
                <div className="icon-circle-dark w-14 h-14">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-bold text-brown-deep text-xl">משנה יומית</span>
                  <p className="text-brown-warm">מסכת תמורה</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-rich">2 משניות להיום</span>
                <span className="badge-dark text-xs">+10 נקודות</span>
              </div>
            </div>
          </Link>

          <Link href="/daily" className="block">
            <div className="p-6 bg-gradient-to-br from-cream-white to-cream-warm rounded-2xl border border-sand hover:border-gold transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-4">
                <div className="icon-circle-gold w-14 h-14">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-bold text-brown-deep text-xl">רמב״ם יומי</span>
                  <p className="text-brown-warm">הלכות יומיות</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-rich">הקדמה - מסירת התורה</span>
                <span className="badge-gold text-xs">+15 נקודות</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="card-luxury p-7">
        <div className="flex items-center gap-4 mb-6">
          <div className="icon-circle-gold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-brown-deep text-xl">הסטטיסטיקות שלי</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="icon-circle-gold w-12 h-12 mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="stat-value">0</p>
            <p className="stat-label">דקות היום</p>
          </div>
          <div className="stat-card">
            <div className="icon-circle-dark w-12 h-12 mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="stat-value">0</p>
            <p className="stat-label">פרקים שהושלמו</p>
          </div>
          <div className="stat-card">
            <div className="icon-circle-gold w-12 h-12 mx-auto mb-3">
              <Flame className="w-6 h-6" />
            </div>
            <p className="stat-value">{user?.streak || 0}</p>
            <p className="stat-label">ימים רצופים</p>
          </div>
        </div>
      </div>

      {/* Motivation Card */}
      <div className="card-gold p-8 text-center relative overflow-hidden">
        {/* Background Shield */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="relative w-40 h-40">
            <Image src="/shield-emblem.png" alt="" fill className="object-contain" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image src="/shield-emblem.png" alt="רוח חשמונאית" fill className="object-contain" />
          </div>
          <p className="text-brown-deep font-bold text-2xl font-hebrew">
            &ldquo;לעלות ולהתעלות - למען שמו באהבה&rdquo;
          </p>
          <p className="text-brown-rich mt-4 font-semibold">רוח חשמונאית</p>
        </div>
      </div>
    </div>
  );
}
