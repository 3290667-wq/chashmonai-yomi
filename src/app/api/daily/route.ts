import { NextResponse } from "next/server";
import { getDailyMishnah, getDailyRambam } from "@/lib/sefaria";
import { prisma } from "@/lib/prisma";

// Disable caching to ensure fresh content
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
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
  try {
    // First, let's see ALL content without filters
    const allContent = await prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        isPublished: true,
      },
    });
    console.log("[Daily API] All content in DB:", JSON.stringify(allContent));

    adminContent = await prisma.content.findMany({
      where: {
        isPublished: true,
        type: {
          in: ["CHASSIDUT", "MUSAR", "THOUGHT", "VIDEO"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        content: true,
        videoUrl: true,
        createdAt: true,
      },
    });
    console.log("[Daily API] Found", adminContent.length, "content items after filter");
    console.log("[Daily API] Content:", JSON.stringify(adminContent));
  } catch (dbError) {
    console.error("Error fetching admin content:", dbError);
    console.error("DB Error details:", dbError);
    // Continue with empty admin content
  }

  // Group content by type
  const chassidut = adminContent.filter(c => c.type === "CHASSIDUT");
  const musar = adminContent.filter(c => c.type === "MUSAR");
  const thought = adminContent.filter(c => c.type === "THOUGHT");
  const videos = adminContent.filter(c => c.type === "VIDEO");

  console.log("[Daily API] Videos found:", videos.length);

  return NextResponse.json({
    mishnah,
    rambam,
    // Admin-uploaded content
    chassidut: chassidut.length > 0 ? chassidut[0] : null,
    musar: musar.length > 0 ? musar[0] : null,
    thought: thought.length > 0 ? thought[0] : null,
    dailyVideo: videos.length > 0 ? videos[0] : null,
  });
}
