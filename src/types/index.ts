import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      platoon?: string | null;
      points: number;
      streak: number;
    };
  }
}

export interface ZmanimData {
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
  tzeit: string;
}

export interface SefariaCalendarItem {
  title: {
    en: string;
    he: string;
  };
  displayValue: {
    en: string;
    he: string;
  };
  url: string;
  ref: string;
  order: number;
  category: string;
}

export interface SefariaText {
  ref: string;
  heRef: string;
  text: string | string[];
  he: string | string[];
  sectionNames: string[];
}

export interface EngagementEvent {
  type: "mouse" | "scroll" | "touch" | "visibility";
  timestamp: number;
}

export interface LearningSessionData {
  contentType: string;
  contentId?: string;
  contentRef?: string;
  startTime: Date;
  events: EngagementEvent[];
}
