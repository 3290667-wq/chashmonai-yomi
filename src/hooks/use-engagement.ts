"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EngagementTracker, formatDuration, calculatePoints } from "@/lib/tracking";

interface UseEngagementOptions {
  contentType: string;
  contentId?: string;
  contentRef?: string;
  enabled?: boolean;
  paused?: boolean; // For pausing tracking (e.g., during video playback)
  autoSaveInterval?: number; // Auto-save interval in ms (default: 30000)
  onSessionEnd?: (data: {
    duration: number;
    verified: boolean;
    pointsEarned: number;
  }) => void;
  onAutoSave?: (data: {
    duration: number;
    pointsEarned: number;
  }) => void;
}

export function useEngagement(options: UseEngagementOptions) {
  const {
    contentType,
    contentId,
    contentRef,
    enabled = true,
    paused = false,
    autoSaveInterval = 30000,
    onSessionEnd,
    onAutoSave,
  } = options;
  const [isEngaged, setIsEngaged] = useState(false);
  const [duration, setDuration] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("0:00");
  const trackerRef = useRef<EngagementTracker | null>(null);
  const savedRef = useRef(false); // Track if session was already saved
  const lastAutoSaveDuration = useRef(0); // Track last auto-saved duration
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEngagementUpdate = useCallback((engaged: boolean, dur: number) => {
    // If paused, don't update the engagement state to engaged
    setIsEngaged(paused ? false : engaged);
    setDuration(dur);
    setFormattedDuration(formatDuration(dur));
  }, [paused]);

  // Function to save and stop the session
  const saveAndStopSession = useCallback(() => {
    if (trackerRef.current && !savedRef.current) {
      const result = trackerRef.current.stop();
      const pointsEarned = calculatePoints(result.duration, result.verified);

      console.log("[useEngagement] Saving session:", {
        contentType,
        duration: result.duration,
        durationMinutes: Math.floor(result.duration / 60000),
        verified: result.verified,
        pointsEarned,
      });

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

      savedRef.current = true;
    }
  }, [contentType, contentId, contentRef, onSessionEnd]);

  // Auto-save function (saves progress without stopping the tracker)
  const autoSave = useCallback(() => {
    if (!trackerRef.current || savedRef.current || paused) return;

    const currentDuration = duration;

    // Only save if we have new progress (at least 10 seconds since last save)
    if (currentDuration - lastAutoSaveDuration.current < 10000) {
      console.log("[useEngagement] Skipping auto-save, not enough new time");
      return;
    }

    const pointsEarned = calculatePoints(currentDuration, true);

    console.log("[useEngagement] Auto-saving progress:", {
      contentType,
      duration: currentDuration,
      durationMinutes: Math.floor(currentDuration / 60000),
      pointsEarned,
    });

    // Save to server
    saveSession({
      contentType,
      contentId,
      contentRef,
      duration: currentDuration,
      verified: true,
      pointsEarned,
      isAutoSave: true,
    });

    lastAutoSaveDuration.current = currentDuration;

    onAutoSave?.({
      duration: currentDuration,
      pointsEarned,
    });
  }, [contentType, contentId, contentRef, duration, paused, onAutoSave]);

  useEffect(() => {
    if (!enabled) {
      // If disabled, stop any existing tracker
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    savedRef.current = false;
    lastAutoSaveDuration.current = 0;
    trackerRef.current = new EngagementTracker(handleEngagementUpdate);
    trackerRef.current.start();
    console.log("[useEngagement] Started tracking for:", contentType);

    // Set up auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      autoSave();
    }, autoSaveInterval);

    // Save session when page becomes hidden (user switches tabs/apps)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && trackerRef.current && !savedRef.current) {
        console.log("[useEngagement] Page hidden, saving session...");
        saveAndStopSession();
      }
    };

    // Save session before page unloads
    const handleBeforeUnload = () => {
      if (trackerRef.current && !savedRef.current) {
        console.log("[useEngagement] Page unloading, saving session...");
        saveAndStopSession();
      }
    };

    // Save on page hide (works better on mobile)
    const handlePageHide = () => {
      if (trackerRef.current && !savedRef.current) {
        console.log("[useEngagement] Page hide event, saving session...");
        saveAndStopSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);

      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }

      // Final cleanup save
      saveAndStopSession();
    };
  }, [contentType, contentId, contentRef, enabled, autoSaveInterval, handleEngagementUpdate, saveAndStopSession, autoSave]);

  return {
    isEngaged,
    isPaused: paused,
    duration,
    formattedDuration,
    estimatedPoints: calculatePoints(duration, true),
    // Function to manually trigger a save
    forceSave: saveAndStopSession,
    // Function to trigger auto-save
    triggerAutoSave: autoSave,
  };
}

function saveSession(data: {
  contentType: string;
  contentId?: string;
  contentRef?: string;
  duration: number;
  verified: boolean;
  pointsEarned: number;
  isAutoSave?: boolean;
}) {
  const payload = JSON.stringify({
    ...data,
    isAutoSave: data.isAutoSave || false,
  });

  console.log("[saveSession] Attempting to save:", data);

  // For auto-saves, always use fetch (sendBeacon doesn't wait for response)
  if (data.isAutoSave) {
    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).then((res) => res.json()).then((result) => {
      console.log("[saveSession] Auto-save result:", result);
    }).catch((error) => {
      console.error("[saveSession] Auto-save failed:", error);
    });
    return;
  }

  // For final saves, try sendBeacon first (more reliable for page unload)
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon("/api/tracking", blob);
    if (sent) {
      console.log("[saveSession] Sent via sendBeacon successfully");
      return;
    }
    console.log("[saveSession] sendBeacon failed, falling back to fetch");
  }

  // Fallback to fetch with keepalive
  fetch("/api/tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true, // Allows request to outlive the page
  }).then(() => {
    console.log("[saveSession] Saved via fetch successfully");
  }).catch((error) => {
    console.error("[saveSession] Failed to save:", error);
  });
}

export default useEngagement;
