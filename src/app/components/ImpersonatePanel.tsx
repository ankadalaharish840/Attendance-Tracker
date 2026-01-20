import { useState, useEffect } from "react";
import { UserCog, X } from "lucide-react";
import api from "../../utils/api";

interface ImpersonatePanelProps {
  sessionId: string;
  onImpersonate: (newSessionId: string, user: any) => void;
}

export default function ImpersonatePanel({ sessionId, onImpersonate }: ImpersonatePanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, filterRole, searchTerm]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out superadmin from the list
        const nonSuperAdmins = data.users.filter((u: any) => u.role !== "superadmin");
        setUsers(nonSuperAdmins);
        setFilteredUsers(nonSuperAdmins);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleImpersonate = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        onImpersonate(data.sessionId, data.user);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to impersonate user");
      }
    } catch (error) {
      console.error("Impersonate error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Login as User (Impersonate)</h2>
        
        <p className="text-sm text-slate-600 mb-6">
          Click on any user below to login as that user and view their dashboard.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search by name or email
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-4">
                  <UserCircle className="w-10 h-10 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.team && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          {user.team}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleImpersonate(user.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login as User
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
