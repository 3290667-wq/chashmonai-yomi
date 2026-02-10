import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all prizes
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prizes = await prisma.prize.findMany({
      orderBy: [{ order: "asc" }, { pointsCost: "asc" }],
    });

    return NextResponse.json({ prizes });
  } catch (error) {
    console.error("Error fetching prizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch prizes" },
      { status: 500 }
    );
  }
}

// POST - Create new prize
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, pointsCost, imageUrl } = body;

    if (!name || !pointsCost) {
      return NextResponse.json(
        { error: "חסרים שדות חובה" },
        { status: 400 }
      );
    }

    const prize = await prisma.prize.create({
      data: {
        name,
        description,
        pointsCost,
        imageUrl,
      },
    });

    return NextResponse.json({ prize, success: true });
  } catch (error) {
    console.error("Error creating prize:", error);
    return NextResponse.json(
      { error: "Failed to create prize" },
      { status: 500 }
    );
  }
}

// PATCH - Update prize
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, pointsCost, imageUrl, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "חסר מזהה פרס" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (pointsCost !== undefined) updateData.pointsCost = pointsCost;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const prize = await prisma.prize.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ prize, success: true });
  } catch (error) {
    console.error("Error updating prize:", error);
    return NextResponse.json(
      { error: "Failed to update prize" },
      { status: 500 }
    );
  }
}

// DELETE - Delete prize
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing prize ID" }, { status: 400 });
    }

    await prisma.prize.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prize:", error);
    return NextResponse.json(
      { error: "Failed to delete prize" },
      { status: 500 }
    );
  }
}
