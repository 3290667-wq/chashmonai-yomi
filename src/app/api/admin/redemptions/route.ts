import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all redemption requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    // RAMs can only see their platoon's redemptions (if they have a platoon)
    // If RAM has no platoon assigned, show no redemptions with a note
    if (session.user.role === "RAM") {
      if (session.user.platoon) {
        where.user = { platoon: session.user.platoon };
      } else {
        // RAM without platoon can't see any redemptions
        return NextResponse.json({
          redemptions: [],
          note: "לא משויך לפלוגה - לא ניתן להציג סליקות"
        });
      }
    }

    const redemptions = await prisma.pointsRedemption.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            platoon: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

// PATCH - Approve or reject a redemption
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { redemptionId, status, adminNote } = body;

    if (!redemptionId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get redemption
    const redemption = await prisma.pointsRedemption.findUnique({
      where: { id: redemptionId },
      include: { user: true },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    if (redemption.status !== "PENDING") {
      return NextResponse.json(
        { error: "Redemption already processed" },
        { status: 400 }
      );
    }

    // RAMs can only process their platoon's redemptions
    if (
      session.user.role === "RAM" &&
      redemption.user.platoon !== session.user.platoon
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update redemption
    const updatedRedemption = await prisma.pointsRedemption.update({
      where: { id: redemptionId },
      data: {
        status,
        adminNote: adminNote || null,
      },
    });

    // If approved, deduct points from user
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: redemption.userId },
        data: {
          points: { decrement: redemption.points },
        },
      });
    }

    return NextResponse.json({ redemption: updatedRedemption });
  } catch (error) {
    console.error("Error processing redemption:", error);
    return NextResponse.json(
      { error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
