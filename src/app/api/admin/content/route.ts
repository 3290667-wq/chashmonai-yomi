import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all content
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }

    const content = await prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ contents: content });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// POST - Create new content
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("[Content API] POST request started");

  try {
    // Step 1: Get session
    console.log("[Content API] Getting session...");
    const session = await auth();
    console.log("[Content API] Session result:", {
      exists: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userName: session?.user?.name,
    });

    if (!session?.user) {
      console.log("[Content API] FAILED: No session or user");
      return NextResponse.json(
        { error: "לא מחובר - נא להתחבר מחדש", code: "NO_SESSION" },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      console.log("[Content API] FAILED: User ID missing from session");
      return NextResponse.json(
        { error: "חסר מזהה משתמש - נא להתחבר מחדש", code: "NO_USER_ID" },
        { status: 401 }
      );
    }

    if (!["ADMIN", "RAM"].includes(session.user.role)) {
      console.log("[Content API] FAILED: Insufficient role:", session.user.role);
      return NextResponse.json(
        { error: "אין הרשאה - נדרשת גישת מנהל", code: "INSUFFICIENT_ROLE" },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    console.log("[Content API] Parsing request body...");
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.log("[Content API] FAILED: Could not parse request body:", parseError);
      return NextResponse.json(
        { error: "שגיאה בפרסור הבקשה", code: "PARSE_ERROR" },
        { status: 400 }
      );
    }

    console.log("[Content API] Request body:", JSON.stringify(body, null, 2));
    const { type, title, description, content: contentText, videoUrl, imageUrl } = body;

    // Step 3: Validate required fields
    if (!type) {
      console.log("[Content API] FAILED: Missing type field");
      return NextResponse.json(
        { error: "חסר סוג תוכן", code: "MISSING_TYPE" },
        { status: 400 }
      );
    }

    if (!title || title.trim() === "") {
      console.log("[Content API] FAILED: Missing title field");
      return NextResponse.json(
        { error: "חסרה כותרת", code: "MISSING_TITLE" },
        { status: 400 }
      );
    }

    // Step 4: Create content in database
    console.log("[Content API] Creating content in database...", {
      type,
      title,
      videoUrl: videoUrl ? videoUrl.substring(0, 50) + "..." : null,
      createdById: session.user.id,
    });

    const newContent = await prisma.content.create({
      data: {
        type,
        title: title.trim(),
        description: description?.trim() || null,
        content: contentText?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        isPublished: true,
        createdById: session.user.id,
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Content API] SUCCESS: Content created in ${elapsed}ms`, {
      id: newContent.id,
      type: newContent.type,
      title: newContent.title,
    });

    return NextResponse.json({ content: newContent, success: true });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Content API] ERROR after ${elapsed}ms:`, error);
    console.error("[Content API] Error stack:", error instanceof Error ? error.stack : "No stack");

    // Check for specific Prisma errors
    const errorMessage = String(error);
    if (errorMessage.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "משתמש לא קיים במערכת - נא להתחבר מחדש", code: "FK_ERROR" },
        { status: 400 }
      );
    }

    if (errorMessage.includes("Invalid value for argument `type`")) {
      return NextResponse.json(
        { error: "סוג תוכן לא תקין", code: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "שגיאה ביצירת תוכן: " + errorMessage, code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

// PATCH - Update content
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, title, description, content: contentText, videoUrl, imageUrl } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        type,
        title,
        description,
        content: contentText,
        videoUrl,
        imageUrl,
      },
    });

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing content ID" }, { status: 400 });
    }

    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
