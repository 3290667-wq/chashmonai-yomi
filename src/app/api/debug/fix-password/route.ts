import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== "fix2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hash = await bcrypt.hash("Test1234", 10);

    const user = await prisma.user.update({
      where: { email: "3290667@gmail.com" },
      data: { password: hash },
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
      message: "Password set to: Test1234"
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
