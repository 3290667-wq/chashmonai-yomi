"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Sun, Sunrise, Sunset, Moon, ChevronLeft, Check } from "lucide-react";
import type { ZmanimData } from "@/types";

const LOCATIONS = [
  { id: "jerusalem", name: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { id: "telAviv", name: "תל אביב", lat: 32.0853, lng: 34.7818 },
  { id: "haifa", name: "חיפה", lat: 32.794, lng: 34.9896 },
  { id: "beerSheva", name: "באר שבע", lat: 31.2518, lng: 34.7913 },
  { id: "eilat", name: "אילת", lat: 29.5577, lng: 34.9519 },
];

interface ZmanItem {
  key: keyof ZmanimData;
  label: string;
  icon: typeof Sun;
  gradient: string;
  bgColor: string;
}

const ZMANIM_LIST: ZmanItem[] = [
  { key: "alotHaShachar", label: "עלות השחר", icon: Moon, gradient: "from-indigo-400 to-indigo-600", bgColor: "bg-indigo-50" },
  { key: "misheyakir", label: "משיכיר", icon: Moon, gradient: "from-indigo-300 to-indigo-500", bgColor: "bg-indigo-50" },
  { key: "sunrise", label: "הנץ החמה", icon: Sunrise, gradient: "from-orange-400 to-rose-500", bgColor: "bg-orange-50" },
  { key: "sofZmanShma", label: "סוף זמן ק\"ש", icon: Sun, gradient: "from-amber-400 to-amber-600", bgColor: "bg-amber-50" },
  { key: "sofZmanTfilla", label: "סוף זמן תפילה", icon: Sun, gradient: "from-amber-500 to-orange-600", bgColor: "bg-amber-50" },
  { key: "chatzot", label: "חצות היום", icon: Sun, gradient: "from-yellow-400 to-orange-500", bgColor: "bg-yellow-50" },
  { key: "minchaGedola", label: "מנחה גדולה", icon: Sun, gradient: "from-orange-400 to-orange-600", bgColor: "bg-orange-50" },
  { key: "minchaKetana", label: "מנחה קטנה", icon: Sun, gradient: "from-orange-500 to-rose-500", bgColor: "bg-orange-50" },
  { key: "plagHaMincha", label: "פלג המנחה", icon: Sunset, gradient: "from-rose-400 to-pink-600", bgColor: "bg-rose-50" },
  { key: "sunset", label: "שקיעה", icon: Sunset, gradient: "from-rose-500 to-red-600", bgColor: "bg-rose-50" },
  { key: "tzeit", label: "צאת הכוכבים", icon: Moon, gradient: "from-purple-500 to-violet-700", bgColor: "bg-purple-50" },
];

export default function ZmanimPage() {
  const [zmanim, setZmanim] = useState<ZmanimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
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
      <div className="bg-gradient-to-l from-brown-dark to-brown-medium rounded-2xl p-5 sm:p-6 text-cream relative overflow-hidden">
        {/* Decorative sun */}
        <div className="absolute left-4 top-4 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5" />
            <h1 className="text-2xl font-bold">זמני היום</h1>
          </div>
          <p className="text-cream/70 text-sm mb-4">{formatDate()}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Current Time */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-3xl font-mono font-bold tracking-wider">
                {formatCurrentTime()}
              </span>
            </div>

            {/* Next Zman */}
            {nextZman && (
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-cream/70 text-xs mb-1">הזמן הבא</p>
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-amber-300" />
                  <span className="font-bold">{nextZman.label}</span>
                  <span className="font-mono text-amber-200">{nextZman.time}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-brown-light" />
          <span className="text-sm text-brown-medium font-medium">בחר מיקום</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedLocation.id === location.id
                  ? "bg-brown-medium text-cream shadow-md"
                  : "bg-cream/70 text-brown-dark hover:bg-cream-dark/50 border border-cream-dark/30"
              }`}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      {/* Zmanim List */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-dark/30">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-brown-dark text-lg">
              זמני היום ל{selectedLocation.name}
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
              <p className="text-brown-light">טוען זמנים...</p>
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
                        ? "bg-sky-light/50 border-2 border-sky-medium shadow-sm"
                        : passed
                          ? "bg-cream/30 opacity-60"
                          : "bg-cream/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm ${passed ? "opacity-50" : ""}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className={`font-medium ${passed ? "text-brown-light" : "text-brown-dark"}`}>
                          {item.label}
                        </span>
                        {isNext && (
                          <span className="block text-xs text-sky-dark font-medium">
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
                            ? "text-brown-light line-through"
                            : isNext
                              ? "text-sky-dark"
                              : "text-brown-dark"
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
              <Sun className="w-16 h-16 text-cream-dark mx-auto mb-3" />
              <p className="text-brown-light">לא ניתן לטעון את הזמנים</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-l from-sky-light/50 to-sky-medium/50 rounded-2xl p-4 text-center">
        <p className="text-brown-dark text-sm">
          הזמנים מחושבים לפי מיקום גאוגרפי ותאריך עברי
        </p>
      </div>
    </div>
  );
}
