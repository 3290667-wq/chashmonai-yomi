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
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  platoon: string | null;
}

interface PlatoonAssignment {
  platoon: string;
  ram: User | null;
  userCount: number;
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<PlatoonAssignment[]>([]);
  const [availableRams, setAvailableRams] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [newPlatoon, setNewPlatoon] = useState("");

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
      // Fetch users
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const users: User[] = data.users;
        const platoons: string[] = data.platoons;

        // Get RAMs (assigned and available)
        const rams = users.filter((u: User) => u.role === "RAM");
        const assignedRamPlatoons = new Set(rams.map((r: User) => r.platoon).filter(Boolean));

        // Build assignments list
        const assignmentsList: PlatoonAssignment[] = platoons.map((platoon: string) => {
          const ram = rams.find((r: User) => r.platoon === platoon) || null;
          const userCount = users.filter((u: User) => u.platoon === platoon).length;
          return { platoon, ram, userCount };
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

  const handleCreatePlatoon = async () => {
    if (!newPlatoon.trim()) return;

    // Create a dummy user with this platoon to register it
    // Or we can update an existing user
    // For now, we'll just refresh - platoons are created when users register
    setNewPlatoon("");
    alert("פלוגות נוצרות אוטומטית כאשר משתמשים נרשמים עם שם פלוגה");
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-cream rounded-lg">
          <ChevronRight className="w-5 h-5 text-brown-medium" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">שיוך ר״מים לפלוגות</h1>
          <p className="text-sm text-brown-light">
            ניהול הקצאת רבנים לפלוגות
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-brown-dark">
            {assignments.filter((a) => a.ram).length}
          </p>
          <p className="text-sm text-brown-light">פלוגות עם ר״מ</p>
        </div>
        <div className="bg-sky-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-brown-dark">
            {availableRams.length}
          </p>
          <p className="text-sm text-brown-light">ר״מים זמינים</p>
        </div>
      </div>

      {/* Platoons List */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-dark/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-brown-medium" />
            <h2 className="font-bold text-brown-dark">פלוגות ושיוכים</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
            <p className="text-brown-light">טוען נתונים...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-cream-dark mx-auto mb-3" />
            <p className="text-brown-light">אין פלוגות רשומות במערכת</p>
            <p className="text-brown-light text-sm mt-1">
              פלוגות נוצרות כאשר משתמשים נרשמים
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cream-dark/30">
            {assignments.map((assignment) => (
              <div key={assignment.platoon} className="p-4 hover:bg-cream/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-medium to-sky-dark rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-brown-dark">{assignment.platoon}</p>
                      <p className="text-sm text-brown-light">
                        {assignment.userCount} חיילים
                      </p>
                    </div>
                  </div>

                  {assignment.ram ? (
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-sm font-medium text-brown-dark">
                          {assignment.ram.name}
                        </p>
                        <p className="text-xs text-brown-light">ר״מ משויך</p>
                      </div>
                      <button
                        onClick={() => handleRemoveRam(assignment.ram!.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                      className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      שייך ר״מ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available RAMs */}
      {availableRams.length > 0 && (
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-cream-dark/30">
            <h2 className="font-bold text-brown-dark">ר״מים ללא שיוך</h2>
            <p className="text-sm text-brown-light">ר״מים שעדיין לא משויכים לפלוגה</p>
          </div>

          <div className="divide-y divide-cream-dark/30">
            {availableRams.map((ram) => (
              <div key={ram.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <span className="text-violet-700 font-bold">
                      {ram.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-brown-dark">{ram.name}</p>
                    <p className="text-xs text-brown-light">{ram.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                  ממתין לשיוך
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign RAM Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-brown-dark mb-2">
              שיוך ר״מ לפלוגה
            </h3>
            <p className="text-brown-light text-sm mb-4">
              פלוגה: <span className="font-bold text-brown-dark">{selectedPlatoon}</span>
            </p>

            {availableRams.length === 0 ? (
              <div className="py-8 text-center">
                <UserCog className="w-12 h-12 text-cream-dark mx-auto mb-2" />
                <p className="text-brown-light">אין ר״מים זמינים לשיוך</p>
                <p className="text-brown-light text-sm mt-1">
                  יש ליצור משתמש עם תפקיד ר״מ קודם
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableRams.map((ram) => (
                  <button
                    key={ram.id}
                    onClick={() => handleAssignRam(ram.id, selectedPlatoon)}
                    className="w-full flex items-center justify-between p-3 bg-cream/50 rounded-xl hover:bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                        <span className="text-violet-700 font-bold">
                          {ram.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-brown-dark">{ram.name}</p>
                        <p className="text-xs text-brown-light">{ram.email}</p>
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
              className="w-full mt-4 py-3 border border-cream-dark text-brown-dark rounded-xl font-medium hover:bg-cream transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
