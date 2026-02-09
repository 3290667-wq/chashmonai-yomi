import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, platoon } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "נדרשים אימייל וסיסמה" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להכיל לפחות 6 תווים" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "משתמש עם אימייל זה כבר קיים" },
        { status: 400 }
      );
    }

    // Validate platoon exists if provided
    if (platoon) {
      const existingPlatoon = await prisma.platoon.findUnique({
        where: { name: platoon },
      });

      if (!existingPlatoon) {
        return NextResponse.json(
          { error: "פלוגה לא קיימת במערכת" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        platoon: platoon || null,
      },
    });

    return NextResponse.json({
      message: "המשתמש נוצר בהצלחה",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "שגיאה ביצירת המשתמש", details: errorMessage },
      { status: 500 }
    );
  }
}
