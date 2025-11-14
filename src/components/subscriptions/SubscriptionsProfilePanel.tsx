import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import SubscriptionsAPI from "@/lib/api/types/subscriptions";

export default function SubscriptionsProfilePanel() {
  const { user, isLoading } = useAuth();
  const [current, setCurrent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (isLoading) return;
      setLoading(true);
      try {
        const res = await SubscriptionsAPI.getCurrentSubscription();
        const payload = res?.data ?? res ?? null;
        if (mounted) setCurrent(payload);
      } catch (err) {
        console.error("get current subscription", err);
        if (mounted) setCurrent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || loading ? (
          <p className="text-sm text-gray-500">Checking subscription...</p>
        ) : current ? (
          <div>
            <div className="font-semibold">{current.planName ?? current.name ?? 'Unknown'}</div>
            <div className="text-sm text-gray-500">Status: {current.status ?? 'active'}</div>
            <div className="text-sm text-gray-500">Renews on: {current.renewalDate ? new Date(current.renewalDate).toLocaleDateString() : '-'}</div>
            <div className="mt-3">
              <Button variant="outline">Manage</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500">You don't have an active subscription.</p>
            <div className="mt-3">
              <Button>View Plans</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
