"use client";

import { ReactNode } from "react";
import { SmoothScrollProvider } from "./smooth-scroll";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SmoothScrollProvider>
      {children}
    </SmoothScrollProvider>
  );
}
