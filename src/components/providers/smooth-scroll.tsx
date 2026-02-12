"use client";

import { useEffect, useRef, createContext, useContext, ReactNode } from "react";
import Lenis from "@studio-freight/lenis";

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check if mobile device
    const isMobile = window.innerWidth < 1024;

    // Initialize Lenis with fast scrolling (almost instant)
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 0.3, // Much faster on desktop
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // Faster easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1 : 1.5, // Faster wheel on desktop
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
