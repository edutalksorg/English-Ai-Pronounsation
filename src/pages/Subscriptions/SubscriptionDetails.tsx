// src/pages/Subscriptions/SubscriptionDetails.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentSubscription, changePlan, cancelSubscription } from "@/lib/api/types/subscriptions";
import { Calendar, AlertCircle } from "lucide-react";

interface Subscription {
  id?: string;
  planName?: string;
  planId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  isActive?: boolean;
  features?: Record<string, string>;
}

export default function SubscriptionDetails() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const res = await getCurrentSubscription();
      const data = res?.data ?? res;
      setSubscription(data ?? null);
    } catch (err: any) {
      console.error("Failed to load subscription:", err);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    setCanceling(true);
    try {
      await cancelSubscription({
        subscriptionId: subscription.id,
        reason: "User requested cancellation",
      });
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      await loadSubscription();
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message ?? "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
            <div>
              <h3 className="font-semibold">No Active Subscription</h3>
              <p className="text-sm text-muted-foreground">You don't have an active subscription yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl">{subscription.planName ?? "Active Plan"}</CardTitle>
          <CardDescription>Current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {subscription.status ?? (subscription.isActive ? "Active" : "Inactive")}
                </span>
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                ₹{subscription.price ?? 0}/{subscription.billingCycle ?? "month"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </p>
              <p className="text-lg font-semibold">
                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Renewal Date
              </p>
              <p className="text-lg font-semibold">
                {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {subscription.features && Object.entries(subscription.features).length > 0 && (
            <div className="mt-6">
              <p className="font-semibold mb-3">Included Features:</p>
              <ul className="space-y-2">
                {Object.entries(subscription.features).map(([key, value]) => (
                  <li key={key} className="text-sm">
                    ✓ {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" disabled={canceling}>
              Change Plan
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={canceling}
            >
              {canceling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
