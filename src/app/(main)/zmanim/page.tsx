"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Sun, Sunrise, Sunset, Moon } from "lucide-react";
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
  color: string;
}

const ZMANIM_LIST: ZmanItem[] = [
  { key: "alotHaShachar", label: "עלות השחר", icon: Moon, color: "text-indigo-500" },
  { key: "misheyakir", label: "משיכיר", icon: Moon, color: "text-indigo-400" },
  { key: "sunrise", label: "הנץ החמה", icon: Sunrise, color: "text-orange-500" },
  { key: "sofZmanShma", label: "סוף זמן ק\"ש", icon: Sun, color: "text-yellow-500" },
  { key: "sofZmanTfilla", label: "סוף זמן תפילה", icon: Sun, color: "text-yellow-600" },
  { key: "chatzot", label: "חצות היום", icon: Sun, color: "text-orange-600" },
  { key: "minchaGedola", label: "מנחה גדולה", icon: Sun, color: "text-orange-500" },
  { key: "minchaKetana", label: "מנחה קטנה", icon: Sun, color: "text-orange-400" },
  { key: "plagHaMincha", label: "פלג המנחה", icon: Sunset, color: "text-pink-500" },
  { key: "sunset", label: "שקיעה", icon: Sunset, color: "text-red-500" },
  { key: "tzeit", label: "צאת הכוכבים", icon: Moon, color: "text-purple-500" },
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
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">זמני היום</h1>
        <p className="text-white/80 mb-4">{formatDate()}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={24} />
            <span className="text-3xl font-mono font-bold">
              {formatCurrentTime()}
            </span>
          </div>

          {nextZman && (
            <div className="text-left">
              <p className="text-sm text-white/70">הזמן הבא</p>
              <p className="font-bold">
                {nextZman.label} - {nextZman.time}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Location Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <MapPin size={18} className="text-muted flex-shrink-0" />
        {LOCATIONS.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedLocation.id === location.id
                ? "bg-primary text-white"
                : "bg-card border border-card-border text-foreground hover:border-primary"
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>

      {/* Zmanim List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun size={20} className="text-secondary" />
            זמני היום ל{selectedLocation.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted">טוען זמנים...</div>
          ) : zmanim ? (
            <div className="divide-y divide-card-border">
              {ZMANIM_LIST.map((item) => {
                const Icon = item.icon;
                const time = zmanim[item.key];
                const passed = isZmanPassed(time);

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between py-4 ${
                      passed ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={item.color} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-lg ${
                        passed ? "text-muted line-through" : "text-foreground"
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              לא ניתן לטעון את הזמנים
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
