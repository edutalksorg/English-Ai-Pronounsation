// src/pages/ReferralsSettings.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, DollarSign, Users, Loader2, Save } from "lucide-react";
import { AdminReferralsAPI } from "@/lib/api/types/adminReferrals";

interface ReferralSettings {
  rewardPerReferral: number;
  minWithdrawalAmount: number;
  requireAdminApproval: boolean;
  allowCourseRedemption: boolean;
  totalReferrals?: number;
  totalPaid?: number;
  pendingAmount?: number;
}

export default function ReferralSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch referral settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await AdminReferralsAPI.getSettings();
        setSettings({
          rewardPerReferral: data?.rewardPerReferral ?? 0,
          minWithdrawalAmount: data?.minWithdrawalAmount ?? 0,
          requireAdminApproval: data?.requireAdminApproval ?? false,
          allowCourseRedemption: data?.allowCourseRedemption ?? false,
          totalReferrals: data?.totalReferrals ?? 0,
          totalPaid: data?.totalPaid ?? 0,
          pendingAmount: data?.pendingAmount ?? 0,
        });
      } catch (err: any) {
        console.error("❌ Failed to fetch referral settings:", err);
        toast({
          title: "Failed to load referral settings",
          description: err?.response?.data?.messages?.[0] || err?.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  // ✅ Handle save/update
  const handleSave = async () => {
    if (!settings) return;

    // Validation
    if (settings.rewardPerReferral < 0) {
      toast({
        title: "Invalid reward amount",
        description: "Reward per referral cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (settings.minWithdrawalAmount < 0) {
      toast({
        title: "Invalid withdrawal amount",
        description: "Minimum withdrawal amount cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await AdminReferralsAPI.updateSettings({
        rewardPerReferral: settings.rewardPerReferral,
        minWithdrawalAmount: settings.minWithdrawalAmount,
        requireAdminApproval: settings.requireAdminApproval,
        allowCourseRedemption: settings.allowCourseRedemption,
      } as any);
      
      toast({
        title: "Settings saved",
        description: "Referral settings updated successfully.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("❌ Failed to update settings:", err);
      toast({
        title: "Failed to save settings",
        description: err?.response?.data?.messages?.[0] || err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle input changes with validation
  const handleNumberChange = (
    field: keyof ReferralSettings,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && settings) {
      setSettings({ ...settings, [field]: numValue });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading referral settings...
          </p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Failed to load settings
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Referral Settings</h1>
        <p className="text-muted-foreground">
          Configure your referral program preferences and monitor statistics
        </p>
      </div>

      <div className="grid gap-6">
        {/* Cashback Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cashback Configuration
            </CardTitle>
            <CardDescription>
              Set referral reward amounts and minimum withdrawal thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reward" className="text-base font-semibold">
                Reward per Referral ($)
              </Label>
              <Input
                id="reward"
                type="number"
                min="0"
                step="0.01"
                value={settings.rewardPerReferral}
                onChange={(e) => handleNumberChange("rewardPerReferral", e.target.value)}
                placeholder="0.00"
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                Amount users receive for each successful referral
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minWithdraw" className="text-base font-semibold">
                Minimum Withdrawal Amount ($)
              </Label>
              <Input
                id="minWithdraw"
                type="number"
                min="0"
                step="0.01"
                value={settings.minWithdrawalAmount}
                onChange={(e) => handleNumberChange("minWithdrawalAmount", e.target.value)}
                placeholder="0.00"
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                Minimum balance required before users can withdraw funds
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Withdrawal Settings
            </CardTitle>
            <CardDescription>
              Control withdrawal permissions and redemption options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-semibold">
                  Require Admin Approval
                </Label>
                <p className="text-sm text-muted-foreground">
                  Users must get approval before withdrawing funds
                </p>
              </div>
              <Switch
                checked={settings.requireAdminApproval}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireAdminApproval: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-semibold">
                  Allow Course Redemption
                </Label>
                <p className="text-sm text-muted-foreground">
                  Users can use wallet balance to purchase courses
                </p>
              </div>
              <Switch
                checked={settings.allowCourseRedemption}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowCourseRedemption: checked })
                }
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral Statistics
            </CardTitle>
            <CardDescription>
              Overview of your referral program performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-muted rounded-lg border">
                <p className="text-4xl font-bold gradient-hero bg-clip-text text-transparent mb-2">
                  {settings.totalReferrals?.toLocaleString() ?? 0}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Referrals
                </p>
              </div>
              <div className="text-center p-6 bg-muted rounded-lg border">
                <p className="text-4xl font-bold gradient-success bg-clip-text text-transparent mb-2">
                  ${settings.totalPaid?.toLocaleString("en-US", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) ?? "0.00"}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Paid Out
                </p>
              </div>
              <div className="text-center p-6 bg-muted rounded-lg border">
                <p className="text-4xl font-bold text-primary mb-2">
                  ${settings.pendingAmount?.toLocaleString("en-US", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) ?? "0.00"}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Amount
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            className="gradient-hero min-w-[150px]" 
            disabled={saving || loading}
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
