"use client";

import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText, Construction } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול תכנים</h1>
        <p className="text-muted">הוספה ועריכת מאמרים וסרטונים</p>
      </div>

      <Card variant="bordered">
        <CardContent className="py-12">
          <div className="text-center">
            <Construction size={64} className="mx-auto mb-4 text-muted" />
            <h2 className="text-xl font-bold mb-2">בקרוב...</h2>
            <p className="text-muted max-w-md mx-auto">
              דף ניהול התכנים בפיתוח. כאן תוכל להוסיף מאמרים, סרטונים ותכנים
              נוספים לחיילים.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <FileText className="text-blue-500" size={24} />
            </div>
            <h3 className="font-bold mb-1">מאמרים</h3>
            <p className="text-sm text-muted">
              הוספת מאמרי תורה וחסידות
            </p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <FileText className="text-green-500" size={24} />
            </div>
            <h3 className="font-bold mb-1">שיעורי וידאו</h3>
            <p className="text-sm text-muted">
              קישור לשיעורים מיוטיוב
            </p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              <FileText className="text-purple-500" size={24} />
            </div>
            <h3 className="font-bold mb-1">חסידות ומוסר</h3>
            <p className="text-sm text-muted">
              תכנים יומיים מותאמים
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
