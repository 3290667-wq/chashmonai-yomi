"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ChevronRight,
  Shield,
  User as UserIcon,
  Mail,
  Award,
  Flame,
  Filter,
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

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [platoons, setPlatoons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleUpdateUser = async (userId: string, updates: { role?: string; platoon?: string }) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
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
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            מנהל
          </span>
        );
      case "RAM":
        return (
          <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
            ר״מ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
            משתמש
          </span>
        );
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-cream rounded-lg">
          <ChevronRight className="w-5 h-5 text-brown-medium" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">ניהול משתמשים</h1>
          <p className="text-sm text-brown-light">
            {users.length} משתמשים במערכת
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
          <input
            type="text"
            placeholder="חפש לפי שם או אימייל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-brown-light text-sm">
            <Filter className="w-4 h-4" />
            סינון:
          </div>

          <select
            value={selectedPlatoon}
            onChange={(e) => setSelectedPlatoon(e.target.value)}
            className="px-3 py-1.5 bg-cream/50 border border-cream-dark rounded-lg text-sm text-brown-dark"
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
              className="px-3 py-1.5 bg-cream/50 border border-cream-dark rounded-lg text-sm text-brown-dark"
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
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-dark/30 flex items-center gap-2">
          <Users className="w-5 h-5 text-brown-medium" />
          <h2 className="font-bold text-brown-dark">רשימת משתמשים</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
            <p className="text-brown-light">טוען משתמשים...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-cream-dark mx-auto mb-3" />
            <p className="text-brown-light">לא נמצאו משתמשים</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-dark/30">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-cream/30 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-medium to-sky-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {user.name?.charAt(0) || "?"}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-brown-dark">
                        {user.name || "ללא שם"}
                      </p>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="flex items-center gap-1 text-brown-light text-sm mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate" dir="ltr">{user.email}</span>
                    </div>

                    {user.platoon && (
                      <div className="flex items-center gap-1 text-brown-light text-sm mt-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{user.platoon}</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-brown-dark font-medium">{user.points}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-brown-dark font-medium">{user.streak}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Admin only */}
                  {isAdmin && (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 bg-sky-light text-sky-dark rounded-lg text-sm font-medium hover:bg-sky-medium/30 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-brown-dark mb-4">
              עריכת משתמש: {editingUser.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-medium mb-1">
                  תפקיד
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl"
                >
                  <option value="USER">משתמש</option>
                  <option value="RAM">ר״מ</option>
                  <option value="ADMIN">מנהל</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-medium mb-1">
                  פלוגה
                </label>
                <input
                  type="text"
                  value={editingUser.platoon || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, platoon: e.target.value })
                  }
                  placeholder="הכנס שם פלוגה"
                  className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 border border-cream-dark text-brown-dark rounded-xl font-medium hover:bg-cream transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={() =>
                  handleUpdateUser(editingUser.id, {
                    role: editingUser.role,
                    platoon: editingUser.platoon || "",
                  })
                }
                className="flex-1 py-3 bg-brown-medium text-cream rounded-xl font-medium hover:bg-brown-dark transition-colors"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
