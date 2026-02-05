import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, platoon: true, points: true, streak: true },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.platoon = dbUser.platoon;
          session.user.points = dbUser.points;
          session.user.streak = dbUser.streak;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
