"use client";

import { ReactNode } from "react";
import { FadeInView, StaggerChildren, StaggerItem, ScaleInView } from "@/components/animations";

export function DashboardAnimations({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function HeroAnimation({ children }: { children: ReactNode }) {
  return (
    <FadeInView direction="down" duration={0.6}>
      {children}
    </FadeInView>
  );
}

export function QuickLinksAnimation({ children }: { children: ReactNode }) {
  return (
    <StaggerChildren staggerDelay={0.1}>
      {children}
    </StaggerChildren>
  );
}

export function QuickLinkItem({ children }: { children: ReactNode }) {
  return (
    <StaggerItem>
      {children}
    </StaggerItem>
  );
}

export function StatsAnimation({ children }: { children: ReactNode }) {
  return (
    <FadeInView direction="up" delay={0.2}>
      {children}
    </FadeInView>
  );
}

export function StatItem({ children, index }: { children: ReactNode; index: number }) {
  return (
    <ScaleInView delay={0.1 * index}>
      {children}
    </ScaleInView>
  );
}

export function SectionAnimation({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <FadeInView direction="up" delay={delay}>
      {children}
    </FadeInView>
  );
}

export function MotivationAnimation({ children }: { children: ReactNode }) {
  return (
    <FadeInView direction="none" delay={0.4}>
      {children}
    </FadeInView>
  );
}
