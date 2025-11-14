// src/pages/Profile/ProfilePage.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Wallet from "./Wallet";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader user={user} onLogout={handleLogout} />
        <div className="mt-6">
          {/* Simple profile sections: Overview and Wallet (Referral removed) */}
          <div className="flex items-center gap-3 mb-4">
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => navigate('/profile?view=overview')}>Overview</button>
            <button className="px-3 py-1 rounded border" onClick={() => navigate('/profile?view=wallet')}>Wallet</button>
          </div>

          {/* Show Wallet inline if user navigates to profile?view=wallet, otherwise show overview */}
          {new URLSearchParams(window.location.search).get('view') === 'wallet' ? (
            <Wallet />
          ) : (
            <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Account Overview</h3>
              <p className="text-sm text-muted-foreground">Manage your account details, preferences, and security settings from the Settings page.</p>
              <div className="mt-4">
                <p className="text-sm"><strong>Full name:</strong> {user?.fullName ?? '-'}</p>
                <p className="text-sm"><strong>Email:</strong> {user?.email ?? '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
