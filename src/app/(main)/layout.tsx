import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      <Navbar
        userName={session.user?.name || undefined}
        userPoints={session.user?.points || 0}
        userStreak={session.user?.streak || 0}
      />

      {/* Main content with padding for navbar */}
      <main className="relative z-10 pt-16 pb-20 lg:pb-6 lg:pr-72 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
