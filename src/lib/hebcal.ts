import type { ZmanimData } from "@/types";

const HEBCAL_API_URL = "https://www.hebcal.com/zmanim";

interface HebcalZmanimResponse {
  times: {
    alotHaShachar: string;
    misheyakir: string;
    sunrise: string;
    sofZmanShma: string;
    sofZmanTfilla: string;
    chatzot: string;
    minchaGedola: string;
    minchaKetana: string;
    plagHaMincha: string;
    sunset: string;
    tzeit7083deg: string;
  };
}

export async function getZmanim(
  latitude: number,
  longitude: number,
  tzid: string = "Asia/Jerusalem"
): Promise<ZmanimData> {
  const params = new URLSearchParams({
    cfg: "json",
    lat: latitude.toString(),
    lng: longitude.toString(),
    tzid,
  });

  const response = await fetch(`${HEBCAL_API_URL}?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch zmanim");
  }

  const data: HebcalZmanimResponse = await response.json();

  return {
    alotHaShachar: formatTime(data.times.alotHaShachar),
    misheyakir: formatTime(data.times.misheyakir),
    sunrise: formatTime(data.times.sunrise),
    sofZmanShma: formatTime(data.times.sofZmanShma),
    sofZmanTfilla: formatTime(data.times.sofZmanTfilla),
    chatzot: formatTime(data.times.chatzot),
    minchaGedola: formatTime(data.times.minchaGedola),
    minchaKetana: formatTime(data.times.minchaKetana),
    plagHaMincha: formatTime(data.times.plagHaMincha),
    sunset: formatTime(data.times.sunset),
    tzeit: formatTime(data.times.tzeit7083deg),
  };
}

function formatTime(isoTime: string): string {
  if (!isoTime) return "--:--";
  const date = new Date(isoTime);
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const ISRAEL_LOCATIONS = {
  jerusalem: { lat: 31.7683, lng: 35.2137, name: "ירושלים" },
  telAviv: { lat: 32.0853, lng: 34.7818, name: "תל אביב" },
  haifa: { lat: 32.7940, lng: 34.9896, name: "חיפה" },
  beerSheva: { lat: 31.2518, lng: 34.7913, name: "באר שבע" },
  eilat: { lat: 29.5577, lng: 34.9519, name: "אילת" },
} as const;
