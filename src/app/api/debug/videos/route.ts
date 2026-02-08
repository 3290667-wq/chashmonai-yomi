import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all content
    const allContent = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        videoUrl: true,
        isPublished: true,
        createdAt: true,
      },
    });

    // Get only videos
    const videos = await prisma.content.findMany({
      where: {
        type: "VIDEO",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        videoUrl: true,
        isPublished: true,
        createdAt: true,
      },
    });

    // Get published videos only
    const publishedVideos = await prisma.content.findMany({
      where: {
        type: "VIDEO",
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        videoUrl: true,
        isPublished: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalContent: allContent.length,
      allContent,
      totalVideos: videos.length,
      videos,
      totalPublishedVideos: publishedVideos.length,
      publishedVideos,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
