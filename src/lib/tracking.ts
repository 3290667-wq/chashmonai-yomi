import type { EngagementEvent } from "@/types";

const ENGAGEMENT_TIMEOUT = 30000; // 30 seconds without activity = not engaged
const MIN_SESSION_DURATION = 120000; // 2 minutes minimum for valid session
const POINTS_PER_5_MINUTES = 1;

export class EngagementTracker {
  private events: EngagementEvent[] = [];
  private isVisible: boolean = true;
  private lastActivityTime: number = Date.now();
  private startTime: number = Date.now();
  private onEngagementUpdate?: (engaged: boolean, duration: number) => void;
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor(onUpdate?: (engaged: boolean, duration: number) => void) {
    this.onEngagementUpdate = onUpdate;
  }

  start(): void {
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.events = [];
    this.setupListeners();
    this.startEngagementCheck();
  }

  stop(): { events: EngagementEvent[]; duration: number; verified: boolean } {
    this.removeListeners();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const duration = Date.now() - this.startTime;
    const verified = this.isSessionVerified(duration);

    return {
      events: this.events,
      duration,
      verified,
    };
  }

  private setupListeners(): void {
    if (typeof window === "undefined") return;

    document.addEventListener("visibilitychange", this.handleVisibility);
    document.addEventListener("mousemove", this.handleActivity);
    document.addEventListener("scroll", this.handleScroll);
    document.addEventListener("touchstart", this.handleActivity);
    document.addEventListener("keydown", this.handleActivity);
  }

  private removeListeners(): void {
    if (typeof window === "undefined") return;

    document.removeEventListener("visibilitychange", this.handleVisibility);
    document.removeEventListener("mousemove", this.handleActivity);
    document.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("touchstart", this.handleActivity);
    document.removeEventListener("keydown", this.handleActivity);
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
      const duration = this.getEngagedDuration();
      this.onEngagementUpdate?.(isEngaged, duration);
    }, 5000);
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
    // Must have minimum duration
    if (duration < MIN_SESSION_DURATION) return false;

    // Must have regular activity
    const activityEvents = this.events.filter(
      (e) => e.type === "mouse" || e.type === "scroll" || e.type === "touch"
    );

    // At least 1 activity event per minute
    const expectedEvents = Math.floor(duration / 60000);
    if (activityEvents.length < expectedEvents) return false;

    // Check for suspicious patterns (all events at same time)
    const eventTimes = activityEvents.map((e) => e.timestamp);
    const uniqueTimes = new Set(eventTimes.map((t) => Math.floor(t / 10000)));
    if (uniqueTimes.size < expectedEvents / 2) return false;

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
