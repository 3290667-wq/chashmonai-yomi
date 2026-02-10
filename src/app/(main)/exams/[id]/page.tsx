"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  Star,
  Loader2,
  AlertCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  pointsReward: number;
  questions: Question[];
}

interface Result {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

interface AttemptResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
}

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchExam();
  }, [status, session, id]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/exams/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExam(data.exam);
      } else {
        router.push("/exams");
      }
    } catch (error) {
      console.error("Failed to fetch exam:", error);
      router.push("/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (results) return; // Don't allow changes after submission
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    // Check all questions are answered
    const unanswered = exam.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`יש לענות על כל השאלות. חסרות ${unanswered.length} תשובות.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: id, answers }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setAttemptResult(data.attempt);
      } else {
        const error = await res.json();
        alert(error.error || "שגיאה בשליחת המבחן");
      }
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("שגיאה בשליחת המבחן");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResults(null);
    setAttemptResult(null);
    setCurrentQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-white/50">טוען מבחן...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
        <p className="text-white/50">מבחן לא נמצא</p>
      </div>
    );
  }

  // Results view
  if (results && attemptResult) {
    const isPerfect = attemptResult.score === attemptResult.totalQuestions;

    return (
      <div className="py-4 sm:py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/exams")} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
          <h1 className="text-2xl font-bold text-white">תוצאות המבחן</h1>
        </div>

        {/* Score Card */}
        <div className={`p-6 rounded-2xl border text-center ${
          isPerfect
            ? "bg-gradient-to-br from-gold/20 to-amber-900/20 border-gold/30"
            : attemptResult.percentage >= 70
            ? "bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-emerald-500/30"
            : "bg-gradient-to-br from-orange-500/20 to-orange-900/20 border-orange-500/30"
        }`}>
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isPerfect
              ? "bg-gold"
              : attemptResult.percentage >= 70
              ? "bg-emerald-500"
              : "bg-orange-500"
          }`}>
            {isPerfect ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Award className="w-10 h-10 text-white" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {attemptResult.score} / {attemptResult.totalQuestions}
          </h2>
          <p className={`text-lg font-medium ${
            isPerfect ? "text-gold" : attemptResult.percentage >= 70 ? "text-emerald-400" : "text-orange-400"
          }`}>
            {attemptResult.percentage}% נכון
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-gold">
            <Star className="w-5 h-5" />
            <span className="text-lg font-bold">+{attemptResult.pointsEarned} נקודות</span>
          </div>

          {isPerfect && (
            <p className="text-gold mt-4 font-medium">מושלם! קיבלת את מלוא הנקודות!</p>
          )}
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">סקירת תשובות</h3>

          {exam.questions.map((question, index) => {
            const result = results.find((r) => r.questionId === question.id);
            const isCorrect = result?.correct;
            const options = [
              { key: "A", value: question.optionA },
              { key: "B", value: question.optionB },
              { key: "C", value: question.optionC },
              { key: "D", value: question.optionD },
            ];

            return (
              <div
                key={question.id}
                className={`p-4 rounded-xl border ${
                  isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-white/50 text-sm">שאלה {index + 1}</span>
                    <p className="text-white font-medium">{question.questionText}</p>
                  </div>
                </div>

                <div className="grid gap-2 mr-8">
                  {options.map((option) => {
                    const isUserAnswer = result?.userAnswer === option.key;
                    const isCorrectAnswer = result?.correctAnswer === option.key;

                    return (
                      <div
                        key={option.key}
                        className={`p-3 rounded-lg text-sm ${
                          isCorrectAnswer
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isUserAnswer && !isCorrect
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-white/5 text-white/60"
                        }`}
                      >
                        <span className="font-bold ml-2">{option.key}.</span>
                        {option.value}
                        {isCorrectAnswer && <span className="mr-2">✓</span>}
                        {isUserAnswer && !isCorrect && <span className="mr-2">✗</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/exams")}
            className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
          >
            חזרה לרשימה
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Exam taking view
  const currentQuestion = exam.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/exams")} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{exam.title}</h1>
            <p className="text-sm text-white/60">
              {answeredCount} / {totalQuestions} תשובות
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gold text-sm">
          <Star className="w-4 h-4" />
          {exam.pointsReward} נקודות
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exam.questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
              index === currentQuestionIndex
                ? "bg-gold text-[#1a140f]"
                : answers[q.id]
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-5">
        <div className="mb-4">
          <span className="text-gold text-sm font-medium">שאלה {currentQuestionIndex + 1} מתוך {totalQuestions}</span>
          <h2 className="text-lg font-bold text-white mt-2">{currentQuestion.questionText}</h2>
        </div>

        <div className="space-y-3">
          {[
            { key: "A", value: currentQuestion.optionA },
            { key: "B", value: currentQuestion.optionB },
            { key: "C", value: currentQuestion.optionC },
            { key: "D", value: currentQuestion.optionD },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
              className={`w-full p-4 rounded-xl text-right transition-all ${
                answers[currentQuestion.id] === option.key
                  ? "bg-gold/20 border-2 border-gold text-white"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <span className="font-bold ml-3">{option.key}.</span>
              {option.value}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          הקודם
        </button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            הבא
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQuestions}
            className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                סיים ושלח
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
