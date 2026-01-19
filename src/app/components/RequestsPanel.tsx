import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Check, X, Clock, Calendar } from "lucide-react";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d5286ad`;

interface RequestsPanelProps {
  sessionId: string;
  userRole: string;
  onUpdate: () => void;
}

export default function RequestsPanel({
  sessionId,
  userRole,
  onUpdate,
}: RequestsPanelProps) {
  const [timeRequests, setTimeRequests] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pending-requests`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimeRequests(data.timeRequests);
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const handleApproveTimeChange = async (requestId: string, approved: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approve-time-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ requestId, approved }),
      });

      if (response.ok) {
        alert(approved ? "Request approved!" : "Request rejected!");
        loadRequests();
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (requestId: string, approved: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approve-leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ requestId, approved }),
      });

      if (response.ok) {
        alert(approved ? "Leave approved!" : "Leave rejected!");
        loadRequests();
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to process leave request");
      }
    } catch (error) {
      console.error("Error processing leave:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Time Change Requests */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Time Change Requests
          </h2>

          {timeRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No pending time change requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {request.userName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            request.type === "login"
                              ? "bg-green-100 text-green-800"
                              : request.type === "logout"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.type}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(request.date)}
                        </div>
                        <div>
                          <span className="font-medium">Original Time:</span>{" "}
                          {formatDateTime(request.originalTime)}
                        </div>
                        <div>
                          <span className="font-medium">Requested Time:</span>{" "}
                          {formatDateTime(request.requestedTime)}
                        </div>
                        <div>
                          <span className="font-medium">Reason:</span> {request.reason}
                        </div>
                        <div className="text-xs text-slate-400">
                          Requested on: {formatDateTime(request.createdAt)}
                        </div>
                      </div>
                    </div>

                    {(userRole === "admin" || userRole === "superadmin") && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveTimeChange(request.id, true)}
                          disabled={loading}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveTimeChange(request.id, false)}
                          disabled={loading}
                          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Requests */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Leave Requests</h2>

          {leaveRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No pending leave requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        {request.userName}
                      </h3>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Start Date:</span>{" "}
                          {formatDate(request.startDate)}
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span>{" "}
                          {formatDate(request.endDate)}
                        </div>
                        <div>
                          <span className="font-medium">Reason:</span> {request.reason}
                        </div>
                        <div className="text-xs text-slate-400">
                          Requested on: {formatDateTime(request.createdAt)}
                        </div>
                      </div>
                    </div>

                    {(userRole === "admin" || userRole === "superadmin") && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveLeave(request.id, true)}
                          disabled={loading}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveLeave(request.id, false)}
                          disabled={loading}
                          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
