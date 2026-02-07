import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Blob storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        {
          error: "שירות האחסון לא מוגדר. יש להשתמש בקישור YouTube/Vimeo במקום.",
          details: "Blob storage not configured"
        },
        { status: 503 }
      );
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
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Check for specific Blob errors
    if (errorMessage.includes("BLOB_READ_WRITE_TOKEN") || errorMessage.includes("token")) {
      return NextResponse.json(
        { error: "שירות האחסון לא מוגדר. יש להשתמש בקישור YouTube/Vimeo במקום." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "שגיאה בהעלאת הקובץ. נסה שוב או השתמש בקישור YouTube." },
      { status: 500 }
    );
  }
}
