import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Calendar, LogOut, Bell, BarChart3 } from "lucide-react";
import AttendanceCalendar from "./AttendanceCalendar";
import RequestsPanel from "./RequestsPanel";
import AdminLiveDashboard from "./AdminLiveDashboard";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d5286ad`;

interface AdminDashboardProps {
  user: any;
  sessionId: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  user,
  sessionId,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "requests">("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pending-requests`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.timeRequests.length + data.leaveRequests.length);
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
    }
  };

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome, {user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === "calendar"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === "requests"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-5 h-5" />
            Requests
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <AdminLiveDashboard sessionId={sessionId} user={user} />
        )}
        {activeTab === "calendar" && (
          <AttendanceCalendar sessionId={sessionId} currentUser={user} />
        )}
        {activeTab === "requests" && (
          <RequestsPanel sessionId={sessionId} userRole="admin" onUpdate={loadPendingRequests} />
        )}
      </div>
    </div>
  );
}