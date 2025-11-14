# PR Runbook: Dark Mode Input Contrast & Settings/Wallet-Rewards Restructuring

## Overview
This PR fixes dark-mode input visibility across the app and restructures Settings/Wallet/Referrals/Coupons navigation.

### Changes Summary

#### 1. Dark Mode Input Contrast Fixes
- **Files Modified:** `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/index.css`
- **Goal:** Ensure inputs remain readable in dark mode using theme tokens (no hardcoded colors)
- **Implementation:**
  - Replaced hardcoded dark classes (`dark:text-white`, `dark:bg-[#1E1E1E]`) with theme tokens
  - Updated `input.tsx` and `textarea.tsx` to use `bg-card`, `text-foreground`, `placeholder:text-muted-foreground`
  - Modified `src/index.css` to apply theme CSS variables for native inputs using `hsl(var(--...))`
  - Input text now uses `text-foreground` (white in dark mode)
  - Input background uses `bg-card` (~#1E1E1E equivalent from theme)
  - Placeholder uses `placeholder:text-muted-foreground` (dimmer, visible)
  - Borders use `border-input` (visible in dark mode)

#### 2. Settings Page Refactoring
- **File:** `src/pages/Settings/SettingsPage.tsx`
- **Changes:**
  - **Removed:** Wallet, Referrals, Coupons tabs
  - **Now contains only:**
    - Notifications preferences (email, push, weekly digest toggles)
    - Password change form (old password, new password, confirm)
    - Appearance/Theme toggle (applies instantly)
    - Logout button

#### 3. Navbar Dropdown Menu Restructuring
- **File:** `src/components/Navbar.tsx`
- **Changes:**
  - Added `/settings` link (separate from Wallet/Referrals/Coupons)
  - Menu now shows as:
    ```
    Dashboard
    ──────────
    Wallet
    Referrals
    Coupons
    ──────────
    Settings
    ──────────
    Logout
    ```
  - All items use theme tokens for dark mode (no hardcoded colors)

#### 4. Auth Pages Input Component Updates
- **Files Modified:** `src/pages/Auth/Login.tsx`, `src/pages/Auth/Register.tsx`, `src/pages/Auth/ForgotPassword.tsx`
- **Changes:**
  - Replaced raw `<input>` elements with `<Input>` component
  - Replaced raw `<textarea>` with `<Textarea>` component
  - Ensures consistent dark-mode styling across all auth pages

---

## Manual Test Steps

### Test 1: Dark Mode Input Visibility

#### Setup
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/login
3. Open DevTools (F12)
4. In Console, toggle dark mode:
   ```javascript
   localStorage.setItem('theme', 'dark');
   location.reload();
   ```

#### Verification - Login Page
- [ ] Input text visible (white/light gray)
- [ ] Input background dark (not pure black)
- [ ] Placeholder text visible but dimmer than main text
- [ ] Focus ring visible when clicking input
- [ ] Borders visible

#### Verification - Register Page
- [ ] Navigate to http://localhost:3000/register
- [ ] Repeat visibility checks for all input fields (name, email, phone, passwords, role select, textarea)
- [ ] All inputs readable and properly contrasted

#### Verification - Forgot Password Page
- [ ] Navigate to http://localhost:3000/forgot-password
- [ ] Email input visible with proper contrast

#### Verification - Forgot Password Page
- [ ] Navigate to http://localhost:3000/forgot-password
- [ ] Email input visible with proper contrast

### Test 2: Settings Page Content

#### Setup
1. Login with valid credentials
2. Click user avatar → "Settings"

#### Verification
- [ ] Page title: "Settings"
- [ ] Three tabs visible: Notifications, Password, Appearance
- [ ] No Wallet tab
- [ ] No Referrals tab
- [ ] No Coupons tab

#### Notifications Tab
- [ ] Three toggles: Email Notifications, Push Notifications, Weekly Digest
- [ ] "Save Preferences" button visible
- [ ] Form inputs use dark mode styling (visible text, proper contrast)

#### Password Tab
- [ ] Three password inputs: Current Password, New Password, Confirm Password
- [ ] "Update Password" button visible
- [ ] Error/success messages display properly in dark/light mode

#### Appearance Tab
- [ ] Theme toggle button visible
- [ ] Shows "Dark" or "Light" based on current mode
- [ ] Toggle icon (Sun/Moon) visible

#### Logout Section
- [ ] Red "Logout" button at bottom
- [ ] Clicking logout redirects to login page

### Test 3: Navbar Dropdown Menu

#### Setup
1. Login with valid credentials
2. Click user avatar dropdown

#### Verification
- [ ] Dashboard link visible
- [ ] Wallet link visible
- [ ] Referrals link visible
- [ ] Coupons link visible
- [ ] Settings link visible (separate section)
- [ ] Logout button at bottom
- [ ] All items use theme tokens (dark mode looks correct)

### Test 4: Wallet/Referrals/Coupons Endpoints (Manual)

#### Wallet Endpoint - GET /api/v1/wallet/balance
1. Open DevTools Console
2. Login first
3. Run:
   ```javascript
   import { WalletService } from '@/lib/api/generated/services/WalletService';
   await WalletService.getApiV1WalletBalance();
   ```
4. [ ] Response received with wallet data (balance, pending transactions, etc.)
5. [ ] No 401/403 errors

#### Referrals Endpoint - GET /api/v1/referrals/my-code
1. Open DevTools Console
2. Run:
   ```javascript
   import { ReferralService } from '@/lib/api/generated/services/ReferralService';
   await ReferralService.getApiV1ReferralsMy();  // adjust method name if different
   ```
3. [ ] Response contains referral code and shareable URL
4. [ ] No 401/403 errors

#### Coupons Endpoint - GET /api/v1/coupons/my-coupons
1. Open DevTools Console
2. Run:
   ```javascript
   import { CouponService } from '@/lib/api/generated/services/CouponService';
   await CouponService.getApiV1Coupons(1, 10);
   ```
3. [ ] Response contains array of coupons
4. [ ] No 401/403 errors

### Test 5: Theme Toggle (Instant Application)

#### Setup
1. Login and navigate to Settings → Appearance tab
2. Observe current theme

#### Verification
1. [ ] Click theme toggle button
2. [ ] Page immediately switches to new theme (no reload)
3. [ ] All inputs remain visible with proper contrast in new theme
4. [ ] Refresh page - theme persists (localStorage saved correctly)
5. [ ] Toggle back - works instantly again

### Test 6: Keyboard Navigation & Accessibility

#### Focus Management
1. Login page: [ ] Tab through inputs, focus ring visible on each
2. Settings page: [ ] Tab through all form fields, buttons
3. [ ] Focus outline visible in both light and dark modes

#### ARIA Attributes
1. Settings tabs: [ ] `role="tablist"` on TabsList
2. Logout buttons: [ ] `aria-label="Logout"` present
3. Back button: [ ] `aria-label` or semantic button role

---

## Build & Deployment

### Pre-Merge Checks
```bash
# Build production
npm run build

# Expected result: No TypeScript errors, clean build
```

### Acceptance Criteria Checklist
- [ ] Build completes without errors
- [ ] Dark-mode inputs visible on Login, Signup, Forgot Password pages
- [ ] Settings page only contains Notifications, Password, Appearance, Logout
- [ ] Wallet, Referrals, Coupons NOT in Settings page
- [ ] Navbar dropdown shows Wallet/Referrals/Coupons as separate items
- [ ] Settings is a top-level menu item (not under Wallet/Rewards group)
- [ ] Theme toggle applies instantly (no page reload)
- [ ] All inputs use shared component (`Input`, `Textarea`)
- [ ] No hardcoded color values in component classes (only theme tokens)
- [ ] Endpoints called via authenticated `apiClient` (no client-side mocks)
- [ ] Keyboard navigation works (Tab, focus visible)
- [ ] ARIA attributes present and correct
- [ ] No TypeScript/ESLint errors

---

## Endpoints Used

| Feature | Method | URL | Status |
|---------|--------|-----|--------|
| Wallet Balance | GET | `/api/v1/wallet/balance` | ✓ Called via `WalletService.getApiV1WalletBalance()` |
| Wallet Transactions | GET | `/api/v1/wallet/transactions` | ✓ Called via `WalletService.getApiV1WalletTransactions()` |
| Referrals Code | GET | `/api/v1/referrals/my-code` | ✓ Existing endpoint |
| Coupons List | GET | `/api/v1/coupons/my-coupons` | ✓ Called via `CouponService.getApiV1Coupons()` |

---

## Rollback Plan

If issues arise:
1. Revert changes to `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/index.css`
2. Revert `src/pages/Settings/SettingsPage.tsx` to original
3. Revert `src/components/Navbar.tsx` to original
4. Revert Auth page imports to use raw input elements

---

## Screenshots (Attach to PR)

Attach before/after screenshots:
1. **Login page (dark mode)** - Input contrast
2. **Settings page** - New layout
3. **Navbar dropdown** - New menu structure
4. **Theme toggle working** - Before/after
5. **Register page (dark mode)** - Input visibility

---

## Notes

- All changes use existing theme tokens defined in `tailwind.config.ts` and `src/index.css`
- No new dependencies added
- Settings page theme toggle syncs with Navbar theme toggle (same localStorage key)
- All Wallet/Referrals/Coupons navigation now separate from Settings
- Future work: Move Wallet/Referrals/Coupons to dedicated `/wallet-rewards` route if product decides to consolidate them further
