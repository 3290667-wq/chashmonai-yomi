import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://chashmonai-yomi.vercel.app"),
  title: "חשמונאי יומי",
  description: "אפליקציית לימוד לחיילי חטיבת חשמונאים",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "חשמונאי יומי",
  },
  openGraph: {
    title: "חשמונאי יומי",
    description: "אפליקציית לימוד לחיילי חטיבת חשמונאים - לעלות ולהתעלות",
    url: "https://chashmonai-yomi.vercel.app",
    siteName: "חשמונאי יומי",
    images: [
      {
        url: "https://chashmonai-yomi.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "חשמונאי יומי - רוח חשמונאית",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "חשמונאי יומי",
    description: "אפליקציית לימוד לחיילי חטיבת חשמונאים - לעלות ולהתעלות",
    images: ["https://chashmonai-yomi.vercel.app/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f0f9ff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
