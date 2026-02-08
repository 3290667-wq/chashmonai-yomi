import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Test endpoint to debug content creation
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diagnostics: Record<string, any> = {};

  try {
    // Test 1: Check session
    const session = await auth();
    diagnostics.session = {
      exists: !!session,
      userId: session?.user?.id || null,
      userRole: session?.user?.role || null,
      userName: session?.user?.name || null,
    };

    // Test 2: Check database connection
    try {
      const userCount = await prisma.user.count();
      diagnostics.database = {
        connected: true,
        userCount,
      };
    } catch (dbError) {
      diagnostics.database = {
        connected: false,
        error: String(dbError),
      };
    }

    // Test 3: Check existing content
    try {
      const contentCount = await prisma.content.count();
      const recentContent = await prisma.content.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
        },
      });
      diagnostics.content = {
        count: contentCount,
        recent: recentContent,
      };
    } catch (contentError) {
      diagnostics.content = {
        error: String(contentError),
      };
    }

    // Test 4: Try to create test content (only if admin and user ID exists)
    if (session?.user?.id && session?.user?.role === "ADMIN") {
      try {
        const testContent = await prisma.content.create({
          data: {
            type: "VIDEO",
            title: "Test Content - " + new Date().toISOString(),
            description: "This is a test content created by debug endpoint",
            isPublished: true,
            createdById: session.user.id,
          },
        });
        diagnostics.testCreate = {
          success: true,
          contentId: testContent.id,
        };

        // Clean up test content
        await prisma.content.delete({
          where: { id: testContent.id },
        });
        diagnostics.testCreate.cleaned = true;
      } catch (createError) {
        diagnostics.testCreate = {
          success: false,
          error: String(createError),
          userId: session.user.id,
        };
      }
    } else {
      diagnostics.testCreate = {
        skipped: true,
        reason: !session?.user?.id
          ? "No user ID in session"
          : "User is not admin (role: " + session?.user?.role + ")",
      };
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      diagnostics,
    }, { status: 500 });
  }
}
