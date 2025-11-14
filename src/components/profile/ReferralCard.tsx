// src/components/profile/ReferralCard.tsx
import React from "react";

export default function ReferralCard({
  referralCode,
  stats,
}: {
  referralCode?: string | null;
  stats?: { totalInvites?: number; successful?: number; pendingRewards?: number } | undefined;
}) {
  function copy() {
    if (!referralCode) return alert("No referral code");
    navigator.clipboard?.writeText(referralCode).then(() => alert("Copied referral code"));
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Invite Friends, Earn Rewards</h3>
          <p className="text-sm text-gray-500">Share your referral code and earn cashback when friends subscribe</p>
        </div>

        <div className="rounded-full bg-gradient-to-r from-blue-500 to-teal-400 w-12 h-12 flex items-center justify-center text-white">🎁</div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 bg-gray-100 p-4 rounded text-lg font-bold">{referralCode ?? "—"}</div>
        <button onClick={copy} className="px-3 py-2 border rounded">Copy</button>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Total Invites</div>
            <div className="text-2xl font-bold">{stats.totalInvites ?? 0}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Successful</div>
            <div className="text-2xl font-bold">{stats.successful ?? 0}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Pending Rewards</div>
            <div className="text-2xl font-bold">{stats.pendingRewards ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
