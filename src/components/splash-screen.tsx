"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-logo ${
        isFading ? "animate-fade-out" : ""
      }`}
    >
      <div className="animate-scale-in flex flex-col items-center">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-6 animate-pulse-slow">
          <Image
            src="/רוח חשמונאית.png"
            alt="רוח חשמונאית"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-brown-dark mb-2 text-center">
          חשמונאי יומי
        </h1>

        <p className="text-brown-medium text-lg sm:text-xl">
          לעלות ולהתעלות
        </p>

        <div className="mt-8 flex gap-1">
          <div className="w-2 h-2 bg-brown-medium rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-brown-medium rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-brown-medium rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
