import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const platoon = searchParams.get("platoon");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    // RAMs can only see their platoon's users
    if (session.user.role === "RAM" && session.user.platoon) {
      where.platoon = session.user.platoon;
    } else if (platoon) {
      where.platoon = platoon;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        platoon: true,
        points: true,
        streak: true,
        lastLoginDate: true,
        createdAt: true,
        _count: {
          select: { learningSessions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get distinct platoons
    const platoons = await prisma.user.findMany({
      where: { platoon: { not: null } },
      select: { platoon: true },
      distinct: ["platoon"],
    });

    return NextResponse.json({
      users,
      platoons: platoons.map((p) => p.platoon).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, platoon, email, password } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (role && ["USER", "RAM", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    if (platoon !== undefined) {
      updateData.platoon = platoon || null;
    }

    // Update email if provided
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "כתובת האימייל כבר בשימוש" },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "הסיסמה חייבת להכיל לפחות 6 תווים" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        platoon: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `שגיאה בעדכון המשתמש: ${errorMessage}` },
      { status: 500 }
    );
  }
}
