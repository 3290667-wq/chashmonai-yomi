import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get user's redemption requests
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redemptions = await prisma.pointsRedemption.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemptions" },
      { status: 500 }
    );
  }
}

// POST - Create a new redemption request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { points } = body;

    if (!points || points < 1) {
      return NextResponse.json(
        { error: "Invalid points amount" },
        { status: 400 }
      );
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check pending redemptions
    const pendingRedemptions = await prisma.pointsRedemption.aggregate({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
      _sum: { points: true },
    });

    const pendingPoints = pendingRedemptions._sum.points || 0;
    const availablePoints = user.points - pendingPoints;

    if (points > availablePoints) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          availablePoints,
          requestedPoints: points,
        },
        { status: 400 }
      );
    }

    // Create redemption request
    const redemption = await prisma.pointsRedemption.create({
      data: {
        userId: session.user.id,
        points,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      redemption,
      remainingAvailable: availablePoints - points,
    });
  } catch (error) {
    console.error("Error creating redemption:", error);
    return NextResponse.json(
      { error: "Failed to create redemption request" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a pending redemption request
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const redemptionId = searchParams.get("id");

    if (!redemptionId) {
      return NextResponse.json(
        { error: "Missing redemption ID" },
        { status: 400 }
      );
    }

    // Verify ownership and status
    const redemption = await prisma.pointsRedemption.findFirst({
      where: {
        id: redemptionId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: "Redemption not found or cannot be cancelled" },
        { status: 404 }
      );
    }

    // Delete the redemption
    await prisma.pointsRedemption.delete({
      where: { id: redemptionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling redemption:", error);
    return NextResponse.json(
      { error: "Failed to cancel redemption" },
      { status: 500 }
    );
  }
}
