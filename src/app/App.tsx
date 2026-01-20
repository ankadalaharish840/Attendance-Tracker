import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api";
import LoginPage from "./components/LoginPage";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AgentDashboard from "./components/AgentDashboard";

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedSessionId = localStorage.getItem("sessionId");
    const storedUser = localStorage.getItem("user");
    
    if (storedSessionId && storedUser) {
      setSessionId(storedSessionId);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (newSessionId: string, userData: any) => {
    setSessionId(newSessionId);
    setUser(userData);
    localStorage.setItem("sessionId", newSessionId);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleImpersonate = (newSessionId: string, userData: any) => {
    setSessionId(newSessionId);
    setUser(userData);
    localStorage.setItem("sessionId", newSessionId);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleExitImpersonation = async () => {
    if (!user.isImpersonating) return;

    try {
      const response = await fetch(`${API_BASE_URL}/exit-impersonation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setUser(data.user);
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        alert("Failed to exit impersonation");
      }
    } catch (error) {
      console.error("Exit impersonation error:", error);
      alert("An error occurred");
    }
  };

  const handleLogout = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/logout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    setSessionId(null);
    setUser(null);
    localStorage.removeItem("sessionId");
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-slate-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!sessionId || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="size-full bg-slate-50">
      {/* Impersonation Banner */}
      {user.isImpersonating && (
        <div className="bg-yellow-500 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              You are viewing as: {user.name} ({user.role})
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-2 px-4 py-2 bg-white text-yellow-700 rounded-lg hover:bg-yellow-50 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit & Return to Super Admin
          </button>
        </div>
      )}

      <div className={`${user.isImpersonating ? 'h-[calc(100%-56px)]' : 'size-full'}`}>
        {user.role === "superadmin" && (
          <SuperAdminDashboard
            user={user}
            sessionId={sessionId}
            onLogout={handleLogout}
            onImpersonate={handleImpersonate}
          />
        )}
        {user.role === "admin" && (
          <AdminDashboard
            user={user}
            sessionId={sessionId}
            onLogout={handleLogout}
          />
        )}
        {user.role === "agent" && (
          <AgentDashboard
            user={user}
            sessionId={sessionId}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}