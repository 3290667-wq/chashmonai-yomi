"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  ChevronRight,
  Shield,
  Users,
  Plus,
  X,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  platoon: string | null;
}

interface Platoon {
  id: string;
  name: string;
}

interface PlatoonAssignment {
  platoon: string;
  platoonId: string | null;
  ram: User | null;
  userCount: number;
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<PlatoonAssignment[]>([]);
  const [availableRams, setAvailableRams] = useState<User[]>([]);
  const [allPlatoons, setAllPlatoons] = useState<Platoon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddPlatoonModal, setShowAddPlatoonModal] = useState(false);
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [newPlatoonName, setNewPlatoonName] = useState("");
  const [addingPlatoon, setAddingPlatoon] = useState(false);
  const [platoonError, setPlatoonError] = useState("");
  const [deletingPlatoon, setDeletingPlatoon] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [status, isAdmin, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users and platoons in parallel
      const [usersRes, platoonsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/platoons"),
      ]);

      if (usersRes.ok && platoonsRes.ok) {
        const usersData = await usersRes.json();
        const platoonsData = await platoonsRes.json();

        const users: User[] = usersData.users;
        const platoonsList: Platoon[] = platoonsData.platoons || [];

        setAllPlatoons(platoonsList);

        // Get RAMs (assigned and available)
        const rams = users.filter((u: User) => u.role === "RAM");

        // Build assignments list from the Platoon model
        const assignmentsList: PlatoonAssignment[] = platoonsList.map((platoon: Platoon) => {
          const ram = rams.find((r: User) => r.platoon === platoon.name) || null;
          const userCount = users.filter((u: User) => u.platoon === platoon.name).length;
          return { platoon: platoon.name, platoonId: platoon.id, ram, userCount };
        });

        // Available RAMs (not assigned to any platoon)
        const available = rams.filter((r: User) => !r.platoon);

        setAssignments(assignmentsList);
        setAvailableRams(available);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRam = async (ramId: string, platoon: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ramId, platoon }),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setSelectedPlatoon("");
      }
    } catch (error) {
      console.error("Failed to assign RAM:", error);
    }
  };

  const handleRemoveRam = async (ramId: string) => {
    if (!confirm("האם אתה בטוח שברצונך להסיר את הר״מ מהפלוגה?")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ramId, platoon: "" }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to remove RAM:", error);
    }
  };

  const handleAddPlatoon = async () => {
    if (!newPlatoonName.trim()) {
      setPlatoonError("יש להזין שם פלוגה");
      return;
    }

    setAddingPlatoon(true);
    setPlatoonError("");

    try {
      const res = await fetch("/api/admin/platoons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlatoonName.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewPlatoonName("");
        setShowAddPlatoonModal(false);
        fetchData();
      } else {
        setPlatoonError(data.error || "שגיאה בהוספת פלוגה");
      }
    } catch (error) {
      console.error("Failed to add platoon:", error);
      setPlatoonError("שגיאה בהוספת פלוגה");
    } finally {
      setAddingPlatoon(false);
    }
  };

  const handleDeletePlatoon = async (platoonId: string, platoonName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את פלוגה "${platoonName}"?`)) return;

    setDeletingPlatoon(platoonId);

    try {
      const res = await fetch(`/api/admin/platoons?id=${platoonId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        fetchData();
      } else {
        alert(data.error || "שגיאה במחיקת פלוגה");
      }
    } catch (error) {
      console.error("Failed to delete platoon:", error);
      alert("שגיאה במחיקת פלוגה");
    } finally {
      setDeletingPlatoon(null);
    }
  };



  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg">
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">שיוך ר״מים לפלוגות</h1>
          <p className="text-sm text-white/60">
            ניהול הקצאת רבנים לפלוגות
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {assignments.filter((a) => a.ram).length}
          </p>
          <p className="text-sm text-white/60">פלוגות עם ר״מ</p>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {availableRams.length}
          </p>
          <p className="text-sm text-white/60">ר״מים זמינים</p>
        </div>
      </div>

      {/* Platoons List */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-white/60" />
            <h2 className="font-bold text-white">פלוגות ושיוכים</h2>
          </div>
          <button
            onClick={() => setShowAddPlatoonModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gold/20 text-gold rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            הוסף פלוגה
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-white/50">טוען נתונים...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">אין פלוגות רשומות במערכת</p>
            <p className="text-white/40 text-sm mt-1">
              פלוגות נוצרות כאשר משתמשים נרשמים
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {assignments.map((assignment) => (
              <div key={assignment.platoon} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#1a140f]" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{assignment.platoon}</p>
                      <p className="text-sm text-white/60">
                        {assignment.userCount} חיילים
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assignment.ram ? (
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">
                            {assignment.ram.name}
                          </p>
                          <p className="text-xs text-white/50">ר״מ משויך</p>
                        </div>
                        <button
                          onClick={() => handleRemoveRam(assignment.ram!.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPlatoon(assignment.platoon);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        שייך ר״מ
                      </button>
                    )}
                    {assignment.userCount === 0 && assignment.platoonId && (
                      <button
                        onClick={() => handleDeletePlatoon(assignment.platoonId!, assignment.platoon)}
                        disabled={deletingPlatoon === assignment.platoonId}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingPlatoon === assignment.platoonId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available RAMs */}
      {availableRams.length > 0 && (
        <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10">
            <h2 className="font-bold text-white">ר״מים ללא שיוך</h2>
            <p className="text-sm text-white/60">ר״מים שעדיין לא משויכים לפלוגה</p>
          </div>

          <div className="divide-y divide-white/10">
            {availableRams.map((ram) => (
              <div key={ram.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                    <span className="text-violet-400 font-bold">
                      {ram.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{ram.name}</p>
                    <p className="text-xs text-white/50">{ram.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                  ממתין לשיוך
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign RAM Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              שיוך ר״מ לפלוגה
            </h3>
            <p className="text-white/60 text-sm mb-4">
              פלוגה: <span className="font-bold text-white">{selectedPlatoon}</span>
            </p>

            {availableRams.length === 0 ? (
              <div className="py-8 text-center">
                <UserCog className="w-12 h-12 text-white/20 mx-auto mb-2" />
                <p className="text-white/50">אין ר״מים זמינים לשיוך</p>
                <p className="text-white/40 text-sm mt-1">
                  יש ליצור משתמש עם תפקיד ר״מ קודם
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableRams.map((ram) => (
                  <button
                    key={ram.id}
                    onClick={() => handleAssignRam(ram.id, selectedPlatoon)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                        <span className="text-violet-400 font-bold">
                          {ram.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{ram.name}</p>
                        <p className="text-xs text-white/50">{ram.email}</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-emerald-500" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedPlatoon("");
              }}
              className="w-full mt-4 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      {/* Add Platoon Modal */}
      {showAddPlatoonModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              הוספת פלוגה חדשה
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  שם הפלוגה
                </label>
                <input
                  type="text"
                  value={newPlatoonName}
                  onChange={(e) => {
                    setNewPlatoonName(e.target.value);
                    setPlatoonError("");
                  }}
                  placeholder="לדוגמה: פלוגה א'"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              {platoonError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{platoonError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPlatoonModal(false);
                  setNewPlatoonName("");
                  setPlatoonError("");
                }}
                className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleAddPlatoon}
                disabled={addingPlatoon}
                className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingPlatoon ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מוסיף...
                  </>
                ) : (
                  "הוסף פלוגה"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
