import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all platoons
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const platoons = await prisma.platoon.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ platoons });
  } catch (error) {
    console.error("Error fetching platoons:", error);
    return NextResponse.json(
      { error: "Failed to fetch platoons" },
      { status: 500 }
    );
  }
}

// POST - Create a new platoon
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "שם הפלוגה נדרש" },
        { status: 400 }
      );
    }

    // Check if platoon already exists
    const existing = await prisma.platoon.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "פלוגה עם שם זה כבר קיימת" },
        { status: 400 }
      );
    }

    const platoon = await prisma.platoon.create({
      data: { name: name.trim() },
    });

    return NextResponse.json({ platoon });
  } catch (error) {
    console.error("Error creating platoon:", error);
    return NextResponse.json(
      { error: "Failed to create platoon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a platoon
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "מזהה פלוגה נדרש" },
        { status: 400 }
      );
    }

    // Check if any users are in this platoon
    const platoon = await prisma.platoon.findUnique({
      where: { id },
    });

    if (!platoon) {
      return NextResponse.json(
        { error: "פלוגה לא נמצאה" },
        { status: 404 }
      );
    }

    const usersInPlatoon = await prisma.user.count({
      where: { platoon: platoon.name },
    });

    if (usersInPlatoon > 0) {
      return NextResponse.json(
        { error: `לא ניתן למחוק פלוגה עם ${usersInPlatoon} חיילים משויכים` },
        { status: 400 }
      );
    }

    await prisma.platoon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting platoon:", error);
    return NextResponse.json(
      { error: "Failed to delete platoon" },
      { status: 500 }
    );
  }
}
