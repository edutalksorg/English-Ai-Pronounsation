# Quick Implementation Links & Routing Guide

## 📍 Quick Navigation

### Modified/New Files

#### 1. Navbar - Profile Dropdown (Modified)
**Path:** `src/components/Navbar.tsx`
- **Change:** Removed Logout button from dropdown
- **Action:** Profile and Dashboard links only
- **Impact:** Users cannot logout from profile menu

---

#### 2. Subscription Plan Card (NEW)
**Path:** `src/components/subscriptions/SubscriptionPlanCard.tsx`
- **Component:** Reusable plan card component
- **Props:**
  - `plan: SubscriptionPlan` - Plan data
  - `onSubscribe: (plan) => void` - Subscribe callback
  - `isCurrentPlan?: boolean` - Highlight current
  - `loading?: boolean` - Loading state
- **Features:** Icon, pricing, features list, CTA button

---

#### 3. Subscriptions Page (UPDATED - Complete Rewrite)
**Path:** `src/pages/Subscriptions.tsx`

**Sections:**
1. **Header** - Title and subtitle
2. **Quick Stats** (if logged in)
   - Wallet Balance
   - Referral Code
   - Current Plan (if any)
3. **Tabs:**
   - All Plans - Grid of plan cards
   - Features - Comparison table
4. **Coupon Section** - Apply referral/coupon codes
5. **Privacy Notice** - Security alert

**Key Components Used:**
- `SubscriptionPlanCard` - Individual plan display
- `Card`, `Button`, `Badge` - UI components
- `Dialog` - Coupon input modal
- `Tabs` - Content organization
- `Alert` - Notifications

**Integrated APIs:**
- Subscriptions: getPlans, getCurrentSubscription
- Wallet: getWalletBalance
- Referrals: getMyReferralCode
- Coupons: applyReferralCoupon

---

#### 4. Voice Calling Page (NEW)
**Path:** `src/pages/Voice/VoiceCallingPage.tsx`
- **Purpose:** Dedicated page for voice calling feature
- **Content:** Wraps `VoiceCalling` component
- **Route:** Can be added as `/voice` or `/calling`

---

## 🔗 URL Routes to Add

Add these routes to your main routing configuration:

```tsx
// src/App.tsx or router configuration

import Subscriptions from '@/pages/Subscriptions';
import VoiceCallingPage from '@/pages/Voice/VoiceCallingPage';

const routes = [
  // ... existing routes
  
  // Subscriptions
  {
    path: '/subscriptions',
    element: <Subscriptions />
  },
  
  // Voice Calling
  {
    path: '/voice',
    element: <VoiceCallingPage />
  },
  {
    path: '/calling',
    element: <VoiceCallingPage />
  },
  
  // ... other routes
];
```

---

## 🎯 Component Integration Map

```
App
├── Navbar (Modified - no logout)
├── Pages
│   ├── Subscriptions (NEW - Full Integration)
│   │   ├── Header
│   │   ├── Quick Stats (Wallet, Referral, Current Plan)
│   │   ├── Tabs
│   │   │   ├── All Plans Tab
│   │   │   │   └── SubscriptionPlanCard (Reusable)
│   │   │   │       ├── Plan Name/Description
│   │   │   │       ├── Price Display
│   │   │   │       ├── Features List
│   │   │   │       └── Subscribe Button
│   │   │   └── Features Tab
│   │   │       └── Feature Comparison Table
│   │   ├── Coupon Section
│   │   │   └── Coupon Dialog
│   │   └── Privacy Notice
│   │
│   └── Voice/VoiceCallingPage (NEW)
│       └── VoiceCalling Component
│           ├── User Loading
│           ├── No Users State
│           ├── Connecting State
│           ├── In Call State
│           ├── Timeout State
│           └── Rating Dialog
```

---

## 🔄 Data Flow

### Subscription Page Load
```
1. Load Plans
   GET /api/v1/Subscriptions/plans
   └─> setPlans(sortedByDisplayOrder)

2. Load Current Subscription
   GET /api/v1/Subscriptions/current
   └─> setCurrentSubscription(data)

3. Load Wallet Balance
   GET /api/v1/wallet/balance
   └─> setWalletBalance(balance)

4. Load Referral Code
   GET /api/v1/referrals/my-code
   └─> setReferralCode(code)
```

### Voice Calling Flow
```
1. Load Available Users (on mount + every 10s)
   GET /api/v1/calls/available-users
   └─> setAvailableUsers(users)

2. Start Call
   POST /api/v1/calls/initiate
   ├─> callId received
   └─> startTimer(30s timeout)

3. Call Connected
   └─> startDurationTimer()

4. End Call
   POST /api/v1/calls/{callId}/end
   └─> showRatingDialog()

5. Submit Rating
   POST /api/v1/calls/{callId}/rate
   └─> resetState()
```

### Apply Coupon Flow
```
1. User clicks "Apply Coupon"
   └─> Open Dialog

2. User enters coupon code
   └─> setCode(value)

3. User clicks "Apply Code"
   POST /api/v1/coupons/apply
   ├─> Success: Show toast ✓
   └─> Error: Show error toast ✗
```

---

## 📦 Component Props Reference

### SubscriptionPlanCard Props
```tsx
interface SubscriptionPlanCardProps {
  plan: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    billingCycle: string;
    features: { [key: string]: any };
    isMostPopular?: boolean;
    marketingTagline?: string;
  };
  onSubscribe: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
}
```

---

## 🎨 Styling Classes Used

### Gradients
- `gradient-hero` - Primary blue to teal gradient
- `gradient-success` - Green gradient
- `from-blue-500 to-blue-600` - Blue gradient
- `from-emerald-500 via-green-500 to-lime-400` - Green/lime gradient

### Responsive
- `md:grid-cols-3` - 3 columns on desktop
- `md:scale-105` - Scale up on desktop
- `sm:w-auto` - Auto width on small+
- `hidden sm:inline` - Hide on mobile

### States
- `hover:bg-gray-50` - Hover background
- `hover:shadow-lg` - Hover shadow
- `animate-pulse` - Pulsing animation
- `disabled:opacity-50` - Disabled state

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test all routes are accessible
- [ ] Verify API endpoints are correct
- [ ] Check authentication tokens are sent
- [ ] Test voice calling with real users
- [ ] Verify wallet deduction works
- [ ] Test coupon/referral code application
- [ ] Check responsive design on mobile
- [ ] Verify error handling
- [ ] Test loading states
- [ ] Clear browser cache
- [ ] Run linter/type checker
- [ ] Performance check (Lighthouse)

---

## 🐛 Common Issues & Solutions

### "Plans not loading"
- Check API endpoint: `/api/v1/Subscriptions/plans`
- Verify user is authenticated
- Check network tab for errors
- Verify API response format

### "Voice calling unavailable"
- Check available users endpoint: `/api/v1/calls/available-users`
- Verify WebRTC config endpoint works
- Check browser console for permission errors
- Ensure no other calls in progress

### "Wallet not showing"
- Verify user has wallet created
- Check balance endpoint: `/api/v1/wallet/balance`
- Ensure user is authenticated
- Check for API response format issues

### "Coupon not applying"
- Verify coupon code is valid
- Check endpoint: `/api/v1/coupons/apply`
- Verify referral code exists
- Check coupon hasn't expired

---

## 📞 Support Information

**For Questions:**
- Review `IMPLEMENTATION_GUIDE.md` for detailed documentation
- Check component source files for inline comments
- Review API types in `src/lib/api/types/`

**For Bugs:**
1. Check browser console for errors
2. Check network tab for API calls
3. Verify API responses match expected format
4. Check TypeScript types match API response

---

**Created:** November 14, 2025
**Status:** Ready for Integration
