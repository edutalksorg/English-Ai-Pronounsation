// src/pages/Subscriptions/SubscriptionPlans.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getPlans, subscribe } from "@/lib/api/types/subscriptions";
import { Check } from "lucide-react";

interface Plan {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  features?: Record<string, string>;
  isMostPopular?: boolean;
  trialDays?: number;
  displayOrder?: number;
  marketingTagline?: string;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      const data = res?.data ?? res ?? [];
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load plans:", err);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    setSubscribing(plan.id ?? "");
    try {
      const payload = {
        planId: plan.id ?? "",
        paymentMethodId: "default",
        useFreeTrial: true,
        couponCode: "",
        userPhone: "",
      };
      const res = await subscribe(payload);
      toast({
        title: "Success",
        description: "Successfully subscribed to plan",
      });
    } catch (err: any) {
      console.error("Subscribe error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message ?? "Failed to subscribe",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading subscription plans...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the plan that best fits your learning goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.isMostPopular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-600">Most Popular</Badge>
              </div>
            )}
            <Card className={plan.isMostPopular ? "border-2 border-blue-600" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {plan.marketingTagline && (
                  <CardDescription>{plan.marketingTagline}</CardDescription>
                )}
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹{plan.price ?? 0}</span>
                    <span className="text-muted-foreground">/{plan.billingCycle ?? "month"}</span>
                  </div>
                  {plan.trialDays && plan.trialDays > 0 && (
                    <p className="text-sm text-green-600 mt-2">{plan.trialDays}-day free trial</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}

                {plan.features && Object.entries(plan.features).length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Features:</p>
                    <ul className="space-y-2">
                      {Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscribing === plan.id}
                  className="w-full mt-6"
                  variant={plan.isMostPopular ? "default" : "outline"}
                >
                  {subscribing === plan.id ? "Subscribing..." : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subscription plans available</p>
        </div>
      )}
    </div>
  );
}
