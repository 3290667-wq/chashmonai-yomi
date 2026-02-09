import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Image from "next/image";

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
    <div className="min-h-screen relative">
      {/* Desert Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/desert-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a140f]/80 via-[#251c14]/70 to-[#1a140f]/90" />
      </div>

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
