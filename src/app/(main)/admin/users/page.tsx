"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ChevronRight,
  Shield,
  Mail,
  Award,
  Flame,
  Filter,
  Lock,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  platoon: string | null;
  points: number;
  streak: number;
  createdAt: string;
  _count: { learningSessions: number };
}

interface EditingUserData extends User {
  newEmail?: string;
  newPassword?: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [platoons, setPlatoons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [editingUser, setEditingUser] = useState<EditingUserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin && session?.user?.role !== "RAM") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [status, isAdmin, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedPlatoon) params.set("platoon", selectedPlatoon);
      if (selectedRole) params.set("role", selectedRole);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPlatoons(data.platoons);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: { role?: string; platoon?: string; email?: string; password?: string }) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        setSaveError(data.error || "שגיאה בעדכון המשתמש");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      setSaveError("שגיאה בעדכון המשתמש");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, selectedPlatoon, selectedRole]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            מנהל
          </span>
        );
      case "RAM":
        return (
          <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded-full text-xs font-medium">
            ר״מ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded-full text-xs font-medium">
            משתמש
          </span>
        );
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
          <h1 className="text-2xl font-bold text-white">ניהול משתמשים</h1>
          <p className="text-sm text-white/60">
            {users.length} משתמשים במערכת
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="חפש לפי שם או אימייל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <Filter className="w-4 h-4" />
            סינון:
          </div>

          <select
            value={selectedPlatoon}
            onChange={(e) => setSelectedPlatoon(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            <option value="">כל הפלוגות</option>
            {platoons.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
            >
              <option value="">כל התפקידים</option>
              <option value="USER">משתמש</option>
              <option value="RAM">ר״מ</option>
              <option value="ADMIN">מנהל</option>
            </select>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Users className="w-5 h-5 text-white/60" />
          <h2 className="font-bold text-white">רשימת משתמשים</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-white/50">טוען משתמשים...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">לא נמצאו משתמשים</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1a140f] font-bold">
                      {user.name?.charAt(0) || "?"}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">
                        {user.name || "ללא שם"}
                      </p>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate" dir="ltr">{user.email}</span>
                    </div>

                    {user.platoon && (
                      <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{user.platoon}</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-white font-medium">{user.points}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-white font-medium">{user.streak}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Admin only */}
                  {isAdmin && (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 bg-gold/20 text-gold rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors"
                    >
                      עריכה
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && isAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              עריכת משתמש: {editingUser.name}
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    אימייל
                  </div>
                </label>
                <input
                  type="email"
                  value={editingUser.newEmail ?? editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, newEmail: e.target.value })
                  }
                  placeholder="כתובת אימייל"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    סיסמה חדשה
                  </div>
                </label>
                <input
                  type="password"
                  value={editingUser.newPassword || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, newPassword: e.target.value })
                  }
                  placeholder="השאר ריק אם לא רוצה לשנות"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                />
                <p className="text-xs text-white/40 mt-1">השאר ריק אם לא רוצה לשנות סיסמה</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  תפקיד
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                >
                  <option value="USER">משתמש</option>
                  <option value="RAM">ר״מ</option>
                  <option value="ADMIN">מנהל</option>
                </select>
              </div>

              {/* Platoon */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  פלוגה
                </label>
                <input
                  type="text"
                  value={editingUser.platoon || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, platoon: e.target.value })
                  }
                  placeholder="הכנס שם פלוגה"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                />
              </div>

              {/* Error Message */}
              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{saveError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setSaveError("");
                }}
                className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={() =>
                  handleUpdateUser(editingUser.id, {
                    role: editingUser.role,
                    platoon: editingUser.platoon || "",
                    email: editingUser.newEmail !== editingUser.email ? editingUser.newEmail : undefined,
                    password: editingUser.newPassword || undefined,
                  })
                }
                disabled={saving}
                className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    שומר...
                  </>
                ) : (
                  "שמור"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
