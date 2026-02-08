import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type"); // Optional: filter by content type

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters", results: [] },
      { status: 400 }
    );
  }

  try {
    const searchQuery = query.trim();

    // Build where clause
    const where: Record<string, unknown> = {
      isPublished: true,
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ],
    };

    // Add type filter if specified
    if (type && type !== "ALL") {
      where.type = type;
    }

    const results = await prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      query: searchQuery,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", results: [] },
      { status: 500 }
    );
  }
}
