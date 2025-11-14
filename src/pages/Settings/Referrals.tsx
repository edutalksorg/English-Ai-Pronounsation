// src/pages/Settings/Referrals.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Gift, Users, CheckCircle, Loader2 } from 'lucide-react';
import { getMyReferralCode, getReferralStats, getReferralHistory } from '@/lib/api/referrals';
import type { ReferralHistoryItem } from '@/lib/api/referrals';
import { useToast } from '@/hooks/use-toast';

export default function ReferralsSettings() {
  const { toast } = useToast();
  const [code, setCode] = useState<string>('');
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codeData, statsData, historyData] = await Promise.all([
        getMyReferralCode(),
        getReferralStats(),
        getReferralHistory(1, 10),
      ]);

      if (codeData?.code) {
        setCode(codeData.code);
        setShareableUrl(codeData.shareableUrl || '');
      }

      if (statsData) {
        setStats(statsData);
      }

      if (historyData && Array.isArray(historyData)) {
        setHistory(historyData);
      }
    } catch (err) {
      console.error('Failed to load referral data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Referral code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>Share this code with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            {code ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black tracking-widest text-gray-900 dark:text-white font-mono">
                    {code}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
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
                {shareableUrl && (
                  <div className="text-xs text-muted-foreground">
                    <a href={shareableUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Shareable Link →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No referral code generated yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Stats
            </CardTitle>
            <CardDescription>Referral program performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.totalReferrals ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {stats.successfulReferrals ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">
                  {stats.pendingReferrals ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>

              {stats.totalEarnings !== undefined && (
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                    ₹{stats.totalEarnings?.toFixed(2) ?? '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              )}

              {stats.earningsThisMonth !== undefined && (
                <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                    ₹{stats.earningsThisMonth?.toFixed(2) ?? '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              )}

              {stats.pendingRewards !== undefined && (
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-1">
                    ₹{stats.pendingRewards?.toFixed(2) ?? '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>List of your recent referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {item.refereeName || item.refereeEmail || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.status === 'qualified' ? 'default' : item.status === 'pending' ? 'secondary' : 'outline'
                      }
                    >
                      {item.status || 'unknown'}
                    </Badge>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white min-w-[80px] text-right">
                      ₹{item.rewardAmount?.toFixed(2) ?? '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
