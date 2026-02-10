import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentType } from "@prisma/client";

// Default settings (fallback if database settings not available)
const DEFAULT_SETTINGS = {
  pointsPerMinute: 0.2,
  minLearningMinutes: 5,
  streakBonusPoints: 5,
  completionBonusPoints: 10,
};

// Get settings from database or use defaults
async function getAppSettings() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "app-settings" },
    });
    if (settings) {
      return {
        pointsPerMinute: settings.pointsPerMinute,
        minLearningMinutes: settings.minLearningMinutes,
        streakBonusPoints: settings.streakBonusPoints,
        completionBonusPoints: settings.completionBonusPoints,
      };
    }
  } catch (error) {
    console.error("[Tracking] Failed to load settings, using defaults:", error);
  }
  return DEFAULT_SETTINGS;
}

// Server-side points calculation using settings from database
function calculatePointsServer(
  durationMs: number,
  verified: boolean,
  isCompletion: boolean,
  settings: typeof DEFAULT_SETTINGS
): number {
  const minDurationMs = settings.minLearningMinutes * 60000;

  // For completion events, always give at least the completion bonus
  if (isCompletion && verified) {
    const minutes = durationMs / 60000;
    const basePoints = Math.floor(minutes * settings.pointsPerMinute);
    return basePoints + settings.completionBonusPoints;
  }

  if (!verified) return 0;
  if (durationMs < minDurationMs) return 0;

  const minutes = durationMs / 60000;
  return Math.floor(minutes * settings.pointsPerMinute);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("[Tracking API] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, contentId, contentRef, duration, verified, pointsEarned: clientPoints, isAutoSave } = body;

    console.log("[Tracking API] Received request:", JSON.stringify(body));

    // Load settings from database
    const settings = await getAppSettings();
    console.log("[Tracking API] Using settings:", settings);

    // For auto-saves, only update points incrementally without creating session records
    if (isAutoSave) {
      const calculatedPoints = calculatePointsServer(duration, verified, false, settings);

      // Get the user's current learning session for today to calculate increment
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysSessions = await prisma.learningSession.findMany({
        where: {
          userId: session.user.id,
          startTime: { gte: today },
          contentType: contentType as ContentType,
        },
        select: { pointsEarned: true },
      });

      const alreadyEarnedToday = todaysSessions.reduce((sum, s) => sum + s.pointsEarned, 0);
      const pointsToAdd = Math.max(0, calculatedPoints - alreadyEarnedToday);

      if (pointsToAdd > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            points: { increment: pointsToAdd },
          },
        });
        console.log("[Tracking API] Auto-save: Added", pointsToAdd, "points (total calculated:", calculatedPoints, ", already earned:", alreadyEarnedToday, ")");
      }

      return NextResponse.json({
        success: true,
        isAutoSave: true,
        pointsEarned: calculatedPoints,
        pointsAdded: pointsToAdd,
      });
    }

    // Validate content type
    const validContentType = Object.values(ContentType).includes(contentType as ContentType)
      ? (contentType as ContentType)
      : ContentType.ARTICLE;

    // Check if this is a completion event (from the "Complete" button)
    const isCompletionEvent = contentRef === "daily-completion";

    // Calculate points server-side using database settings
    const calculatedPoints = calculatePointsServer(duration, verified, isCompletionEvent, settings);

    // For completion events, use the max of calculated or client-sent points (prevents abuse but allows bonuses)
    const finalPoints = isCompletionEvent && verified
      ? Math.max(calculatedPoints, Math.min(clientPoints || 0, 50)) // Cap at 50 to prevent abuse
      : calculatedPoints;

    console.log("[Tracking API] Session processing:", {
      userId: session.user.id,
      contentType: validContentType,
      duration,
      durationMinutes: Math.floor(duration / 60000),
      verified,
      isCompletionEvent,
      calculatedPoints,
      finalPoints,
    });

    // Create learning session
    const learningSession = await prisma.learningSession.create({
      data: {
        userId: session.user.id,
        contentType: validContentType,
        contentId,
        contentRef,
        duration,
        verified,
        pointsEarned: finalPoints,
        endTime: new Date(),
      },
    });

    // Update user points if points earned
    if (finalPoints > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: finalPoints },
        },
      });
    }

    // Update streak if this is the first session today - using transaction to prevent race conditions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      const existingSessionToday = await tx.learningSession.findFirst({
        where: {
          userId: session.user.id,
          startTime: { gte: today },
          id: { not: learningSession.id },
        },
      });

      if (!existingSessionToday) {
        const user = await tx.user.findUnique({
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

          await tx.user.update({
            where: { id: session.user.id },
            data: {
              lastLoginDate: new Date(),
              streak: isConsecutive ? { increment: 1 } : 1,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: learningSession.id,
      pointsEarned: finalPoints,
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
