import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const newPassword = searchParams.get("password");
  const secret = searchParams.get("secret");
  const name = searchParams.get("name") || "Admin";
  const create = searchParams.get("create") === "true";

  // Simple security check
  if (secret !== "chashmonai2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email || !newPassword) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let user;
    if (create) {
      // Create new admin user
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      role: user.role,
      created: create,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed: " + String(error) },
      { status: 500 }
    );
  }
}
