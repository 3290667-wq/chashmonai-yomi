import type { SefariaCalendarItem, SefariaText } from "@/types";

const SEFARIA_API_URL = "https://www.sefaria.org/api";

interface SefariaCalendarResponse {
  calendar_items: SefariaCalendarItem[];
  date: string;
}

export async function getDailyCalendar(): Promise<SefariaCalendarItem[]> {
  const response = await fetch(`${SEFARIA_API_URL}/calendars`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Sefaria calendar");
  }

  const data: SefariaCalendarResponse = await response.json();
  return data.calendar_items;
}

export async function getText(ref: string): Promise<SefariaText> {
  const encodedRef = encodeURIComponent(ref);
  const response = await fetch(`${SEFARIA_API_URL}/texts/${encodedRef}?context=0`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch text: ${ref}`);
  }

  return response.json();
}

export async function getDailyMishnah(): Promise<{ ref: string; text: SefariaText } | null> {
  const calendar = await getDailyCalendar();
  const mishnah = calendar.find(
    (item) => item.title.en === "Daily Mishnah" || item.category === "Mishnah"
  );

  if (!mishnah) return null;

  const text = await getText(mishnah.ref);
  return { ref: mishnah.ref, text };
}

export async function getDailyRambam(): Promise<{ ref: string; text: SefariaText } | null> {
  const calendar = await getDailyCalendar();
  const rambam = calendar.find(
    (item) =>
      item.title.en.includes("Rambam") ||
      item.title.en.includes("Daily Mitzvah") ||
      item.category === "Halakhah"
  );

  if (!rambam) return null;

  const text = await getText(rambam.ref);
  return { ref: rambam.ref, text };
}

export function formatSefariaText(text: string | string[]): string {
  if (Array.isArray(text)) {
    return text.map((t, i) => `<p class="mb-2"><span class="text-muted text-sm">(${i + 1})</span> ${t}</p>`).join("");
  }
  return text;
}
