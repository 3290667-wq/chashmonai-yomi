import { NextRequest, NextResponse } from "next/server";
import { getZmanim } from "@/lib/hebcal";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "31.7683");
  const lng = parseFloat(searchParams.get("lng") || "35.2137");

  try {
    const zmanim = await getZmanim(lat, lng);
    return NextResponse.json(zmanim);
  } catch (error) {
    console.error("Error fetching zmanim:", error);
    return NextResponse.json(
      { error: "Failed to fetch zmanim" },
      { status: 500 }
    );
  }
}
