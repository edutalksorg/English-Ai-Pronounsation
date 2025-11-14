import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: { [key: string]: any };
  isMostPopular?: boolean;
  marketingTagline?: string;
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
}

export default function SubscriptionPlanCard({
  plan,
  onSubscribe,
  isCurrentPlan = false,
  loading = false,
}: SubscriptionPlanCardProps) {
  // Parse features into an array for display
  const featuresList = Object.entries(plan.features || {}).map(([key, value]) => ({
    key,
    value,
    enabled: value === true || value === 'true' || value === '1' || (typeof value === 'string' && value.toLowerCase() !== 'false'),
  }));

  return (
    <Card
      className={`flex flex-col h-full transition-all duration-300 ${
        plan.isMostPopular
          ? 'border-2 border-blue-500 shadow-xl relative md:scale-105'
          : 'border border-gray-200 hover:shadow-lg'
      }`}
    >
      {/* Badge for Most Popular */}
      {plan.isMostPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1">
          Most Popular
        </Badge>
      )}

      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {plan.description || plan.marketingTagline || 'Flexible plan for your needs'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col">
        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-lg text-gray-600">{plan.currency}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">per {plan.billingCycle?.toLowerCase() || 'month'}</p>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-8 flex-1">
          {featuresList.length > 0 ? (
            featuresList.map((feature) => (
              <div key={feature.key} className="flex items-start gap-3">
                {feature.enabled ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm ${
                    feature.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {feature.key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/_/g, ' ')
                    .trim()}
                  {typeof feature.value === 'string' && feature.value !== 'true'
                    ? `: ${feature.value}`
                    : ''}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Features included with this plan</p>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => onSubscribe(plan)}
          disabled={isCurrentPlan || loading}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            plan.isMostPopular
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
              : isCurrentPlan
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : 'Subscribe Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
