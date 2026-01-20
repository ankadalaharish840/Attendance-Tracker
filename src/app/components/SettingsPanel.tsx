import { useState, useEffect } from "react";
import { Plus, X, Clock, Edit2, Save } from "lucide-react";
import api, { API_BASE_URL } from "../../utils/api";

interface SettingsPanelProps {
  sessionId: string;
}

export default function SettingsPanel({ sessionId }: SettingsPanelProps) {
  const [breakTypes, setBreakTypes] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newBreakType, setNewBreakType] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSchedules();
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
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/schedules`, {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
    }
  };

  const addBreakType = async () => {
    if (!newBreakType.trim()) return;

    const updatedBreakTypes = [...breakTypes, newBreakType.trim()];
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/break-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ breakTypes: updatedBreakTypes }),
      });

      if (response.ok) {
        setBreakTypes(updatedBreakTypes);
        setNewBreakType("");
        alert("Break type added successfully!");
      } else {
        alert("Failed to add break type");
      }
    } catch (error) {
      console.error("Error adding break type:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeBreakType = async (index: number) => {
    const updatedBreakTypes = breakTypes.filter((_, i) => i !== index);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/break-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ breakTypes: updatedBreakTypes }),
      });

      if (response.ok) {
        setBreakTypes(updatedBreakTypes);
        alert("Break type removed successfully!");
      } else {
        alert("Failed to remove break type");
      }
    } catch (error) {
      console.error("Error removing break type:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!newActivity.trim()) return;

    const updatedActivities = [...activities, newActivity.trim()];
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      if (response.ok) {
        setActivities(updatedActivities);
        setNewActivity("");
        alert("Activity added successfully!");
      } else {
        alert("Failed to add activity");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeActivity = async (index: number) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      if (response.ok) {
        setActivities(updatedActivities);
        alert("Activity removed successfully!");
      } else {
        alert("Failed to remove activity");
      }
    } catch (error) {
      console.error("Error removing activity:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async () => {
    const newSchedule = {
      name: "New Schedule",
      start_time: "09:00",
      end_time: "17:00",
      break_types: [],
      activities: [],
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ schedule: newSchedule }),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules([...schedules, data.schedule]);
        alert("Schedule added successfully!");
      } else {
        alert("Failed to add schedule");
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeSchedule = async (index: number) => {
    const scheduleId = schedules[index].id;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/schedules/${scheduleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );

      if (response.ok) {
        const updatedSchedules = schedules.filter((_, i) => i !== index);
        setSchedules(updatedSchedules);
        alert("Schedule removed successfully!");
      } else {
        alert("Failed to remove schedule");
      }
    } catch (error) {
      console.error("Error removing schedule:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const editSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const saveSchedule = async () => {
    if (!editingSchedule) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/schedules/${editingSchedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({ schedule: editingSchedule }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedSchedules = schedules.map((schedule) =>
          schedule.id === data.schedule.id ? data.schedule : schedule
        );
        setSchedules(updatedSchedules);
        setEditingSchedule(null);
        setShowScheduleModal(false);
        alert("Schedule saved successfully!");
      } else {
        alert("Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Break Types Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Break Types</h2>
        <p className="text-sm text-slate-600 mb-4">
          Manage the types of breaks that users can select when taking a break.
        </p>

        {/* Add New Break Type */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBreakType}
            onChange={(e) => setNewBreakType(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addBreakType()}
            placeholder="Enter new break type"
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={addBreakType}
            disabled={loading || !newBreakType.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        {/* Break Types List */}
        <div className="space-y-2">
          {breakTypes.map((type, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <span className="font-medium text-slate-900">{type}</span>
              <button
                onClick={() => removeBreakType(index)}
                disabled={loading}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Activities</h2>
        <p className="text-sm text-slate-600 mb-4">
          Manage the types of activities that users can select during their work.
        </p>

        {/* Add New Activity */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addActivity()}
            placeholder="Enter new activity"
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={addActivity}
            disabled={loading || !newActivity.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <span className="font-medium text-slate-900">{activity}</span>
              <button
                onClick={() => removeActivity(index)}
                disabled={loading}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedules Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Schedules</h2>
        <p className="text-sm text-slate-600 mb-4">
          Manage the work schedules for users.
        </p>

        {/* Add New Schedule */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={addSchedule}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            <Plus className="w-5 h-5" />
            Add Schedule
          </button>
        </div>

        {/* Schedules List */}
        <div className="space-y-2">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <span className="font-medium text-slate-900">{schedule.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editSchedule(schedule)}
                  disabled={loading}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => removeSchedule(index)}
                  disabled={loading}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Edit Schedule
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={editingSchedule.name}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, name: e.target.value })
                  }
                  placeholder="Schedule Name"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <input
                  type="time"
                  value={editingSchedule.start_time}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      start_time: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="time"
                  value={editingSchedule.end_time}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      end_time: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <select
                  value={editingSchedule.break_types.join(",")}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      break_types: e.target.value.split(",").map((type) => type.trim()),
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Break Types</option>
                  {breakTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <select
                  value={editingSchedule.activities.join(",")}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      activities: e.target.value.split(",").map((activity) => activity.trim()),
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Activities</option>
                  {activities.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end mt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveSchedule}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}