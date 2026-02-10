"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  Users,
  Star,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ExamQuestion {
  id?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  pointsReward: number;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    name: string | null;
  };
  questions: ExamQuestion[];
  _count: {
    attempts: number;
  };
}

const emptyQuestion: ExamQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
};

export default function AdminExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointsReward: 10,
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([{ ...emptyQuestion }]);

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin && !isRam) {
      router.push("/dashboard");
      return;
    }
    fetchExams();
  }, [status, isAdmin, isRam, router]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD) {
        alert(`שאלה ${i + 1}: יש למלא את כל השדות`);
        setSaving(false);
        return;
      }
    }

    try {
      const method = editingExam ? "PATCH" : "POST";
      const body = editingExam
        ? { ...formData, id: editingExam.id, questions }
        : { ...formData, questions };

      console.log("[Exams] Sending:", JSON.stringify(body, null, 2));

      const res = await fetch("/api/admin/exams", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "שגיאה בקריאת התשובה מהשרת" };
      }

      console.log("[Exams] Response:", res.status, data);

      if (res.ok && data.success) {
        fetchExams();
        closeModal();
      } else {
        alert(data.error || `שגיאה בשמירת המבחן (${res.status})`);
      }
    } catch (error) {
      console.error("Failed to save exam:", error);
      alert("שגיאה בשמירת המבחן - בדוק את החיבור לאינטרנט");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מבחן זה?")) return;

    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchExams();
      }
    } catch (error) {
      console.error("Failed to delete exam:", error);
    }
  };

  const toggleExamActive = async (exam: Exam) => {
    try {
      const res = await fetch("/api/admin/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exam.id,
          isActive: !exam.isActive,
        }),
      });

      if (res.ok) {
        fetchExams();
      }
    } catch (error) {
      console.error("Failed to toggle exam:", error);
    }
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || "",
      pointsReward: exam.pointsReward,
    });
    setQuestions(exam.questions.length > 0 ? exam.questions : [{ ...emptyQuestion }]);
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      description: "",
      pointsReward: 10,
    });
    setQuestions([{ ...emptyQuestion }]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setFormData({ title: "", description: "", pointsReward: 10 });
    setQuestions([{ ...emptyQuestion }]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof ExamQuestion, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">ניהול מבחנים</h1>
            <p className="text-sm text-white/60">יצירה וניהול מבחנים</p>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">מבחן חדש</span>
        </button>
      </div>

      {/* Exams List */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gold" />
          <h2 className="font-bold text-white">מבחנים קיימים</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-white/50">טוען מבחנים...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="w-16 h-16 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-4">עדיין לא נוצרו מבחנים</p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-gold/20 text-gold rounded-xl font-medium hover:bg-gold/30 transition-colors"
            >
              צור מבחן ראשון
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {exams.map((exam) => (
              <div key={exam.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    exam.isActive ? "bg-emerald-500/20" : "bg-white/10"
                  }`}>
                    <ClipboardList className={`w-6 h-6 ${exam.isActive ? "text-emerald-400" : "text-white/40"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{exam.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        exam.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/10 text-white/40"
                      }`}>
                        {exam.isActive ? "פעיל" : "לא פעיל"}
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-1">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50 flex-wrap">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {exam.questions.length} שאלות
                      </span>
                      <span className="flex items-center gap-1 text-gold">
                        <Star className="w-3 h-3" />
                        {exam.pointsReward} נקודות
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {exam._count.attempts} ניסיונות
                      </span>
                      <span>
                        {new Date(exam.createdAt).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExamActive(exam)}
                      className={`p-2 rounded-lg transition-colors ${
                        exam.isActive
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-white/40 hover:bg-white/5"
                      }`}
                      title={exam.isActive ? "הפוך ללא פעיל" : "הפעל"}
                    >
                      {exam.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-[100] p-4 pb-24 sm:pb-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-2xl p-6 my-8">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingExam ? "עריכת מבחן" : "יצירת מבחן חדש"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    כותרת המבחן *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="לדוגמה: מבחן משנה יומית - שבת"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    תיאור
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="תיאור קצר של המבחן"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    נקודות לזכייה
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pointsReward}
                    onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    נקודות מלאות ניתנות רק על תוצאה מושלמת. תוצאות חלקיות מזכות ב-50% יחסי.
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">שאלות</h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-sm text-gold hover:text-gold-light"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף שאלה
                  </button>
                </div>

                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-medium">שאלה {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          הסר
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                      placeholder="טקסט השאלה"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-gold/50"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(["A", "B", "C", "D"] as const).map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestion(qIndex, "correctAnswer", option)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
                              question.correctAnswer === option
                                ? "bg-emerald-500 text-white"
                                : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                          >
                            {option}
                          </button>
                          <input
                            type="text"
                            value={question[`option${option}` as keyof ExamQuestion] as string}
                            onChange={(e) => updateQuestion(qIndex, `option${option}` as keyof ExamQuestion, e.target.value)}
                            placeholder={`תשובה ${option}`}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-gold/50 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-white/40 text-xs">לחץ על האות כדי לסמן את התשובה הנכונה</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    editingExam ? "שמור" : "צור מבחן"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
