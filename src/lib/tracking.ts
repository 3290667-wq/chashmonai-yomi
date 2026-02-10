import type { EngagementEvent } from "@/types";

const ENGAGEMENT_TIMEOUT = 30000; // 30 seconds without activity = not engaged
const MIN_SESSION_DURATION = 60000; // 1 minute minimum for valid session (reduced from 2)
const POINTS_PER_5_MINUTES = 1;

export class EngagementTracker {
  private events: EngagementEvent[] = [];
  private isVisible: boolean = true;
  private lastActivityTime: number = Date.now();
  private startTime: number = Date.now();
  private onEngagementUpdate?: (engaged: boolean, duration: number) => void;
  private checkInterval?: ReturnType<typeof setInterval>;

  // Track actual engaged time (pauses when not engaged)
  private engagedStartTime: number = Date.now();
  private totalEngagedTime: number = 0;
  private wasEngaged: boolean = true;

  constructor(onUpdate?: (engaged: boolean, duration: number) => void) {
    this.onEngagementUpdate = onUpdate;
  }

  start(): void {
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.engagedStartTime = Date.now();
    this.totalEngagedTime = 0;
    this.wasEngaged = true;
    this.events = [];
    this.setupListeners();
    this.startEngagementCheck();
  }

  stop(): { events: EngagementEvent[]; duration: number; verified: boolean } {
    this.removeListeners();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Calculate final engaged duration
    const engagedDuration = this.getActiveEngagedDuration();
    const verified = this.isSessionVerified(engagedDuration);

    console.log("[Tracker] Stopped. Total engaged time:", Math.floor(engagedDuration / 1000), "s, Verified:", verified);

    return {
      events: this.events,
      duration: engagedDuration, // Return engaged duration, not total time
      verified,
    };
  }

  private setupListeners(): void {
    if (typeof window === "undefined") return;

    document.addEventListener("visibilitychange", this.handleVisibility);
    document.addEventListener("mousemove", this.handleActivity);
    document.addEventListener("scroll", this.handleScroll);
    document.addEventListener("touchstart", this.handleTouch, { passive: true });
    document.addEventListener("touchmove", this.handleTouch, { passive: true });
    document.addEventListener("keydown", this.handleActivity);
    document.addEventListener("click", this.handleActivity);
  }

  private removeListeners(): void {
    if (typeof window === "undefined") return;

    document.removeEventListener("visibilitychange", this.handleVisibility);
    document.removeEventListener("mousemove", this.handleActivity);
    document.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("touchstart", this.handleTouch);
    document.removeEventListener("touchmove", this.handleTouch);
    document.removeEventListener("keydown", this.handleActivity);
    document.removeEventListener("click", this.handleActivity);
  }

  private handleVisibility = (): void => {
    this.isVisible = document.visibilityState === "visible";
    this.recordEvent("visibility");

    if (!this.isVisible) {
      this.onEngagementUpdate?.(false, this.getEngagedDuration());
    }
  };

  private handleActivity = (): void => {
    this.lastActivityTime = Date.now();
    this.recordEvent("mouse");
  };

  private handleTouch = (): void => {
    this.lastActivityTime = Date.now();
    this.recordEvent("touch");
  };

  private handleScroll = (): void => {
    this.lastActivityTime = Date.now();
    this.recordEvent("scroll");
  };

  private recordEvent(type: EngagementEvent["type"]): void {
    const now = Date.now();
    const lastEvent = this.events[this.events.length - 1];

    // Debounce events (max 1 per second per type)
    if (lastEvent && lastEvent.type === type && now - lastEvent.timestamp < 1000) {
      return;
    }

    this.events.push({ type, timestamp: now });
  }

  private startEngagementCheck(): void {
    this.checkInterval = setInterval(() => {
      const isEngaged = this.isCurrentlyEngaged();

      // Track engaged time: when engagement state changes
      if (isEngaged !== this.wasEngaged) {
        if (isEngaged) {
          // Just became engaged - start timing
          this.engagedStartTime = Date.now();
          console.log("[Tracker] Resumed - was paused for", Date.now() - this.engagedStartTime, "ms");
        } else {
          // Just became disengaged - add elapsed time to total
          this.totalEngagedTime += Date.now() - this.engagedStartTime;
          console.log("[Tracker] Paused - total engaged time:", Math.floor(this.totalEngagedTime / 1000), "s");
        }
        this.wasEngaged = isEngaged;
      }

      const duration = this.getActiveEngagedDuration();
      this.onEngagementUpdate?.(isEngaged, duration);
    }, 1000); // Check every second for smoother timer
  }

  // Get the actual engaged duration (pauses when not engaged)
  private getActiveEngagedDuration(): number {
    if (this.wasEngaged && this.isCurrentlyEngaged()) {
      // Currently engaged - add current session time
      return this.totalEngagedTime + (Date.now() - this.engagedStartTime);
    }
    // Not engaged - return only the accumulated time
    return this.totalEngagedTime;
  }

  private isCurrentlyEngaged(): boolean {
    if (!this.isVisible) return false;
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    return timeSinceLastActivity < ENGAGEMENT_TIMEOUT;
  }

  private getEngagedDuration(): number {
    let engagedTime = 0;
    let lastEngagedStart = this.startTime;
    let wasEngaged = true;

    for (const event of this.events) {
      if (event.type === "visibility") {
        if (!wasEngaged) {
          // Was not engaged, now checking visibility
          lastEngagedStart = event.timestamp;
        } else {
          // Was engaged, now losing visibility
          engagedTime += event.timestamp - lastEngagedStart;
        }
        wasEngaged = !wasEngaged;
      }
    }

    // Add remaining time if still engaged
    if (wasEngaged && this.isCurrentlyEngaged()) {
      engagedTime += Date.now() - lastEngagedStart;
    }

    return engagedTime;
  }

  private isSessionVerified(duration: number): boolean {
    // Must have minimum duration (1 minute)
    if (duration < MIN_SESSION_DURATION) {
      console.log("[Tracking] Session too short:", duration, "ms (min:", MIN_SESSION_DURATION, ")");
      return false;
    }

    // Must have at least some activity
    const activityEvents = this.events.filter(
      (e) => e.type === "mouse" || e.type === "scroll" || e.type === "touch"
    );

    // At least 1 activity event for the whole session (very lenient)
    // This allows reading without constantly moving
    if (activityEvents.length < 1) {
      console.log("[Tracking] No activity events recorded");
      return false;
    }

    // For sessions longer than 5 minutes, require at least 1 event per 2 minutes
    const durationMinutes = duration / 60000;
    if (durationMinutes > 5) {
      const minEvents = Math.floor(durationMinutes / 2);
      if (activityEvents.length < minEvents) {
        console.log("[Tracking] Not enough activity for long session:", activityEvents.length, "events, need", minEvents);
        return false;
      }
    }

    console.log("[Tracking] Session verified! Duration:", Math.floor(durationMinutes), "min, Events:", activityEvents.length);
    return true;
  }
}

export function calculatePoints(durationMs: number, verified: boolean): number {
  if (!verified) return 0;

  const minutes = Math.floor(durationMs / 60000);
  const fiveMinuteBlocks = Math.floor(minutes / 5);

  return fiveMinuteBlocks * POINTS_PER_5_MINUTES;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
