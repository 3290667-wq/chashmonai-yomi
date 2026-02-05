"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Users, Search, Shield, User, Edit2, Check } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  platoon: string | null;
  points: number;
  streak: number;
  lastLoginDate: string | null;
  createdAt: string;
  _count: { learningSessions: number };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [platoons, setPlatoons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatoon, setFilterPlatoon] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState({ role: "", platoon: "" });

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetchUsers();
  }, [filterPlatoon, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlatoon) params.set("platoon", filterPlatoon);
      if (filterRole) params.set("role", filterRole);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.users) {
        setUsers(data.users);
      }
      if (data.platoons) {
        setPlatoons(data.platoons);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const startEdit = (user: UserData) => {
    setEditingUser(user.id);
    setEditData({ role: user.role, platoon: user.platoon || "" });
  };

  const saveEdit = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: editData.role,
          platoon: editData.platoon,
        }),
      });

      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "מנהל";
      case "RAM":
        return 'ר"מ';
      default:
        return "חייל";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "RAM":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול משתמשים</h1>
        <p className="text-muted">צפייה ועריכת פרטי משתמשים</p>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="חיפוש לפי שם או אימייל..."
                className="w-full pr-10 pl-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <select
              value={filterPlatoon}
              onChange={(e) => setFilterPlatoon(e.target.value)}
              className="px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">כל הפלוגות</option>
              {platoons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">כל התפקידים</option>
              <option value="USER">חיילים</option>
              <option value="RAM">ר"מים</option>
              <option value="ADMIN">מנהלים</option>
            </select>

            <Button onClick={handleSearch}>חפש</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            משתמשים ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted">טוען...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted">לא נמצאו משתמשים</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border text-right">
                    <th className="pb-3 font-medium text-muted">משתמש</th>
                    <th className="pb-3 font-medium text-muted">תפקיד</th>
                    <th className="pb-3 font-medium text-muted">פלוגה</th>
                    <th className="pb-3 font-medium text-muted">נקודות</th>
                    <th className="pb-3 font-medium text-muted">סשנים</th>
                    <th className="pb-3 font-medium text-muted">כניסה אחרונה</th>
                    {isAdmin && (
                      <th className="pb-3 font-medium text-muted">פעולות</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-card-border last:border-0"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.name || "ללא שם"}
                            </p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {editingUser === user.id ? (
                          <select
                            value={editData.role}
                            onChange={(e) =>
                              setEditData({ ...editData, role: e.target.value })
                            }
                            className="px-2 py-1 rounded border border-card-border bg-background text-sm"
                          >
                            <option value="USER">חייל</option>
                            <option value="RAM">ר"מ</option>
                            <option value="ADMIN">מנהל</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {editingUser === user.id ? (
                          <input
                            type="text"
                            value={editData.platoon}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                platoon: e.target.value,
                              })
                            }
                            placeholder="פלוגה"
                            className="px-2 py-1 rounded border border-card-border bg-background text-sm w-24"
                          />
                        ) : (
                          <span className="text-muted">
                            {user.platoon || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-secondary">
                          {user.points}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-muted">
                          {user._count.learningSessions}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted">
                          {user.lastLoginDate
                            ? format(
                                new Date(user.lastLoginDate),
                                "dd/MM/yy HH:mm",
                                { locale: he }
                              )
                            : "-"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4">
                          {editingUser === user.id ? (
                            <Button
                              size="sm"
                              onClick={() => saveEdit(user.id)}
                            >
                              <Check size={16} />
                            </Button>
                          ) : (
                            <button
                              onClick={() => startEdit(user)}
                              className="p-2 hover:bg-background rounded-lg transition-colors"
                            >
                              <Edit2 size={16} className="text-muted" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
