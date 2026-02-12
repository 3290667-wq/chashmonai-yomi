"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Sun, Sunrise, Sunset, Moon, ChevronLeft, Check } from "lucide-react";
import type { ZmanimData } from "@/types";

const LOCATION_CATEGORIES = [
  {
    name: "ערים מרכזיות",
    locations: [
      { id: "jerusalem", name: "ירושלים", lat: 31.7683, lng: 35.2137 },
      { id: "telAviv", name: "תל אביב", lat: 32.0853, lng: 34.7818 },
      { id: "haifa", name: "חיפה", lat: 32.794, lng: 34.9896 },
      { id: "beerSheva", name: "באר שבע", lat: 31.2518, lng: 34.7913 },
      { id: "eilat", name: "אילת", lat: 29.5577, lng: 34.9519 },
    ],
  },
  {
    name: "אזור עזה",
    locations: [
      { id: "gaza", name: "עזה", lat: 31.5, lng: 34.47 },
      { id: "rafah", name: "רפיח", lat: 31.2969, lng: 34.2458 },
      { id: "khanYunis", name: "חאן יונס", lat: 31.3462, lng: 34.3032 },
      { id: "sderot", name: "שדרות", lat: 31.5247, lng: 34.5961 },
      { id: "ashkelon", name: "אשקלון", lat: 31.6658, lng: 34.5664 },
    ],
  },
  {
    name: "יהודה ושומרון",
    locations: [
      { id: "jenin", name: "ג'נין", lat: 32.4607, lng: 35.3004 },
      { id: "nablus", name: "שכם", lat: 32.2211, lng: 35.2544 },
      { id: "ramallah", name: "רמאללה", lat: 31.9038, lng: 35.2034 },
      { id: "hebron", name: "חברון", lat: 31.5326, lng: 35.0998 },
    ],
  },
  {
    name: "הצפון",
    locations: [
      { id: "golanHeights", name: "רמת הגולן", lat: 33.0, lng: 35.75 },
      { id: "metula", name: "מטולה", lat: 33.2778, lng: 35.5778 },
      { id: "kiryatShmona", name: "קריית שמונה", lat: 33.2075, lng: 35.5697 },
    ],
  },
];

// Flatten for initial selection
const ALL_LOCATIONS = LOCATION_CATEGORIES.flatMap(cat => cat.locations);

interface ZmanItem {
  key: keyof ZmanimData;
  label: string;
  icon: typeof Sun;
  gradient: string;
}

const ZMANIM_LIST: ZmanItem[] = [
  { key: "alotHaShachar", label: "עלות השחר", icon: Moon, gradient: "from-indigo-400 to-indigo-600" },
  { key: "misheyakir", label: "משיכיר", icon: Moon, gradient: "from-indigo-300 to-indigo-500" },
  { key: "sunrise", label: "הנץ החמה", icon: Sunrise, gradient: "from-orange-400 to-rose-500" },
  { key: "sofZmanShma", label: "סוף זמן ק\"ש", icon: Sun, gradient: "from-amber-400 to-amber-600" },
  { key: "sofZmanTfilla", label: "סוף זמן תפילה", icon: Sun, gradient: "from-amber-500 to-orange-600" },
  { key: "chatzot", label: "חצות היום", icon: Sun, gradient: "from-yellow-400 to-orange-500" },
  { key: "minchaGedola", label: "מנחה גדולה", icon: Sun, gradient: "from-orange-400 to-orange-600" },
  { key: "minchaKetana", label: "מנחה קטנה", icon: Sun, gradient: "from-orange-500 to-rose-500" },
  { key: "plagHaMincha", label: "פלג המנחה", icon: Sunset, gradient: "from-rose-400 to-pink-600" },
  { key: "sunset", label: "שקיעה", icon: Sunset, gradient: "from-rose-500 to-red-600" },
  { key: "tzeit", label: "צאת הכוכבים", icon: Moon, gradient: "from-purple-500 to-violet-700" },
];

export default function ZmanimPage() {
  const [zmanim, setZmanim] = useState<ZmanimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(ALL_LOCATIONS[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchZmanim();
  }, [selectedLocation]);

  const fetchZmanim = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/zmanim?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`
      );
      const data = await res.json();
      setZmanim(data);
    } catch (error) {
      console.error("Failed to fetch zmanim:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const isZmanPassed = (zmanTime: string) => {
    if (!zmanTime || zmanTime === "--:--") return false;
    const [hours, minutes] = zmanTime.split(":").map(Number);
    const zmanDate = new Date();
    zmanDate.setHours(hours, minutes, 0);
    return currentTime > zmanDate;
  };

  const getNextZman = () => {
    if (!zmanim) return null;

    for (const item of ZMANIM_LIST) {
      const time = zmanim[item.key];
      if (!isZmanPassed(time)) {
        return { ...item, time };
      }
    }
    return null;
  };

  const nextZman = getNextZman();

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-l from-gold-dark to-gold rounded-2xl p-5 sm:p-6 text-slate-900 relative overflow-hidden">
        {/* Decorative sun */}
        <div className="absolute left-4 top-4 w-20 h-20 bg-sky-200 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5" />
            <h1 className="text-2xl font-bold">זמני היום</h1>
          </div>
          <p className="text-slate-600 text-sm mb-4">{formatDate()}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Current Time */}
            <div className="bg-sky-50/20 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-3xl font-mono font-bold tracking-wider">
                {formatCurrentTime()}
              </span>
            </div>

            {/* Next Zman */}
            {nextZman && (
              <div className="bg-sky-50/20 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-slate-600 text-xs mb-1">הזמן הבא</p>
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-bold">{nextZman.label}</span>
                  <span className="font-mono">{nextZman.time}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-2xl border border-sky-200 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold" />
          <span className="text-sm text-slate-600 font-medium">בחר מיקום</span>
        </div>

        {LOCATION_CATEGORIES.map((category) => (
          <div key={category.name}>
            <p className="text-xs text-slate-700 font-medium mb-2">{category.name}</p>
            <div className="flex flex-wrap gap-2">
              {category.locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedLocation.id === location.id
                      ? "bg-gold text-slate-900 shadow-md"
                      : "bg-sky-50 text-slate-700 hover:bg-sky-100 border border-sky-200"
                  }`}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Zmanim List */}
      <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-800 text-lg">
              זמני היום ל{selectedLocation.name}
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-slate-700">טוען זמנים...</p>
            </div>
          ) : zmanim ? (
            <div className="space-y-2">
              {ZMANIM_LIST.map((item) => {
                const Icon = item.icon;
                const time = zmanim[item.key];
                const passed = isZmanPassed(time);
                const isNext = nextZman?.key === item.key;

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all ${
                      isNext
                        ? "bg-gold/20 border-2 border-gold/50 shadow-sm"
                        : passed
                          ? "bg-sky-50 opacity-60"
                          : "bg-sky-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm ${passed ? "opacity-50" : ""}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className={`font-medium ${passed ? "text-slate-700" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                        {isNext && (
                          <span className="block text-xs text-gold font-medium">
                            הזמן הבא
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {passed && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                      <span
                        className={`font-mono text-lg font-bold ${
                          passed
                            ? "text-slate-600 line-through"
                            : isNext
                              ? "text-gold-dark"
                              : "text-slate-800"
                        }`}
                      >
                        {time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sun className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700">לא ניתן לטעון את הזמנים</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 text-center">
        <p className="text-slate-600 text-sm">
          הזמנים מחושבים לפי מיקום גאוגרפי ותאריך עברי
        </p>
      </div>
    </div>
  );
}
