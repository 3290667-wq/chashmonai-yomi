import { NextResponse } from "next/server";
import { getDailyMishnah, getDailyRambam } from "@/lib/sefaria";
import { prisma } from "@/lib/prisma";

// Disable caching to ensure fresh content
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch from Sefaria API
    const [mishnah, rambam] = await Promise.all([
      getDailyMishnah(),
      getDailyRambam(),
    ]);

    // Fetch admin-uploaded content from database
    const adminContent = await prisma.content.findMany({
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

    // Group content by type
    const chassidut = adminContent.filter(c => c.type === "CHASSIDUT");
    const musar = adminContent.filter(c => c.type === "MUSAR");
    const thought = adminContent.filter(c => c.type === "THOUGHT");
    const videos = adminContent.filter(c => c.type === "VIDEO");

    return NextResponse.json({
      mishnah: mishnah
        ? {
            ref: mishnah.ref,
            heRef: mishnah.text.heRef,
            text: Array.isArray(mishnah.text.he)
              ? mishnah.text.he
              : [mishnah.text.he],
          }
        : null,
      rambam: rambam
        ? {
            ref: rambam.ref,
            heRef: rambam.text.heRef,
            text: Array.isArray(rambam.text.he)
              ? rambam.text.he
              : [rambam.text.he],
          }
        : null,
      // Admin-uploaded content
      chassidut: chassidut.length > 0 ? chassidut[0] : null,
      musar: musar.length > 0 ? musar[0] : null,
      thought: thought.length > 0 ? thought[0] : null,
      dailyVideo: videos.length > 0 ? videos[0] : null,
    });
  } catch (error) {
    console.error("Error fetching daily content:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily content" },
      { status: 500 }
    );
  }
}
