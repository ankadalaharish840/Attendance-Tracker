import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Users, LogOut, UserPlus, Calendar, Bell, Key, Clock, Settings, BarChart3 } from "lucide-react";
import UserManagement from "./UserManagement";
import AttendanceCalendar from "./AttendanceCalendar";
import RequestsPanel from "./RequestsPanel";
import TimeTracker from "./TimeTracker";
import SettingsPanel from "./SettingsPanel";
import SuperAdminLiveDashboard from "./SuperAdminLiveDashboard";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d5286ad`;

interface SuperAdminDashboardProps {
  user: any;
  sessionId: string;
  onLogout: () => void;
  onImpersonate: (newSessionId: string, user: any) => void;
}

export default function SuperAdminDashboard({
  user,
  sessionId,
  onLogout,
  onImpersonate,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "calendar" | "requests" | "tracker" | "settings" | "dashboard">("dashboard");
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
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
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
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "tracker"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-5 h-5" />
            Time Tracker
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-5 h-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
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
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "settings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <SuperAdminLiveDashboard sessionId={sessionId} user={user} />
        )}
        {activeTab === "tracker" && (
          <TimeTracker sessionId={sessionId} user={user} />
        )}
        {activeTab === "users" && (
          <UserManagement sessionId={sessionId} userRole="superadmin" onImpersonate={onImpersonate} />
        )}
        {activeTab === "calendar" && (
          <AttendanceCalendar sessionId={sessionId} currentUser={user} />
        )}
        {activeTab === "requests" && (
          <RequestsPanel sessionId={sessionId} userRole="superadmin" onUpdate={loadPendingRequests} />
        )}
        {activeTab === "settings" && (
          <SettingsPanel sessionId={sessionId} />
        )}
      </div>
    </div>
  );
}