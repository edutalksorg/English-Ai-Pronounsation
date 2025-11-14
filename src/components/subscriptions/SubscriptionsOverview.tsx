import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import SubscriptionsAPI from "@/lib/api/types/subscriptions";

export default function SubscriptionsOverview() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await SubscriptionsAPI.getPlans();
        // API may return wrapped object { data: [...] } or raw list
        const data = res?.data ?? res ?? [];
        if (mounted) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch plans", err);
        if (mounted) setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const popular = plans.find((p) => p.isMostPopular) ?? null;

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <Zap className="w-6 h-6" />
        <CardTitle>Subscription Plans</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-gray-500">No plans available.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Available plans: <strong>{plans.length}</strong></div>
            {popular && (
              <div className="p-3 bg-emerald-50 rounded">
                <div className="text-sm text-gray-700">Most Popular</div>
                <div className="font-semibold">{popular.name} — {popular.price ?? `${popular.price ?? ""} ${popular.currency ?? ""}`}</div>
                <div className="text-sm text-gray-500 mt-1">{popular.marketingTagline ?? ''}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
