import { NextRequest, NextResponse } from "next/server";
import { getDailyMishnah, getDailyRambam } from "@/lib/sefaria";
import { prisma } from "@/lib/prisma";

// Disable caching to ensure fresh content
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const getAllVideos = searchParams.get("all") === "true";
  // Initialize response data
  let mishnah = null;
  let rambam = null;
  let adminContent: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    content: string | null;
    videoUrl: string | null;
    createdAt: Date;
  }> = [];

  // Try to fetch from Sefaria API (don't fail if this fails)
  try {
    const [mishnahResult, rambamResult] = await Promise.all([
      getDailyMishnah().catch((e) => {
        console.error("Error fetching Mishnah:", e);
        return null;
      }),
      getDailyRambam().catch((e) => {
        console.error("Error fetching Rambam:", e);
        return null;
      }),
    ]);

    if (mishnahResult) {
      mishnah = {
        ref: mishnahResult.ref,
        heRef: mishnahResult.text.heRef,
        text: Array.isArray(mishnahResult.text.he)
          ? mishnahResult.text.he
          : [mishnahResult.text.he],
      };
    }

    if (rambamResult) {
      rambam = {
        ref: rambamResult.ref,
        heRef: rambamResult.text.heRef,
        text: Array.isArray(rambamResult.text.he)
          ? rambamResult.text.he
          : [rambamResult.text.he],
      };
    }
  } catch (sefariaError) {
    console.error("Error fetching Sefaria content:", sefariaError);
    // Continue without Sefaria content
  }

  // Fetch admin-uploaded content from database
  let debugInfo: Record<string, unknown> = {};
  try {
    // First, let's see ALL content without any filters
    const allContentRaw = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
    });

    debugInfo.totalInDb = allContentRaw.length;
    debugInfo.allContentTypes = allContentRaw.map(c => ({ id: c.id, type: c.type, typeOf: typeof c.type, isPublished: c.isPublished, title: c.title }));

    console.log("[Daily API] Raw content from DB:", JSON.stringify(debugInfo.allContentTypes));

    // Filter for published content only - no type filter yet
    const publishedContent = allContentRaw.filter(c => c.isPublished === true);
    debugInfo.publishedCount = publishedContent.length;

    // Now filter by type using string comparison (more reliable)
    const validTypes = ["CHASSIDUT", "MUSAR", "THOUGHT", "VIDEO"];
    adminContent = publishedContent
      .filter(c => validTypes.includes(String(c.type)))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        type: c.type,
        title: c.title,
        description: c.description,
        content: c.content,
        videoUrl: c.videoUrl,
        createdAt: c.createdAt,
      }));

    debugInfo.afterTypeFilter = adminContent.length;
    console.log("[Daily API] Found", adminContent.length, "content items after filter");
  } catch (dbError) {
    console.error("Error fetching admin content:", dbError);
    debugInfo.error = String(dbError);
    // Continue with empty admin content
  }

  // Group content by type (using string comparison for reliability)
  const chassidut = adminContent.filter(c => String(c.type) === "CHASSIDUT");
  const musar = adminContent.filter(c => String(c.type) === "MUSAR");
  const thought = adminContent.filter(c => String(c.type) === "THOUGHT");
  const videos = adminContent.filter(c => String(c.type) === "VIDEO");

  console.log("[Daily API] Videos found:", videos.length);
  console.log("[Daily API] All types:", adminContent.map(c => String(c.type)));

  return NextResponse.json({
    mishnah,
    rambam,
    // Admin-uploaded content
    chassidut: chassidut.length > 0 ? chassidut[0] : null,
    musar: musar.length > 0 ? musar[0] : null,
    thought: thought.length > 0 ? thought[0] : null,
    dailyVideo: videos.length > 0 ? videos[0] : null,
    // All videos (when requested)
    allVideos: getAllVideos ? videos : undefined,
    // Debug info - full details
    _debug: {
      ...debugInfo,
      videosCount: videos.length,
      chassidutCount: chassidut.length,
      musarCount: musar.length,
      thoughtCount: thought.length,
      contentTypes: adminContent.map(c => String(c.type)),
    },
  });
}
