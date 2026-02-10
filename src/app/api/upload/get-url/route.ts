import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      console.log("[Upload get-url] Unauthorized:", session?.user?.role);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Upload get-url] User:", session.user.id, "Role:", session.user.role);

    const body = (await request.json()) as HandleUploadBody;
    console.log("[Upload get-url] Request body type:", body.type);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log("[Upload get-url] onBeforeGenerateToken:", pathname);

        // Validate file type - extended for mobile compatibility
        const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".m4v", ".3gp", ".3g2", ".mpeg", ".mpg", ".ogg"];
        const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        const ext = pathname.substring(pathname.lastIndexOf(".")).toLowerCase();

        const isVideo = videoExtensions.includes(ext);
        const isImage = imageExtensions.includes(ext);

        console.log("[Upload get-url] Extension:", ext, "isVideo:", isVideo, "isImage:", isImage);

        if (!isVideo && !isImage) {
          console.log("[Upload get-url] Invalid file type");
          throw new Error(`סוג קובץ לא נתמך (${ext}). יש להעלות קובץ וידאו או תמונה`);
        }

        const allowedContentTypes = isImage
          ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
          : [
              "video/mp4",
              "video/webm",
              "video/quicktime",
              "video/x-msvideo",
              "video/3gpp",
              "video/3gpp2",
              "video/x-m4v",
              "video/mpeg",
              "video/ogg",
              "application/octet-stream",
            ];

        const maxSize = isImage ? 5 * 1024 * 1024 : 500 * 1024 * 1024; // 5MB for images, 500MB for videos

        return {
          allowedContentTypes,
          maximumSizeInBytes: maxSize,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload completed:", blob.url);
        console.log("Token payload:", tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
