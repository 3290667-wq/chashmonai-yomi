import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get daily boosts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "30");

    const boosts = await prisma.dailyBoost.findMany({
      orderBy: { date: "desc" },
      take: limit,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Check if today has a boost
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBoost = await prisma.dailyBoost.findUnique({
      where: { date: today },
    });

    return NextResponse.json({
      boosts,
      hasTodayBoost: !!todayBoost,
    });
  } catch (error) {
    console.error("Error fetching boosts:", error);
    return NextResponse.json(
      { error: "Failed to fetch boosts" },
      { status: 500 }
    );
  }
}

// POST - Create a new daily boost
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, title, description, videoUrl } = body;

    if (!date || !title || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const boostDate = new Date(date);
    boostDate.setHours(0, 0, 0, 0);

    // Check if boost already exists for this date
    const existing = await prisma.dailyBoost.findUnique({
      where: { date: boostDate },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Boost already exists for this date" },
        { status: 400 }
      );
    }

    const boost = await prisma.dailyBoost.create({
      data: {
        date: boostDate,
        title,
        description: description || null,
        videoUrl,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ boost });
  } catch (error) {
    console.error("Error creating boost:", error);
    return NextResponse.json(
      { error: "Failed to create boost" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a boost
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing boost ID" }, { status: 400 });
    }

    await prisma.dailyBoost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting boost:", error);
    return NextResponse.json(
      { error: "Failed to delete boost" },
      { status: 500 }
    );
  }
}
