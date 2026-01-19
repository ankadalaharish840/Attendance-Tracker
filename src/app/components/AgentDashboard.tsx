import { useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { LogOut, Calendar, Clock, FileText } from "lucide-react";
import AttendanceCalendar from "./AttendanceCalendar";
import TimeChangeRequestModal from "./TimeChangeRequestModal";
import LeaveRequestModal from "./LeaveRequestModal";
import TimeTracker from "./TimeTracker";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d5286ad`;

interface AgentDashboardProps {
  user: any;
  sessionId: string;
  onLogout: () => void;
}

export default function AgentDashboard({
  user,
  sessionId,
  onLogout,
}: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tracker" | "calendar">("tracker");
  const [showTimeChangeModal, setShowTimeChangeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
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
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === "tracker"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-5 h-5" />
            Time Tracker
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
            My Attendance
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "tracker" && (
          <div>
            <TimeTracker sessionId={sessionId} user={user} />
            
            {/* Request Actions */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Requests</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowTimeChangeModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    <Clock className="w-5 h-5" />
                    Request Time Change
                  </button>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <FileText className="w-5 h-5" />
                    Request Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <AttendanceCalendar sessionId={sessionId} currentUser={user} />
        )}
      </div>

      {/* Modals */}
      {showTimeChangeModal && (
        <TimeChangeRequestModal
          sessionId={sessionId}
          onClose={() => setShowTimeChangeModal(false)}
        />
      )}

      {showLeaveModal && (
        <LeaveRequestModal
          sessionId={sessionId}
          onClose={() => setShowLeaveModal(false)}
        />
      )}
    </div>
  );
}