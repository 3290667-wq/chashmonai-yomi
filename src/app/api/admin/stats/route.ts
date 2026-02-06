import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Total users
    const totalUsers = await prisma.user.count();
    const activeUsersToday = await prisma.learningSession.groupBy({
      by: ["userId"],
      where: { startTime: { gte: today } },
    });

    const activeUsersWeek = await prisma.learningSession.groupBy({
      by: ["userId"],
      where: { startTime: { gte: weekStart } },
    });

    // Total points
    const totalPoints = await prisma.user.aggregate({
      _sum: { points: true },
    });

    // Pending redemptions
    const pendingRedemptions = await prisma.pointsRedemption.count({
      where: { status: "PENDING" },
    });

    const pendingRedemptionsTotal = await prisma.pointsRedemption.aggregate({
      where: { status: "PENDING" },
      _sum: { points: true },
    });

    // Learning stats
    const todayLearning = await prisma.learningSession.aggregate({
      where: { startTime: { gte: today } },
      _sum: { duration: true, pointsEarned: true },
      _count: true,
    });

    const weekLearning = await prisma.learningSession.aggregate({
      where: { startTime: { gte: weekStart } },
      _sum: { duration: true, pointsEarned: true },
      _count: true,
    });

    // Top learners this week
    const topLearners = await prisma.learningSession.groupBy({
      by: ["userId"],
      where: { startTime: { gte: weekStart } },
      _sum: { duration: true, pointsEarned: true },
      orderBy: { _sum: { pointsEarned: "desc" } },
      take: 10,
    });

    const topLearnersWithNames = await Promise.all(
      topLearners.map(async (learner) => {
        const user = await prisma.user.findUnique({
          where: { id: learner.userId },
          select: { name: true, platoon: true },
        });
        return {
          userId: learner.userId,
          name: user?.name || "משתמש",
          platoon: user?.platoon,
          totalMinutes: Math.floor((learner._sum.duration || 0) / 60000),
          totalPoints: learner._sum.pointsEarned || 0,
        };
      })
    );

    // Users by platoon
    const usersByPlatoon = await prisma.user.groupBy({
      by: ["platoon"],
      _count: true,
    });

    // Count RAMs
    const totalRams = await prisma.user.count({
      where: { role: "RAM" },
    });

    // Count distinct platoons
    const totalPlatoons = usersByPlatoon.filter(p => p.platoon).length;

    return NextResponse.json({
      // Simple stats for admin dashboard
      totalUsers,
      activeToday: activeUsersToday.length,
      totalRams,
      totalPlatoons,
      // Detailed stats
      users: {
        total: totalUsers,
        activeToday: activeUsersToday.length,
        activeWeek: activeUsersWeek.length,
      },
      points: {
        total: totalPoints._sum.points || 0,
        pendingRedemptions,
        pendingRedemptionsPoints: pendingRedemptionsTotal._sum.points || 0,
      },
      learning: {
        today: {
          sessions: todayLearning._count,
          minutes: Math.floor((todayLearning._sum.duration || 0) / 60000),
          points: todayLearning._sum.pointsEarned || 0,
        },
        week: {
          sessions: weekLearning._count,
          minutes: Math.floor((weekLearning._sum.duration || 0) / 60000),
          points: weekLearning._sum.pointsEarned || 0,
        },
      },
      topLearners: topLearnersWithNames,
      usersByPlatoon: usersByPlatoon.map((p) => ({
        platoon: p.platoon || "ללא פלוגה",
        count: p._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
