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
    latitude: latitude.toString(),
    longitude: longitude.toString(),
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
    timeZone: "Asia/Jerusalem",
  });
}

export const ISRAEL_LOCATIONS = {
  // ערים מרכזיות
  jerusalem: { lat: 31.7683, lng: 35.2137, name: "ירושלים" },
  telAviv: { lat: 32.0853, lng: 34.7818, name: "תל אביב" },
  haifa: { lat: 32.7940, lng: 34.9896, name: "חיפה" },
  beerSheva: { lat: 31.2518, lng: 34.7913, name: "באר שבע" },
  eilat: { lat: 29.5577, lng: 34.9519, name: "אילת" },
  // אזורי שירות צבאי
  gaza: { lat: 31.5, lng: 34.47, name: "עזה" },
  rafah: { lat: 31.2969, lng: 34.2458, name: "רפיח" },
  khanYunis: { lat: 31.3462, lng: 34.3032, name: "חאן יונס" },
  jenin: { lat: 32.4607, lng: 35.3004, name: "ג'נין" },
  nablus: { lat: 32.2211, lng: 35.2544, name: "שכם" },
  ramallah: { lat: 31.9038, lng: 35.2034, name: "רמאללה" },
  hebron: { lat: 31.5326, lng: 35.0998, name: "חברון" },
  golanHeights: { lat: 33.0, lng: 35.75, name: "רמת הגולן" },
  metula: { lat: 33.2778, lng: 35.5778, name: "מטולה" },
  kiryatShmona: { lat: 33.2075, lng: 35.5697, name: "קריית שמונה" },
  sderot: { lat: 31.5247, lng: 34.5961, name: "שדרות" },
  ashdod: { lat: 31.8044, lng: 34.6553, name: "אשדוד" },
  ashkelon: { lat: 31.6658, lng: 34.5664, name: "אשקלון" },
} as const;
