import { NextResponse } from "next/server";
import { getDailyMishnah, getDailyRambam } from "@/lib/sefaria";

export async function GET() {
  try {
    const [mishnah, rambam] = await Promise.all([
      getDailyMishnah(),
      getDailyRambam(),
    ]);

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
    });
  } catch (error) {
    console.error("Error fetching daily content:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily content" },
      { status: 500 }
    );
  }
}
