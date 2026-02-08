"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EngagementTracker, formatDuration, calculatePoints } from "@/lib/tracking";

interface UseEngagementOptions {
  contentType: string;
  contentId?: string;
  contentRef?: string;
  enabled?: boolean;
  onSessionEnd?: (data: {
    duration: number;
    verified: boolean;
    pointsEarned: number;
  }) => void;
}

export function useEngagement(options: UseEngagementOptions) {
  const { contentType, contentId, contentRef, enabled = true, onSessionEnd } = options;
  const [isEngaged, setIsEngaged] = useState(false);
  const [duration, setDuration] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("0:00");
  const trackerRef = useRef<EngagementTracker | null>(null);

  const handleEngagementUpdate = useCallback((engaged: boolean, dur: number) => {
    setIsEngaged(engaged);
    setDuration(dur);
    setFormattedDuration(formatDuration(dur));
  }, []);

  useEffect(() => {
    if (!enabled) {
      // If disabled, stop any existing tracker
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      return;
    }

    trackerRef.current = new EngagementTracker(handleEngagementUpdate);
    trackerRef.current.start();

    return () => {
      if (trackerRef.current) {
        const result = trackerRef.current.stop();
        const pointsEarned = calculatePoints(result.duration, result.verified);

        onSessionEnd?.({
          duration: result.duration,
          verified: result.verified,
          pointsEarned,
        });

        // Save session to server
        saveSession({
          contentType,
          contentId,
          contentRef,
          duration: result.duration,
          verified: result.verified,
          pointsEarned,
        });
      }
    };
  }, [contentType, contentId, contentRef, enabled, handleEngagementUpdate, onSessionEnd]);

  return {
    isEngaged,
    duration,
    formattedDuration,
    estimatedPoints: calculatePoints(duration, true),
  };
}

async function saveSession(data: {
  contentType: string;
  contentId?: string;
  contentRef?: string;
  duration: number;
  verified: boolean;
  pointsEarned: number;
}) {
  try {
    await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

export default useEngagement;
