import { useState, useEffect } from "react";
import { LogIn, LogOut as LogOutIcon, Coffee, Activity, X } from "lucide-react";
import api from "../../utils/api";

interface TimeTrackerProps {
  sessionId: string;
  user: any;
}

// Helper to detect device info
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceType = "Desktop";
  let deviceOS = "Unknown";
  let deviceName = "Unknown Device";

  // Detect OS
  if (/Windows/i.test(userAgent)) {
    deviceOS = "Windows";
    deviceName = "Windows PC";
  } else if (/Mac/i.test(userAgent) && !/iPhone|iPad/i.test(userAgent)) {
    deviceOS = "macOS";
    deviceName = "MacBook";
  } else if (/Linux/i.test(userAgent)) {
    deviceOS = "Linux";
    deviceName = "Linux PC";
  } else if (/iPhone/i.test(userAgent)) {
    deviceOS = "iOS";
    deviceName = "iPhone";
    deviceType = "Mobile";
  } else if (/iPad/i.test(userAgent)) {
    deviceOS = "iPadOS";
    deviceName = "iPad";
    deviceType = "Tablet";
  } else if (/Android/i.test(userAgent)) {
    deviceOS = "Android";
    if (/Mobile/i.test(userAgent)) {
      deviceName = "Android Phone";
      deviceType = "Mobile";
    } else {
      deviceName = "Android Tablet";
      deviceType = "Tablet";
    }
  }

  return { deviceName, deviceType, deviceOS };
}

export default function TimeTracker({ sessionId, user }: TimeTrackerProps) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentActivity, setCurrentActivity] = useState("");
  const [currentBreak, setCurrentBreak] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Settings
  const [breakTypes, setBreakTypes] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
    checkCurrentStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBreakTypes(data.breakTypes || []);
        setActivities(data.activities || []);
        if (data.activities.length > 0 && !currentActivity) {
          setCurrentActivity(data.activities[0]);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const checkCurrentStatus = async () => {
    try {
      // Check attendance status
      const attendanceResponse = await fetch(
        `${API_BASE_URL}/current-attendance/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.attendance && !attendanceData.attendance.logoutTime) {
          setIsClockedIn(true);
          setCurrentActivity(attendanceData.attendance.activity || "");
        }
      }

      // Check break status
      const breakResponse = await fetch(
        `${API_BASE_URL}/current-break/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );

      if (breakResponse.ok) {
        const breakData = await breakResponse.json();
        if (breakData.activeBreak) {
          setIsOnBreak(true);
          setCurrentBreak(breakData.activeBreak);
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleClockInOut = async () => {
    if (!isClockedIn) {
      // Clock In
      if (!currentActivity && activities.length > 0) {
        setCurrentActivity(activities[0]);
      }
      
      setLoading(true);
      try {
        const deviceInfo = getDeviceInfo();

        const response = await fetch(`${API_BASE_URL}/clock-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            activity: currentActivity || activities[0] || "Available",
            ...deviceInfo,
          }),
        });

        if (response.ok) {
          setIsClockedIn(true);
          alert("Clocked in successfully!");
        } else {
          const data = await response.json();
          alert(data.error || "Failed to clock in");
        }
      } catch (error) {
        console.error("Clock in error:", error);
        alert("An error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      // Clock Out
      if (isOnBreak) {
        alert("Please end your break before clocking out");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/clock-out`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
        });

        if (response.ok) {
          setIsClockedIn(false);
          alert("Clocked out successfully!");
        } else {
          const data = await response.json();
          alert(data.error || "Failed to clock out");
        }
      } catch (error) {
        console.error("Clock out error:", error);
        alert("An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleActivityChange = async (newActivity: string) => {
    if (!isClockedIn) {
      alert("Please clock in first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update-activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ activity: newActivity }),
      });

      if (response.ok) {
        setCurrentActivity(newActivity);
        setShowActivityModal(false);
        alert("Activity updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update activity");
      }
    } catch (error) {
      console.error("Update activity error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBreakAction = async (breakType?: string) => {
    if (!isOnBreak) {
      // Start break
      if (!breakType) return;
      
      if (!isClockedIn) {
        alert("Please clock in first");
        setShowBreakModal(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/start-break`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            breakType,
            activity: currentActivity,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsOnBreak(true);
          setCurrentBreak({ id: data.breakId, breakType });
          setShowBreakModal(false);
          alert("Break started!");
        } else {
          alert(data.error || "Failed to start break");
        }
      } catch (error) {
        console.error("Start break error:", error);
        alert("An error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      // End break
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/end-break`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            breakId: currentBreak.id,
            activity: currentActivity,
          }),
        });

        if (response.ok) {
          setIsOnBreak(false);
          setCurrentBreak(null);
          alert("Break ended!");
        } else {
          const data = await response.json();
          alert(data.error || "Failed to end break");
        }
      } catch (error) {
        console.error("End break error:", error);
        alert("An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="size-full bg-slate-50">
      {/* Header with 3 Circles */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Time Tracking</h2>
            <p className="text-sm text-slate-600">Manage your attendance and breaks</p>
          </div>

          {/* 3 Circle Controls */}
          <div className="flex items-center gap-4">
            {/* Circle 1: Login/Logout */}
            <button
              onClick={handleClockInOut}
              disabled={loading}
              className={`relative group ${loading ? "cursor-not-allowed" : ""}`}
              title={isClockedIn ? "Clock Out" : "Clock In"}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isClockedIn
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } ${loading ? "opacity-50" : ""}`}
              >
                {isClockedIn ? (
                  <LogOutIcon className="w-8 h-8 text-white" />
                ) : (
                  <LogIn className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-600">
                {isClockedIn ? "Clock Out" : "Clock In"}
              </div>
            </button>

            {/* Circle 2: Change Activity */}
            <button
              onClick={() => setShowActivityModal(true)}
              disabled={loading || !isClockedIn}
              className={`relative group ${loading || !isClockedIn ? "cursor-not-allowed" : ""}`}
              title="Change Activity"
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isClockedIn
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-slate-300"
                } ${loading ? "opacity-50" : ""}`}
              >
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-600">
                Activity
              </div>
            </button>

            {/* Circle 3: Break */}
            <button
              onClick={() => {
                if (isOnBreak) {
                  handleBreakAction();
                } else {
                  setShowBreakModal(true);
                }
              }}
              disabled={loading || !isClockedIn}
              className={`relative group ${loading || !isClockedIn ? "cursor-not-allowed" : ""}`}
              title={isOnBreak ? "End Break" : "Start Break"}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isOnBreak
                    ? "bg-orange-500 hover:bg-orange-600 animate-pulse"
                    : isClockedIn
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-slate-300"
                } ${loading ? "opacity-50" : ""}`}
              >
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-600">
                {isOnBreak ? "End Break" : "Break"}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-2">Status</div>
              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  isClockedIn
                    ? isOnBreak
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {isClockedIn ? (isOnBreak ? "On Break" : "Active") : "Clocked Out"}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-2">Current Activity</div>
              <div className="text-lg font-semibold text-slate-900">
                {isClockedIn ? currentActivity || "Not Set" : "-"}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-2">Break Type</div>
              <div className="text-lg font-semibold text-slate-900">
                {isOnBreak && currentBreak ? currentBreak.breakType : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Change Activity</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activities.map((activity, index) => (
                <button
                  key={index}
                  onClick={() => handleActivityChange(activity)}
                  disabled={loading}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activity === currentActivity
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="font-medium text-slate-900">{activity}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Break Type Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Select Break Type</h3>
              <button
                onClick={() => setShowBreakModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {breakTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => handleBreakAction(type)}
                  disabled={loading}
                  className={`w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-500 transition ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="font-medium text-slate-900">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
