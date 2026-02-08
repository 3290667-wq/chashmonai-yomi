import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all content
    const allContent = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        videoUrl: true,
        isPublished: true,
        createdAt: true,
      },
    });

    // Get daily boosts
    const dailyBoosts = await prisma.dailyBoost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        date: true,
        title: true,
        description: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    // Get users count
    const usersCount = await prisma.user.count();

    return NextResponse.json({
      totalContent: allContent.length,
      allContent,
      totalDailyBoosts: dailyBoosts.length,
      dailyBoosts,
      usersCount,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
