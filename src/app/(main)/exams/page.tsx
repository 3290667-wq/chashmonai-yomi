"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  Star,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  pointsReward: number;
  questionsCount: number;
  userAttempt: {
    score: number;
    totalQuestions: number;
    pointsEarned: number;
    completedAt: string;
    attemptCount: number;
  } | null;
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchExams();
  }, [status, session, router]);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-sky-50 rounded-lg">
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-gold" />
            מבחנים
          </h1>
          <p className="text-sm text-slate-700">
            בחנו את עצמכם וצברו נקודות
          </p>
        </div>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-slate-700">טוען מבחנים...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="py-12 text-center">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 mb-2">עדיין אין מבחנים זמינים</p>
          <p className="text-slate-600 text-sm">מבחנים חדשים יפורסמו בקרוב</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const isCompleted = exam.userAttempt !== null;
            const isPerfect = isCompleted && exam.userAttempt!.score === exam.userAttempt!.totalQuestions;

            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className={`block bg-white border rounded-2xl p-5 transition-all hover:scale-[1.01] ${
                  isPerfect
                    ? "border-gold/30 bg-gradient-to-br from-gold/5 to-transparent"
                    : isCompleted
                    ? "border-emerald-500/30"
                    : "border-sky-200 hover:border-gold/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPerfect
                      ? "bg-gradient-to-br from-gold to-amber-600"
                      : isCompleted
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                      : "bg-gradient-to-br from-violet-500 to-violet-700"
                  }`}>
                    {isPerfect ? (
                      <Trophy className="w-7 h-7 text-white" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    ) : (
                      <ClipboardList className="w-7 h-7 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {/* Questions count */}
                      <span className="flex items-center gap-1 text-sm text-slate-700">
                        <AlertCircle className="w-4 h-4" />
                        {exam.questionsCount} שאלות
                      </span>

                      {/* Points */}
                      <span className="flex items-center gap-1 text-sm text-gold">
                        <Star className="w-4 h-4" />
                        {exam.pointsReward} נקודות
                      </span>

                      {/* Status */}
                      {isCompleted && (
                        <span className={`flex items-center gap-1 text-sm ${
                          isPerfect ? "text-gold" : "text-emerald-400"
                        }`}>
                          <Award className="w-4 h-4" />
                          {exam.userAttempt!.score}/{exam.userAttempt!.totalQuestions}
                          {exam.userAttempt!.attemptCount > 1 && (
                            <span className="text-slate-600 mr-1">
                              ({exam.userAttempt!.attemptCount} ניסיונות)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0 rotate-180" />
                </div>

                {/* Bottom info for completed exams */}
                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-sky-200 flex items-center justify-between">
                    <span className="text-slate-700 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      הושלם ב-{new Date(exam.userAttempt!.completedAt).toLocaleDateString("he-IL")}
                    </span>
                    <span className={`text-sm font-medium ${isPerfect ? "text-gold" : "text-emerald-400"}`}>
                      +{exam.userAttempt!.pointsEarned} נקודות
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
