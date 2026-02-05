import { auth } from "@/lib/auth";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  ChevronLeft,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  const quickLinks = [
    {
      href: "/daily",
      title: "לימוד יומי",
      description: "משנה יומית, רמב״ם ועוד",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      href: "/zmanim",
      title: "זמני היום",
      description: "עלות השחר, נץ, שקיעה",
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      href: "/content",
      title: "חיזוק יומי",
      description: "סרטון מחזק להיום",
      icon: Play,
      color: "bg-green-500",
    },
    {
      href: "/points",
      title: "נקודות",
      description: "ניהול וסליקת נקודות",
      icon: Award,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="py-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          שלום, {user?.name?.split(" ")[0] || "חייל"}!
        </h1>
        <p className="text-white/80 mb-4">
          ברוכים הבאים לחשמונאי יומי - המקום שלך ללמוד ולהתקדם
        </p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Award className="text-secondary" size={24} />
            <div>
              <p className="text-2xl font-bold">{user?.points || 0}</p>
              <p className="text-sm text-white/70">נקודות</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="text-accent" size={24} />
            <div>
              <p className="text-2xl font-bold">{user?.streak || 0}</p>
              <p className="text-sm text-white/70">ימים רצופים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card
                variant="bordered"
                className="h-full hover:border-primary transition-colors cursor-pointer"
              >
                <div
                  className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-foreground">{link.title}</h3>
                <p className="text-sm text-muted mt-1">{link.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Daily Learning Preview */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>לימוד יומי</CardTitle>
            <CardDescription>הלימודים של היום</CardDescription>
          </div>
          <Link
            href="/daily"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            לכל הלימודים
            <ChevronLeft size={16} />
          </Link>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border border-card-border">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-primary" />
                <span className="font-medium">משנה יומית</span>
              </div>
              <p className="text-muted text-sm">פרק היום מחכה לך</p>
            </div>

            <div className="p-4 bg-background rounded-lg border border-card-border">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-primary" />
                <span className="font-medium">רמב"ם יומי</span>
              </div>
              <p className="text-muted text-sm">הלכה יומית</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>הסטטיסטיקות שלי</CardTitle>
          <CardDescription>סיכום הפעילות שלך</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted">דקות לימוד היום</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted">פרקים שהושלמו</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">{user?.streak || 0}</p>
              <p className="text-sm text-muted">ימים רצופים</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
