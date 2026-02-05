import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Gift,
  Video,
  ArrowRight,
  Shield,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/users", label: "משתמשים", icon: Users },
  { href: "/admin/stats", label: "אישור סליקות", icon: Gift },
  { href: "/admin/content", label: "תכנים", icon: FileText },
  { href: "/admin/boost", label: "חיזוק יומי", icon: Video },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is admin or RAM
  if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-l border-card-border flex-col">
        {/* Header */}
        <div className="p-6 border-b border-card-border">
          <div className="flex items-center gap-2 text-primary">
            <Shield size={24} />
            <span className="font-bold text-lg">פאנל ניהול</span>
          </div>
          <p className="text-sm text-muted mt-1">
            {session.user.role === "ADMIN" ? "מנהל" : 'ר"מ'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-background transition-colors"
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to App */}
        <div className="p-4 border-t border-card-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <ArrowRight size={18} />
            <span>חזרה לאפליקציה</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary text-white h-14 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Shield size={20} />
          <span className="font-bold">פאנל ניהול</span>
        </div>
        <Link href="/dashboard" className="text-sm">
          חזרה
        </Link>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-card-border h-16 flex items-center justify-around z-50">
        {adminNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-colors"
            >
              <Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:p-6 p-4 pt-16 pb-20 md:pt-6 md:pb-6 overflow-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
