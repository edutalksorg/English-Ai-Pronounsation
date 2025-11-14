import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserTabsNav } from "@/components/profile/UserTabsNav";

export default function TrackProgressPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.fullName ?? "EduTalks Learner"}
          </h1>
          <p className="text-gray-500">{user?.email ?? "student@edutalks.tech"}</p>
          <UserTabsNav active="progress" />
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Track Progress
          </h2>
          <p className="text-gray-500">
            Progress visualizations will appear here soon. Continue learning to
            unlock detailed insights.
          </p>
        </section>
      </div>
    </div>
  );
}

