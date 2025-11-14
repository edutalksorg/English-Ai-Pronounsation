// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, LogOut } from "lucide-react";
import { CouponService } from "@/lib/api/generated/services/CouponService";

/**
 * Navbar exported as a named export (match your imports: `import { Navbar } from "@/components/Navbar"`)
 */
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [couponCount, setCouponCount] = useState<number>(0);
  const [couponsLoading, setCouponsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Fetch a lightweight coupons count for the navbar badge (do not use mock data)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      setCouponsLoading(true);
      try {
        const res = await CouponService.getApiV1Coupons(1, 5);
        if (!mounted) return;
        setCouponCount(Array.isArray(res) ? res.length : 0);
      } catch (err) {
        console.warn("Navbar: failed to fetch coupons count", err);
      } finally {
        if (mounted) setCouponsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
            ET
          </div>
          <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">EduTalks</Link>
          {/* Top nav: Dashboard -> Wallet -> Referrals -> Coupons (only shown for authenticated users) */}
          {user && (
            <nav aria-label="Main" className="hidden md:flex items-center gap-3 ml-6">
              <Link
                to="/dashboard"
                className="px-3 py-1 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="px-3 py-1 rounded text-gray-700 dark:text-white">Login</Link>
              <Link to="/register" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Get Started</Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                title="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User dropdown */}
              <div className="relative" ref={ref}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 border dark:border-gray-700 rounded-full px-4 py-2 hover:shadow dark:bg-gray-800 dark:text-white"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-sm font-bold text-white">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="hidden sm:inline text-gray-900 dark:text-white">{user?.fullName ?? "Account"}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card border border-border dark:border-gray-700 rounded shadow-lg z-20">
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground">
                      Dashboard
                    </Link>

                    <div className="border-t border-border dark:border-gray-700" />

                    <Link to="/user/wallet" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground">
                      Wallet
                    </Link>

                    <Link to="/user/referrals" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground">
                      Referrals
                    </Link>

                    <Link to="/user/coupons" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground">
                      Coupons
                    </Link>

                    <div className="border-t border-border dark:border-gray-700" />

                    <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground">
                      Settings
                    </Link>

                    <div className="border-t border-border dark:border-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
