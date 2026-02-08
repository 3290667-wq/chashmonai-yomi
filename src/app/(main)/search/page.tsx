"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Video,
  BookOpen,
  Sparkles,
  Heart,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  createdAt: string;
}

const CONTENT_TYPES = [
  { value: "ALL", label: "הכל", icon: Search },
  { value: "VIDEO", label: "סרטונים", icon: Video },
  { value: "CHASSIDUT", label: "חסידות", icon: Sparkles },
  { value: "MUSAR", label: "מוסר", icon: Heart },
  { value: "THOUGHT", label: "מחשבה", icon: BookOpen },
  { value: "ARTICLE", label: "מאמרים", icon: FileText },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState("ALL");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, type: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(type !== "ALL" && { type }),
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, selectedType);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedType, performSearch]);

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, selectedType);
    }
  }, []);

  const getTypeInfo = (type: string) => {
    return CONTENT_TYPES.find((t) => t.value === type) || CONTENT_TYPES[0];
  };

  const getContentUrl = (result: SearchResult) => {
    switch (result.type) {
      case "VIDEO":
        return "/boost";
      case "CHASSIDUT":
      case "MUSAR":
      case "THOUGHT":
        return "/daily";
      default:
        return "/daily";
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-cream rounded-lg">
          <ChevronRight className="w-5 h-5 text-brown-medium" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">חיפוש</h1>
          <p className="text-sm text-brown-light">חפש תכנים באתר</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="הקלד לחיפוש..."
          autoFocus
          className="w-full pr-12 pl-12 py-4 bg-white border border-cream-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-medium text-brown-dark placeholder:text-brown-light/50 text-lg"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-cream rounded-full"
          >
            <X className="w-5 h-5 text-brown-light" />
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-brown-medium text-cream"
                  : "bg-cream text-brown-dark hover:bg-cream-dark/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-sky-dark animate-spin" />
            <p className="text-brown-light">מחפש...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-16 h-16 text-cream-dark mx-auto mb-4" />
            <h3 className="font-bold text-brown-dark text-lg mb-2">לא נמצאו תוצאות</h3>
            <p className="text-brown-light">
              נסה לחפש עם מילות מפתח אחרות
            </p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-brown-light">
              נמצאו {results.length} תוצאות
            </p>
            <div className="space-y-3">
              {results.map((result) => {
                const typeInfo = getTypeInfo(result.type);
                const Icon = typeInfo.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => router.push(getContentUrl(result))}
                    className="w-full bg-white rounded-2xl border border-cream-dark/50 p-4 text-right hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-brown-dark">{result.title}</h3>
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs">
                            {typeInfo.label}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-brown-light text-sm mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <p className="text-xs text-brown-light/70 mt-2">
                          {new Date(result.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-brown-light rotate-180 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <Search className="w-16 h-16 text-cream-dark mx-auto mb-4" />
            <h3 className="font-bold text-brown-dark text-lg mb-2">חפש תכנים</h3>
            <p className="text-brown-light">
              הקלד לפחות 2 תווים כדי להתחיל לחפש
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
