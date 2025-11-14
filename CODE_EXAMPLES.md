# Code Examples & Before/After Comparisons

## 1. Navbar Logout Removal

### ❌ BEFORE (Old Code)
```tsx
{open && (
  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-20">
    {/* Profile first */}
    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-50">Dashboard</Link>
    
    {/* LOGOUT BUTTON - REMOVED */}
    <button
      onClick={async () => {
        setOpen(false);
        try {
          await logout?.();
        } catch (e) {
          // ignore
        }
      }}
      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
    >
      Logout
    </button>
  </div>
)}
```

### ✅ AFTER (New Code)
```tsx
{open && (
  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-20">
    {/* Profile first */}
    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-50">Dashboard</Link>
  </div>
)}
```

**Impact:** Users can no longer logout from the profile menu. Logout button needs to be placed elsewhere (settings page, etc.)

---

## 2. Subscription Plan Card Component

### 📄 File: `src/components/subscriptions/SubscriptionPlanCard.tsx`

```tsx
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
```

**Key Features:**
- ✓ Reusable component
- ✓ Handles enabled/disabled features
- ✓ Shows "Most Popular" badge
- ✓ Responsive design
- ✓ Loading states
- ✓ Current plan indicator

---

## 3. Subscriptions Page - Key Sections

### ❌ BEFORE (Old Code)
```tsx
export default function Subscriptions() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await SubscriptionsAPI.getPlans();
        const data = res?.data ?? res ?? [];
        if (mounted) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load plans", err);
        if (mounted) setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSubscribe = async (plan: any) => {
    toast({
      title: 'Subscription flow',
      description: `Requested subscribe to ${plan?.name ?? plan?.planName ?? 'plan'}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">Select the perfect plan for your learning journey</p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Loading plans...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan: any) => (
            {/* Old card rendering */}
          ))}
        </div>
      )}
    </div>
  );
}
```

### ✅ AFTER (New Code - Simplified Example)
```tsx
// See src/pages/Subscriptions.tsx for full implementation

const [walletBalance, setWalletBalance] = useState<number>(0);
const [referralCode, setReferralCode] = useState<string>('');
const [currentSubscription, setCurrentSubscription] = useState<any>(null);

React.useEffect(() => {
  // Load plans, subscriptions, wallet, and referral code
  const load = async () => {
    const res = await SubscriptionsAPI.getPlans();
    const subRes = await SubscriptionsAPI.getCurrentSubscription();
    const wallet = await getWalletBalance();
    const ref = await getMyReferralCode();
    // ... set state
  };
  load();
}, []);

return (
  <div className="bg-gray-50 min-h-screen py-8">
    {/* User Quick Stats - NEW */}
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</div>
        </CardContent>
      </Card>
      {/* More stats cards... */}
    </div>

    {/* Tabs - NEW */}
    <Tabs defaultValue="plans">
      <TabsList>
        <TabsTrigger value="plans">All Plans</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>
      
      <TabsContent value="plans">
        {/* Uses SubscriptionPlanCard - NEW COMPONENT */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isCurrentPlan={currentSubscription?.planId === plan.id}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="features">
        {/* Feature comparison table - NEW */}
      </TabsContent>
    </Tabs>

    {/* Coupon section - NEW */}
    <Button onClick={() => setShowCouponDialog(true)}>
      Apply Coupon Code
    </Button>
  </div>
);
```

**New Features:**
- ✓ Wallet balance display
- ✓ Referral code display
- ✓ Current subscription tracking
- ✓ Feature comparison table
- ✓ Coupon/referral code application
- ✓ Better UI organization with tabs
- ✓ Quick stats cards
- ✓ Privacy notice alert

---

## 4. Voice Calling Feature - Usage

### Using Voice Calling Component

```tsx
// In Dashboard or any page
import VoiceCalling from '@/components/dashboard/VoiceCalling';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <VoiceCalling />
    </div>
  );
}
```

### Using Voice Calling Page

```tsx
// In router config
import VoiceCallingPage from '@/pages/Voice/VoiceCallingPage';

const routes = [
  { path: '/voice', element: <VoiceCallingPage /> }
];

// User navigates to /voice to access voice calling
```

### States & Screens

```tsx
// State 1: No users available
<div className="text-center space-y-4">
  <div className="w-36 h-36 gradient-hero rounded-full flex items-center justify-center">
    <Phone className="h-14 w-14 text-white" />
  </div>
  <h3>Ready to Practice?</h3>
  <p>There are currently no users available for practice calls. Please try again later.</p>
  <Button onClick={loadAvailableUsers}>Refresh</Button>
</div>

// State 2: Users available
<div className="text-center space-y-4">
  <h3>Ready to Practice?</h3>
  <p>{availableUsers.length} users are available.</p>
  <Button onClick={startCall} className="gradient-hero">
    <Phone className="h-5 w-5 mr-2" />
    Start Call
  </Button>
</div>

// State 3: Connecting
<div className="text-center space-y-4">
  <div className="w-36 h-36 gradient-hero rounded-full animate-pulse">
    <Phone className="h-14 w-14" />
  </div>
  <h3>Connecting...</h3>
</div>

// State 4: In Call
<div className="text-center space-y-6">
  <h3>Connected with {callPartner}</h3>
  <p>Call Duration: {formatDuration(callDuration)}</p>
  <Button variant="destructive" onClick={endCallHandler}>
    End Call
  </Button>
</div>

// State 5: Rating
<Dialog open={showRating}>
  <h3>Rate Your Experience</h3>
  <Stars onChange={setRating} />
  <Textarea placeholder="Feedback..." value={feedback} />
  <Button onClick={submitRating}>Submit Rating</Button>
</Dialog>
```

---

## 5. Integration Examples

### Adding to Dashboard

```tsx
// src/pages/Dashboard.tsx
import { VoiceCalling } from '@/components/dashboard/VoiceCalling';
import { SubscriptionsOverview } from '@/components/subscriptions/SubscriptionsOverview';

export default function Dashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SubscriptionsOverview />
      <VoiceCalling />
    </div>
  );
}
```

### Adding to Profile

```tsx
// src/pages/Profile.tsx
import { SubscriptionsProfilePanel } from '@/components/subscriptions/SubscriptionsProfilePanel';

export default function Profile() {
  return (
    <div>
      <h1>My Profile</h1>
      <SubscriptionsProfilePanel />
    </div>
  );
}
```

### Adding to Main App Routes

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Subscriptions from '@/pages/Subscriptions';
import VoiceCallingPage from '@/pages/Voice/VoiceCallingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes */}
        
        {/* New routes */}
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/voice" element={<VoiceCallingPage />} />
        
        {/* ... more routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 6. API Usage Examples

### Load Subscription Plans

```tsx
import SubscriptionsAPI from '@/lib/api/types/subscriptions';

const loadPlans = async () => {
  try {
    const response = await SubscriptionsAPI.getPlans();
    // Response: { data: [...] } or just [...]
    const plans = response?.data ?? response;
    console.log('Plans:', plans);
  } catch (error) {
    console.error('Failed to load plans:', error);
  }
};
```

### Get Wallet Balance

```tsx
import { getWalletBalance } from '@/lib/api/wallet';

const loadWallet = async () => {
  try {
    const wallet = await getWalletBalance();
    // wallet: { balance, currency, availableBalance, totalEarnings, totalSpent }
    console.log('Balance:', wallet.balance);
  } catch (error) {
    console.error('Failed to load wallet:', error);
  }
};
```

### Get Referral Code

```tsx
import { getMyReferralCode } from '@/lib/api/types/referrals';

const loadReferral = async () => {
  try {
    const referral = await getMyReferralCode();
    // referral: { code, shareableUrl, usageCount }
    console.log('Referral Code:', referral.code);
  } catch (error) {
    console.error('Failed to load referral:', error);
  }
};
```

### Apply Coupon

```tsx
import { applyReferralCoupon } from '@/lib/api/types/referrals';

const applyCoupon = async (code: string) => {
  try {
    const result = await applyReferralCoupon({
      couponCode: code,
      originalAmount: 100,
      itemType: 'Subscription'
    });
    console.log('Discount:', result);
  } catch (error) {
    console.error('Coupon invalid:', error);
  }
};
```

### Start Voice Call

```tsx
import { initiateCall, endCall, rateCall } from '@/lib/api/types/voiceCall';

const startCall = async (userId: string) => {
  try {
    const call = await initiateCall({ calleeId: userId });
    // call: { callId, status, initiatedAt }
    console.log('Call started:', call.callId);
  } catch (error) {
    console.error('Failed to start call:', error);
  }
};

const finishCall = async (callId: string) => {
  try {
    await endCall(callId);
  } catch (error) {
    console.error('Failed to end call:', error);
  }
};

const rateTheCall = async (callId: string, rating: number) => {
  try {
    await rateCall(callId, rating);
  } catch (error) {
    console.error('Failed to rate call:', error);
  }
};
```

---

## 7. TypeScript Interfaces

```tsx
// Subscription
interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'Weekly' | 'Daily';
  features: { [key: string]: any };
  isMostPopular?: boolean;
  marketingTagline?: string;
  trialDays?: number;
}

// Wallet
interface WalletBalance {
  balance: number;
  currency: string;
  frozenAmount?: number;
  availableBalance?: number;
  totalEarnings?: number;
  totalSpent?: number;
}

// Referral
interface ReferralCodeData {
  code: string;
  shareableUrl?: string;
  usageCount?: number;
}

// Voice Call
interface CallObject {
  callId: string;
  callerId?: string;
  calleeId?: string;
  status: 'Ringing' | 'InProgress' | 'Ended';
  initiatedAt: string;
  durationSeconds?: number;
  callQualityRating?: number;
}
```

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| **Navbar** | Has logout button | Only Profile/Dashboard |
| **Subscriptions Page** | Basic plan list | Full integration with wallet, referral, features |
| **Plan Card** | Inline rendering | Reusable component |
| **Feature Comparison** | Not available | Dedicated tab with table |
| **Wallet Display** | Not visible | Shows balance on subscription page |
| **Referral Code** | Not visible | Shows on subscription page |
| **Coupon System** | Not available | Modal for applying codes |
| **Voice Calling** | Basic UI | Complete with states and rating |
| **Documentation** | None | Implementation guide + quick links |

---

**Ready for Production!** ✅
