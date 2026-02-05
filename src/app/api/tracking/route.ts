import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, contentId, contentRef, duration, verified, pointsEarned } = body;

    // Validate content type
    const validContentType = Object.values(ContentType).includes(contentType as ContentType)
      ? (contentType as ContentType)
      : ContentType.ARTICLE;

    // Create learning session
    const learningSession = await prisma.learningSession.create({
      data: {
        userId: session.user.id,
        contentType: validContentType,
        contentId,
        contentRef,
        duration,
        verified,
        pointsEarned,
        endTime: new Date(),
      },
    });

    // Update user points if verified
    if (verified && pointsEarned > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: pointsEarned },
        },
      });
    }

    // Update streak if this is the first session today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSessionToday = await prisma.learningSession.findFirst({
      where: {
        userId: session.user.id,
        startTime: { gte: today },
        id: { not: learningSession.id },
      },
    });

    if (!existingSessionToday) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lastLoginDate: true, streak: true },
      });

      if (user) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isConsecutive =
          user.lastLoginDate &&
          user.lastLoginDate >= yesterday &&
          user.lastLoginDate < today;

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            lastLoginDate: new Date(),
            streak: isConsecutive ? { increment: 1 } : 1,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: learningSession.id,
      pointsEarned,
    });
  } catch (error) {
    console.error("Error saving tracking session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: today },
      },
      orderBy: { startTime: "desc" },
    });

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalPoints = sessions.reduce((sum, s) => sum + s.pointsEarned, 0);

    return NextResponse.json({
      sessions,
      todayStats: {
        totalDuration,
        totalPoints,
        sessionCount: sessions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
