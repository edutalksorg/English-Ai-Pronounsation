import React, { useEffect, useState } from "react";
import { Gift, Copy, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserTabsNav } from "@/components/profile/UserTabsNav";
import { Button } from "@/components/ui/button";
import {
  getMyReferralCode,
  getReferralStats,
  getReferralHistory,
  applyReferralCoupon,
} from "@/lib/api/types/referrals";

export default function ReferralsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [referralCodeData, setReferralCodeData] = useState< {
    code?: string;
    shareableUrl?: string;
    usageCount?: number;
  } | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const code = await getMyReferralCode();
        setReferralCodeData(code);
        const s = await getReferralStats();
        setStats(s);
        const h = await getReferralHistory({ page: 1, pageSize: 10 });
        setHistory(h);
      } catch (err) {
        console.error("referrals load", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCodeData?.code ?? "");
    } catch {
      // ignore clipboard errors
    }
  };

  const handleShare = () => {
    const url = referralCodeData?.shareableUrl ?? window.location.href;
    if ((navigator as any).share) {
      (navigator as any).share({ title: "Join EduTalks", url }).catch(() => {});
    } else {
      // fallback: copy
      navigator.clipboard?.writeText(url).catch(() => {});
      alert("Shareable link copied to clipboard");
    }
  };

  const handleApplyCouponTest = async () => {
    if (!referralCodeData?.code) return alert("No referral code available");
    setApplying(true);
    try {
      const res = await applyReferralCoupon({
        couponCode: referralCodeData.code,
        originalAmount: 100,
        itemType: "Subscription",
      });
      setApplyResult(res);
      alert("Coupon apply request completed; check result below");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to apply coupon");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.fullName ?? "EduTalks Learner"}
          </h1>
          <p className="text-gray-500">{user?.email ?? "student@edutalks.tech"}</p>
          <UserTabsNav active="referrals" />
        </header>

        <section className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-teal-400 text-white p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/80">Invite Friends, Earn Rewards</p>
                <p className="text-lg text-white/90 mt-1">Share your referral code and earn cashback when friends subscribe</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6" onClick={handleShare}>
                Share Link
              </Button>
              <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-2" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                Copy Code
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">Your Referral Code</p>
              <p className="text-4xl font-black tracking-widest text-gray-900">{loading ? "..." : referralCodeData?.code ?? "-"}</p>
              <p className="text-sm text-gray-500 mt-1">Usage: {referralCodeData?.usageCount ?? 0}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-sm text-gray-400">Shareable Link</p>
              <a className="text-blue-600 font-medium" href={referralCodeData?.shareableUrl ?? "#"} onClick={(e) => referralCodeData?.shareableUrl ? null : e.preventDefault()}>{referralCodeData?.shareableUrl ?? "-"}</a>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br from-blue-500 via-sky-500 to-teal-400">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-wide text-white/70">Total Referrals</p>
                <Users className="w-6 h-6 text-white/70" />
              </div>
              <p className="text-5xl font-extrabold mt-4">{loading ? "..." : stats?.totalReferrals ?? 0}</p>
            </div>

            <div className="rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-wide text-white/70">Active Subscribers</p>
                <Users className="w-6 h-6 text-white/70" />
              </div>
              <p className="text-5xl font-extrabold mt-4">{loading ? "..." : stats?.successfulReferrals ?? 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Recent Referral History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No referrals yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{h.refereeName ?? h.refereeEmail}</div>
                      <div className="text-sm text-gray-400">{new Date(h.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-gray-600">{h.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Test Apply Referral Coupon</h3>
            <p className="text-sm text-gray-500 mb-3">This will call the coupons apply API using your referral code and show the result (for testing).</p>
            <div className="flex gap-3">
              <Button onClick={handleApplyCouponTest} disabled={applying || loading}>
                {applying ? "Applying..." : "Apply Referral Coupon (Test)"}
              </Button>
            </div>
            {applyResult && (
              <pre className="mt-3 p-3 bg-gray-50 border rounded text-sm text-gray-700">{JSON.stringify(applyResult, null, 2)}</pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

