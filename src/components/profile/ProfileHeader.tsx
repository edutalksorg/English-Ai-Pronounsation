// src/components/profile/ProfileHeader.tsx
import React from "react";
import type { UserProfileData } from "@/lib/api/types/users";

// allow any shape of user
type AnyUser = UserProfileData | Record<string, any> | null;

export default function ProfileHeader({
  user,
  onLogout,
}: {
  user?: AnyUser;
  onLogout?: () => void; // <-- MADE OPTIONAL
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl overflow-hidden">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{(user?.fullName?.charAt(0) ?? "U").toUpperCase()}</span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{user?.fullName ?? "User"}</h1>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition"
        >
          Logout
        </button>
      )}
    </div>
  );
}
