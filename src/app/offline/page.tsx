"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
          <WifiOff size={48} className="text-muted" />
        </div>

        <h1 className="text-2xl font-bold mb-2">אין חיבור לאינטרנט</h1>

        <p className="text-muted mb-6">
          נראה שאתה לא מחובר לאינטרנט. בדוק את החיבור שלך ונסה שוב.
        </p>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw size={18} className="ml-2" />
            נסה שוב
          </Button>

          <div className="text-sm text-muted">
            <p>בינתיים, תוכל:</p>
            <ul className="mt-2 space-y-1">
              <li>לבדוק את הגדרות ה-WiFi</li>
              <li>לוודא שיש לך חיבור סלולרי</li>
              <li>לחכות לחיבור יציב</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-card-border">
          <p className="text-xs text-muted">
            חשמונאי יומי - אפליקציית לימוד לחיילי חטיבת חשמונאים
          </p>
        </div>
      </div>
    </div>
  );
}
