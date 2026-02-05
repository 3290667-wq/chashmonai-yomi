import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get points earning history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "30");
    const cursor = searchParams.get("cursor");

    // Get learning sessions with points
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        pointsEarned: { gt: 0 },
      },
      orderBy: { startTime: "desc" },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      select: {
        id: true,
        contentType: true,
        contentRef: true,
        duration: true,
        pointsEarned: true,
        startTime: true,
        verified: true,
      },
    });

    // Get daily aggregated stats for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.$queryRaw<
      { date: Date; totalPoints: bigint; totalMinutes: bigint }[]
    >`
      SELECT
        DATE("startTime") as date,
        SUM("pointsEarned") as "totalPoints",
        SUM("duration") / 60000 as "totalMinutes"
      FROM "LearningSession"
      WHERE "userId" = ${session.user.id}
        AND "startTime" >= ${thirtyDaysAgo}
      GROUP BY DATE("startTime")
      ORDER BY date DESC
    `;

    const formattedDailyStats = dailyStats.map((stat) => ({
      date: stat.date,
      points: Number(stat.totalPoints),
      minutes: Number(stat.totalMinutes),
    }));

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        ...s,
        durationMinutes: Math.floor(s.duration / 60000),
      })),
      dailyStats: formattedDailyStats,
      hasMore: sessions.length === limit,
    });
  } catch (error) {
    console.error("Error fetching points history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
