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
    <div className="min-h-screen bg-cream">
      <Navbar
        userName={session.user?.name || undefined}
        userPoints={session.user?.points || 0}
      />

      {/* Main content with padding for navbar */}
      <main className="pt-16 pb-20 lg:pb-6 lg:pr-64 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
