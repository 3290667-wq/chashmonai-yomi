import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get user's points summary
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        points: true,
        streak: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: today },
      },
    });

    const todayMinutes = Math.floor(
      todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60000
    );
    const todayPoints = todaySessions.reduce((sum, s) => sum + s.pointsEarned, 0);

    // Get this week's stats
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekSessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: weekStart },
      },
    });

    const weekMinutes = Math.floor(
      weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60000
    );
    const weekPoints = weekSessions.reduce((sum, s) => sum + s.pointsEarned, 0);

    // Get total stats
    const allSessions = await prisma.learningSession.aggregate({
      where: { userId: session.user.id },
      _sum: {
        duration: true,
        pointsEarned: true,
      },
      _count: true,
    });

    const totalMinutes = Math.floor((allSessions._sum.duration || 0) / 60000);

    // Get pending redemptions
    const pendingRedemptions = await prisma.pointsRedemption.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    const pendingPoints = pendingRedemptions.reduce((sum, r) => sum + r.points, 0);

    return NextResponse.json({
      currentPoints: user.points,
      streak: user.streak,
      pendingPoints,
      availablePoints: user.points - pendingPoints,
      stats: {
        today: {
          minutes: todayMinutes,
          points: todayPoints,
        },
        week: {
          minutes: weekMinutes,
          points: weekPoints,
        },
        total: {
          minutes: totalMinutes,
          points: allSessions._sum.pointsEarned || 0,
          sessions: allSessions._count,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
