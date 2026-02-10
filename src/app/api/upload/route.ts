import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

// Configure route to handle large file uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for upload

// Increase body size limit for video uploads (100MB in bytes)
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

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

    // Validate file type - extended for mobile compatibility
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/3gpp",
      "video/3gpp2",
      "video/x-m4v",
      "video/mpeg",
      "video/ogg",
      "application/octet-stream", // Some mobile browsers send this
    ];

    // Also check by file extension for mobile compatibility
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".mp4", ".webm", ".mov", ".avi", ".m4v", ".3gp", ".3g2", ".mpeg", ".mpg", ".ogg"];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        { error: `סוג קובץ לא נתמך (${file.type || 'לא ידוע'}). יש להעלות קובץ וידאו` },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "הקובץ גדול מדי. גודל מקסימלי: 500MB" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob - token must be in environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[Upload API] BLOB_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        { error: "שגיאת הגדרות שרת - נא לפנות למנהל" },
        { status: 500 }
      );
    }

    // Ensure we have a valid content type for the upload
    const contentType = file.type || 'video/mp4';

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: contentType,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("[Upload API] Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      { error: "שגיאה בהעלאת הקובץ. נסה שוב." },
      { status: 500 }
    );
  }
}
