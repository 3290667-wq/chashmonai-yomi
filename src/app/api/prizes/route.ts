import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all active prizes for users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    // Get all active prizes, sorted by points cost
    const prizes = await prisma.prize.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { pointsCost: "asc" }],
    });

    // Find the next prize the user can earn
    const currentPoints = user?.points || 0;
    const nextPrize = prizes.find((prize) => prize.pointsCost > currentPoints);
    const availablePrizes = prizes.filter((prize) => prize.pointsCost <= currentPoints);

    // Calculate points needed for next prize
    const pointsToNextPrize = nextPrize ? nextPrize.pointsCost - currentPoints : 0;
    const progressToNextPrize = nextPrize
      ? Math.round((currentPoints / nextPrize.pointsCost) * 100)
      : 100;

    return NextResponse.json({
      prizes,
      currentPoints,
      nextPrize: nextPrize || null,
      pointsToNextPrize,
      progressToNextPrize,
      availablePrizes,
    });
  } catch (error) {
    console.error("Error fetching prizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch prizes" },
      { status: 500 }
    );
  }
}
