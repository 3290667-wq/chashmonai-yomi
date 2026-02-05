"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Award,
  Clock,
  TrendingUp,
  Gift,
  Calendar,
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    activeToday: number;
    activeWeek: number;
  };
  points: {
    total: number;
    pendingRedemptions: number;
    pendingRedemptionsPoints: number;
  };
  learning: {
    today: { sessions: number; minutes: number; points: number };
    week: { sessions: number; minutes: number; points: number };
  };
  topLearners: {
    userId: string;
    name: string;
    platoon: string | null;
    totalMinutes: number;
    totalPoints: number;
  }[];
  usersByPlatoon: { platoon: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-muted">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דשבורד</h1>
        <p className="text-muted">סקירה כללית של המערכת</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Users className="mx-auto mb-2 text-primary" size={32} />
            <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
            <p className="text-sm text-muted">סה"כ משתמשים</p>
          </CardContent>
        </Card>

        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <TrendingUp className="mx-auto mb-2 text-green-500" size={32} />
            <p className="text-3xl font-bold">{stats?.users.activeToday || 0}</p>
            <p className="text-sm text-muted">פעילים היום</p>
          </CardContent>
        </Card>

        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Award className="mx-auto mb-2 text-secondary" size={32} />
            <p className="text-3xl font-bold">{stats?.points.total || 0}</p>
            <p className="text-sm text-muted">סה"כ נקודות</p>
          </CardContent>
        </Card>

        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Gift className="mx-auto mb-2 text-orange-500" size={32} />
            <p className="text-3xl font-bold">
              {stats?.points.pendingRedemptions || 0}
            </p>
            <p className="text-sm text-muted">ממתינים לאישור</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              לימוד היום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {stats?.learning.today.sessions || 0}
                </p>
                <p className="text-xs text-muted">סשנים</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {stats?.learning.today.minutes || 0}
                </p>
                <p className="text-xs text-muted">דקות</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-secondary">
                  {stats?.learning.today.points || 0}
                </p>
                <p className="text-xs text-muted">נקודות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              לימוד השבוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {stats?.learning.week.sessions || 0}
                </p>
                <p className="text-xs text-muted">סשנים</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {stats?.learning.week.minutes || 0}
                </p>
                <p className="text-xs text-muted">דקות</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-secondary">
                  {stats?.learning.week.points || 0}
                </p>
                <p className="text-xs text-muted">נקודות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Learners & Platoons */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>מובילי הלימוד השבוע</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topLearners.length === 0 ? (
              <p className="text-center text-muted py-4">אין נתונים עדיין</p>
            ) : (
              <div className="space-y-3">
                {stats?.topLearners.slice(0, 5).map((learner, index) => (
                  <div
                    key={learner.userId}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-amber-600"
                            : "bg-primary/50"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{learner.name}</p>
                        <p className="text-xs text-muted">
                          {learner.platoon || "ללא פלוגה"} •{" "}
                          {learner.totalMinutes} דקות
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-secondary">
                      {learner.totalPoints}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>משתמשים לפי פלוגה</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.usersByPlatoon.length === 0 ? (
              <p className="text-center text-muted py-4">אין נתונים עדיין</p>
            ) : (
              <div className="space-y-3">
                {stats?.usersByPlatoon.map((platoon) => (
                  <div
                    key={platoon.platoon}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <span className="font-medium">{platoon.platoon}</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {platoon.count} משתמשים
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Alert */}
      {stats?.points.pendingRedemptions ? (
        <Card variant="bordered" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Gift className="text-orange-500" size={24} />
              <div>
                <p className="font-medium">
                  יש {stats.points.pendingRedemptions} בקשות סליקה ממתינות
                </p>
                <p className="text-sm text-muted">
                  סה"כ {stats.points.pendingRedemptionsPoints} נקודות
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
