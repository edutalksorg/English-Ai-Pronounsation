import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type TabKey = "dashboard" | "referrals" | "wallet" | "progress";

const tabs: { key: TabKey; label: string; to: string }[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  { key: "referrals", label: "Referral Rewards", to: "/user/referrals" },
  { key: "wallet", label: "Wallet", to: "/user/wallet" },
  { key: "progress", label: "Track Progress", to: "/user/progress" },
];

// quick links to dashboard features (these map to ?tab= values on the dashboard)
const dashboardFeatures: { key: string; label: string; to: string }[] = [
  { key: "voice", label: "Voice Calls", to: "/dashboard?tab=voice" },
  { key: "topics", label: "Daily Topics", to: "/dashboard?tab=topics" },
  { key: "quizzes", label: "Quizzes", to: "/dashboard?tab=quizzes" },
  { key: "pronunciation", label: "AI Pronunciation", to: "/dashboard?tab=pronunciation" },
];

export function UserTabsNav({ active }: { active: TabKey }) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition border",
            active === tab.key
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          )}
        >
          {tab.label}
        </Link>
      ))}

      {/* Dashboard feature quick links */}
      <div className="flex items-center gap-2 ml-2">
        {dashboardFeatures.map((f) => (
          <Link
            key={f.key}
            to={f.to}
            className="px-3 py-1 text-xs rounded-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:bg-gray-100"
          >
            {f.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

