import { useState } from "react";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import api from "../../utils/api";

interface LoginPageProps {
  onLogin: (sessionId: string, userData: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // Registration flow
        if (!name.trim()) {
          throw new Error("Name is required");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        // Register as admin
        const data = await api.register(email, password, name, "admin");

        // Auto-login after registration
        const token = data.token || localStorage.getItem("auth_token");
        const userData = data.user || api.getStoredUser();

        if (token && userData) {
          localStorage.setItem("sessionId", token);
          localStorage.setItem("user", JSON.stringify(userData));
          onLogin(token, userData);
        } else {
          throw new Error("Registration failed - no token received");
        }
      } else {
        // Login flow
        const data = await api.login(email, password);

        // Store in both auth_token/auth_user (API client) and sessionId/user (legacy)
        const token = data.token || localStorage.getItem("auth_token");
        const userData = data.user || api.getStoredUser();

        if (token && userData) {
          localStorage.setItem("sessionId", token);
          localStorage.setItem("user", JSON.stringify(userData));
          onLogin(token, userData);
        } else {
          throw new Error("Login failed - no token received");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            {isRegister ? <UserPlus className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-600 mt-2">
            {isRegister ? "Create your admin account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            {isRegister && (
              <p className="mt-1 text-xs text-slate-500">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          {isRegister && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (isRegister ? "Creating Account..." : "Signing in...") : (isRegister ? "Create Admin Account" : "Sign In")}
          </button>
        </form>

        {/* Toggle between login and register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setName("");
              setConfirmPassword("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isRegister ? "Already have an account? Sign in" : "Don't have an account? Create one"}
          </button>
        </div>

        {!isRegister && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              Default Super Admin: <br />
              <span className="font-mono font-semibold">superadmin@example.com</span> /{" "}
              <span className="font-mono font-semibold">admin123</span>
            </p>
          </div>
        )}

        {isRegister && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              <strong>Note:</strong> You will be registered as an <strong>Admin</strong> and can manage your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}