// src/pages/Auth/Login.tsx
import React, { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { loginUser } from "../../lib/api/types/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitTimeoutRef = useRef<NodeJS.Timeout>();
  const isValidForm = identifier.trim().length > 0 && password.length >= 6;

  // Memoized submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Prevent double submissions
      if (loading || !isValidForm) return;
      
      setLoading(true);
      setError("");
      
      try {
        // Use auth context login - it's optimized with caching
        const user = await auth.login(identifier.trim(), password);

        if (!user) {
          throw new Error("Login failed. Please try again.");
        }

        // Redirect based on role with immediate navigation (no wait)
        const role = user.role?.toLowerCase();
        submitTimeoutRef.current = setTimeout(() => {
          if (role === "admin") navigate("/admin", { replace: true });
          else if (role === "instructor") navigate("/instructor", { replace: true });
          else navigate("/dashboard", { replace: true });
        }, 100); // Minimal delay for visual feedback
      } catch (err: any) {
        const errMsg = 
          err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your credentials.";
        setError(errMsg);
        setLoading(false);
      }
    },
    [auth, identifier, password, loading, isValidForm, navigate]
  );

  // Clear any pending timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm animate-fade-in">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email or Phone
            </label>
            <Input
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(""); // Clear error on input change
              }}
              placeholder="your@email.com or +1234567890"
              required
              disabled={loading}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <Input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(""); // Clear error on input change
              }}
              placeholder="••••••••"
              type="password"
              required
              disabled={loading}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isValidForm}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200 ease-in-out transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <a href="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition">
            Forgot password?
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
