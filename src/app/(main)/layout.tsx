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
      {/* Fixed Background Image - Soldier with Tallit on Golan Heights */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/main-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream-white/85 via-cream-white/75 to-cream-white/90" />
      </div>

      <Navbar
        userName={session.user?.name || undefined}
        userPoints={session.user?.points || 0}
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
