import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionsAPI from '@/lib/api/types/subscriptions';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import { AlertTriangle, Zap, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Subscriptions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Plans and subscriptions
  const [plans, setPlans] = React.useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Load plans
        const res = await SubscriptionsAPI.getPlans();
        const data = res?.data ?? res ?? [];
        if (mounted) {
          setPlans(Array.isArray(data) ? data : []);
          // Sort by displayOrder or price to ensure consistent ordering
          const sortedPlans = (Array.isArray(data) ? data : []).sort(
            (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          setPlans(sortedPlans);
        }

        // Load current subscription
        const subRes = await SubscriptionsAPI.getCurrentSubscription();
        if (mounted) {
          setCurrentSubscription(subRes?.data ?? subRes ?? null);
        }
      } catch (err) {
        console.error('Failed to load subscription data', err);
        if (mounted) {
          setPlans([]);
          toast({
            title: 'Error',
            description: 'Failed to load subscription plans',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [toast]);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setSubscribeLoading(true);
    try {
      // In a real app, this would redirect to payment gateway
      toast({
        title: 'Subscription Initiated',
        description: `Starting subscription process for ${plan.name}. Please complete payment.`,
      });
    } catch (err: any) {
      console.error('Subscribe error:', err);
      toast({
        title: 'Subscription Failed',
        description: err?.message || 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Choose Your Learning Plan
          </h1>
          <p className="text-lg text-gray-600">
            Unlock premium features to accelerate your English learning journey
          </p>
        </div>

        {/* User Info & Current Subscription */}
        {user && (
          <div className="mb-8">
            {currentSubscription && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {currentSubscription.planName || 'Active'}
                      </div>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/settings?tab=wallet')}
                      variant="outline"
                      className="gap-2"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Manage in Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {plans.length === 0 ? (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No subscription plans available at the moment.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan: any) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                isCurrentPlan={
                  currentSubscription?.planId === plan.id ||
                  currentSubscription?.planName === plan.name
                }
                loading={subscribeLoading}
              />
            ))}
          </div>
        )}

        {/* Features Comparison Tab */}
        {plans.length > 0 && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>See what each plan includes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Feature</th>
                      {plans.map((plan: any) => (
                        <th key={plan.id} className="text-center py-3 px-4 font-semibold">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Collect all unique features */}
                    {Array.from(
                      new Set(
                        plans.flatMap((p: any) =>
                          Object.keys(p.features || {})
                        )
                      )
                    ).map((feature: any) => (
                      <tr key={feature} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {feature
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/_/g, ' ')
                            .trim()}
                        </td>
                        {plans.map((plan: any) => {
                          const value = plan.features?.[feature];
                          const enabled =
                            value === true ||
                            value === 'true' ||
                            value === '1' ||
                            (typeof value === 'string' &&
                              value.toLowerCase() !== 'false');
                          return (
                            <td
                              key={`${plan.id}-${feature}`}
                              className="text-center py-3 px-4"
                            >
                              {enabled ? (
                                <span className="text-green-600 font-bold">✓</span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link to Settings */}
        <Alert className="mt-8 bg-blue-50 border-blue-200">
          <SettingsIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Need to manage your wallet or coupons?</strong> Head to{' '}
            <Button
              variant="link"
              onClick={() => navigate('/settings')}
              className="p-0 h-auto font-semibold text-blue-600 underline"
            >
              Settings
            </Button>
            {' '}to manage your wallet balance, apply coupons, and track your referral rewards.
          </AlertDescription>
        </Alert>

        {/* Privacy Notice */}
        <Alert className="mt-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Your subscription includes:</strong> Access to voice calling, daily topics,
            AI pronunciation practice, and premium learning materials. Never share your payment details in plain text.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
