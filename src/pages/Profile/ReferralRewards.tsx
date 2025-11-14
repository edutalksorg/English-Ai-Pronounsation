// src/pages/Profile/ReferralRewards.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, CheckCircle } from "lucide-react";
import { getMyReferralCode, getReferralStats } from "@/lib/api/types/referrals";
import { useToast } from "@/hooks/use-toast";

interface ReferralData {
  code?: string;
  shareableUrl?: string;
  usageCount?: number;
}

interface Stats {
  totalReferrals?: number;
  successfulReferrals?: number;
  pendingReferrals?: number;
  totalRewards?: number;
}

export default function ReferralRewards({
  referralCode,
  referralStats,
}: {
  referralCode?: string | null;
  referralStats?: any;
}) {
  const { toast } = useToast();
  const [data, setData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const code = await getMyReferralCode();
      setData(code);
      const s = await getReferralStats();
      setStats(s);
    } catch (err) {
      console.error("Failed to load referral data:", err);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const code = data?.code || referralCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const code = data?.code || referralCode;
  const totalReferrals = stats?.totalReferrals || referralStats?.totalInvites || 0;
  const successfulReferrals = stats?.successfulReferrals || referralStats?.successful || 0;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Rewards
        </CardTitle>
        <CardDescription>Invite friends and earn rewards</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Code Section */}
        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Your Referral Code</span>
            <Badge variant="secondary">Copy & Share</Badge>
          </div>
          {loading ? (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-3xl font-black tracking-widest text-gray-900 dark:text-white font-mono">
                {code || "—"}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!code}
                className="dark:border-gray-600"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
          {data?.shareableUrl && (
            <div className="mt-3 text-xs text-muted-foreground truncate">
              Link: <a href={data.shareableUrl} className="text-blue-600 dark:text-blue-400 hover:underline">{data.shareableUrl}</a>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">Total Referrals</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : totalReferrals}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-muted-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : successfulReferrals}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" onClick={() => window.location.href = data?.shareableUrl || '#'}>
          <Gift className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>
      </CardContent>
    </Card>
  );
}
