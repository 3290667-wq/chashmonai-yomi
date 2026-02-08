import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "סוג קובץ לא נתמך. יש להעלות קובץ וידאו (MP4, WebM, MOV, AVI)" },
        { status: 400 }
      );
    }

    // Validate file size (max 300MB)
    const maxSize = 300 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "הקובץ גדול מדי. גודל מקסימלי: 300MB" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    // Token from environment or fallback to direct value
    const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_chsdfTY4A2gxjY0U_U58DBpPokTkoUX12ujUld5tz4Qi01D";
    console.log("Token source:", process.env.BLOB_READ_WRITE_TOKEN ? "env" : "fallback");

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      token: token,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");

    return NextResponse.json(
      { error: `שגיאה בהעלאת הקובץ: ${errorMessage}` },
      { status: 500 }
    );
  }
}
