import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, X } from "lucide-react";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d5286ad`;

interface AttendanceCalendarProps {
  sessionId: string;
  currentUser: any;
}

export default function AttendanceCalendar({
  sessionId,
  currentUser,
}: AttendanceCalendarProps) {
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any>({
    attendance: [],
    breaks: [],
    leaves: [],
  });
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (currentUser.role !== "agent") {
      loadUsers();
      loadTeams();
    }
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedUserId, currentDate]);

  const loadTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to show only agents
        const agents = data.users.filter((u: any) => u.role === "agent");
        setUsers(agents);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(
        `${API_BASE_URL}/attendance/${selectedUserId}/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const attendance = attendanceData.attendance.find((a: any) => a.date === dateStr);
    const dayBreaks = attendanceData.breaks.filter((b: any) => {
      if (!b.startTime) return false;
      const breakDate = b.startTime.split("T")[0];
      return breakDate === dateStr;
    });

    // Check if it's a leave day
    const isLeave = attendanceData.leaves.some((l: any) => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });

    return { attendance, breaks: dayBreaks, isLeave, dateStr };
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalBreakTime = (breaks: any[]) => {
    let totalMinutes = 0;
    breaks.forEach((b) => {
      if (b.startTime && b.endTime) {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const diff = (end.getTime() - start.getTime()) / 1000 / 60;
        totalMinutes += diff;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const handleDayClick = (day: number) => {
    const dayData = getAttendanceForDate(day);
    if (dayData.attendance || dayData.isLeave) {
      setSelectedDay({ day, ...dayData });
      setShowDetailModal(true);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters (for admin/superadmin) */}
        {currentUser.role !== "agent" && users.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team Filter */}
              {teams.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Filter by Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Teams</option>
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Agent Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {users
                    .filter((u) => selectedTeam === "all" || u.team === selectedTeam)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.team || "No Team"} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="px-4 py-3 text-center text-sm font-semibold text-slate-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="border border-slate-100 p-2 bg-slate-50" />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const { attendance, breaks, isLeave } = getAttendanceForDate(day);
              const hasAttendance = attendance && attendance.loginTime;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`border border-slate-100 p-2 min-h-[120px] cursor-pointer hover:bg-slate-50 transition ${
                    isLeave ? "bg-purple-50" : hasAttendance ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    {day}
                  </div>

                  {isLeave && (
                    <div className="text-xs text-purple-700 font-semibold mb-1">
                      On Leave
                    </div>
                  )}

                  {hasAttendance && !isLeave && (
                    <div className="space-y-1 text-xs">
                      <div className="text-green-700">
                        <span className="font-semibold">In:</span>{" "}
                        {formatTime(attendance.loginTime)}
                      </div>
                      {attendance.logoutTime && (
                        <div className="text-red-700">
                          <span className="font-semibold">Out:</span>{" "}
                          {formatTime(attendance.logoutTime)}
                        </div>
                      )}
                      {breaks.length > 0 && (
                        <div className="text-yellow-700">
                          <span className="font-semibold">Breaks:</span> {breaks.length}{" "}
                          ({calculateTotalBreakTime(breaks)})
                        </div>
                      )}
                    </div>
                  )}

                  {!hasAttendance && !isLeave && (
                    <div className="text-xs text-slate-400">No attendance</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded" />
            <span className="text-slate-600">On Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-slate-200 rounded" />
            <span className="text-slate-600">Absent</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDay && (
        <AttendanceDetailModal
          selectedDay={selectedDay}
          onClose={() => setShowDetailModal(false)}
          formatTime={formatTime}
          calculateTotalBreakTime={calculateTotalBreakTime}
        />
      )}
    </div>
  );
}

// Attendance Detail Modal Component
function AttendanceDetailModal({ selectedDay, onClose, formatTime, calculateTotalBreakTime }: any) {
  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === "Mobile" || deviceType === "Tablet") {
      return <Smartphone className="w-5 h-5 text-blue-600" />;
    }
    return <Monitor className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            Attendance Details - {selectedDay.dateStr}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedDay.isLeave ? (
          <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-lg font-semibold text-purple-800">On Leave</p>
          </div>
        ) : selectedDay.attendance ? (
          <div className="space-y-6">
            {/* Login/Logout Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-slate-900">Attendance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Login Time</p>
                  <p className="font-semibold text-green-700">
                    {formatTime(selectedDay.attendance.loginTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Logout Time</p>
                  <p className="font-semibold text-red-700">
                    {formatTime(selectedDay.attendance.logoutTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Activity</p>
                  <p className="font-semibold text-slate-900">
                    {selectedDay.attendance.activity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="font-semibold text-slate-900">
                    {selectedDay.attendance.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Device Information */}
            {selectedDay.attendance.deviceName && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  {getDeviceIcon(selectedDay.attendance.deviceType)}
                  Device Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Device Name</p>
                    <p className="font-semibold text-slate-900">
                      {selectedDay.attendance.deviceName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Device Type</p>
                    <p className="font-semibold text-slate-900">
                      {selectedDay.attendance.deviceType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Operating System</p>
                    <p className="font-semibold text-slate-900">
                      {selectedDay.attendance.deviceOS}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">IP Address</p>
                    <p className="font-semibold text-slate-900">
                      {selectedDay.attendance.ipAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Breaks */}
            {selectedDay.breaks && selectedDay.breaks.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">
                    Breaks ({selectedDay.breaks.length})
                  </h4>
                  <p className="text-sm font-semibold text-yellow-800">
                    Total: {calculateTotalBreakTime(selectedDay.breaks)}
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedDay.breaks.map((breakItem: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded p-3 border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          {breakItem.breakType}
                        </span>
                        <span className="text-xs text-slate-500">
                          {breakItem.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Start:</span>{" "}
                          <span className="font-semibold">
                            {formatTime(breakItem.startTime)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">End:</span>{" "}
                          <span className="font-semibold">
                            {formatTime(breakItem.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}