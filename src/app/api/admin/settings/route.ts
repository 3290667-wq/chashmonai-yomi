import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  id: "app-settings",
  pointsPerMinute: 0.2,
  minLearningMinutes: 5,
  streakBonusPoints: 5,
  completionBonusPoints: 10,
  appName: "חשמונאי יומי",
  appSlogan: "לעלות ולהתעלות",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.appSettings.findUnique({
      where: { id: "app-settings" },
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.appSettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      pointsPerMinute,
      minLearningMinutes,
      streakBonusPoints,
      completionBonusPoints,
      appName,
      appSlogan,
    } = body;

    const settings = await prisma.appSettings.upsert({
      where: { id: "app-settings" },
      update: {
        pointsPerMinute: pointsPerMinute ?? DEFAULT_SETTINGS.pointsPerMinute,
        minLearningMinutes: minLearningMinutes ?? DEFAULT_SETTINGS.minLearningMinutes,
        streakBonusPoints: streakBonusPoints ?? DEFAULT_SETTINGS.streakBonusPoints,
        completionBonusPoints: completionBonusPoints ?? DEFAULT_SETTINGS.completionBonusPoints,
        appName: appName ?? DEFAULT_SETTINGS.appName,
        appSlogan: appSlogan ?? DEFAULT_SETTINGS.appSlogan,
      },
      create: {
        id: "app-settings",
        pointsPerMinute: pointsPerMinute ?? DEFAULT_SETTINGS.pointsPerMinute,
        minLearningMinutes: minLearningMinutes ?? DEFAULT_SETTINGS.minLearningMinutes,
        streakBonusPoints: streakBonusPoints ?? DEFAULT_SETTINGS.streakBonusPoints,
        completionBonusPoints: completionBonusPoints ?? DEFAULT_SETTINGS.completionBonusPoints,
        appName: appName ?? DEFAULT_SETTINGS.appName,
        appSlogan: appSlogan ?? DEFAULT_SETTINGS.appSlogan,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
