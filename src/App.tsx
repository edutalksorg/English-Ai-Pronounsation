// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

// ---------- Public ----------
import Index from "./pages/Index";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ChangePassword from "@/pages/Auth/ChangePassword";
import ConfirmEmail from "@/pages/Auth/ConfirmEmail";
import ResendEmailConfirmation from "@/pages/Auth/ResendEmailConfirmation";

// ---------- User ----------
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile/ProfilePage"; // Profile route (must exist at this path)
import TopicDetail from "@/pages/TopicDetail";
import WalletPage from "@/pages/user/Wallet";
import ReferralsPage from "@/pages/user/Referrals";
import TrackProgressPage from "@/pages/user/TrackProgress";
import SubscriptionsPage from "@/pages/Subscriptions/SubscriptionsPage";
import CouponsPage from "@/pages/user/Coupons";
import SettingsPage from "@/pages/user/Settings";

// ---------- Admin (First 4 modules wired) ----------
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminTransactions from "@/pages/Admin/AdminTransactions";
import AdminWithdrawals from "@/pages/Admin/AdminWithdrawals";
import AdminRefunds from "@/pages/Admin/AdminRefunds";
import AdminInstructorReview from "@/pages/Admin/AdminInstructorReview";
import WalletAdjust from "@/pages/Admin/WalletAdjust";
import SubscriptionsAdmin from "@/pages/Admin/Subscriptions";
import TopicCategoriesAdmin from "@/pages/Admin/TopicCategoriesAdmin";
import UsersAdmin from "@/pages/Admin/Users";

// ---------- Extras ----------
import ApiSmoke from "@/pages/ApiSmoke";
import Applications from "@/pages/Applications";

// ---------- Pronunciation Module ----------
import PracticePage from "@/pages/Pronunciation/PracticePage";
import HistoryPage from "@/pages/Pronunciation/HistoryPage";
import AttemptDetailPage from "@/pages/Pronunciation/AttemptDetailPage";
import ParagraphsAdminPage from "@/pages/Pronunciation/ParagraphsAdminPage";

import { useAuth } from "@/contexts/AuthContext";

/** Protect any route for authenticated users */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Protect admin-only routes */
function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (!user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/resend-email-confirmation" element={<ResendEmailConfirmation />} />

        {/* User dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* Profile page (protected) */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* User wallet & referrals */}
        <Route
          path="/user/wallet"
          element={
            <RequireAuth>
              <WalletPage />
            </RequireAuth>
          }
        />
        <Route
          path="/user/referrals"
          element={
            <RequireAuth>
              <ReferralsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/user/progress"
          element={
            <RequireAuth>
              <TrackProgressPage />
            </RequireAuth>
          }
        />

        {/* Subscriptions module */}
        <Route
          path="/subscriptions"
          element={
            <RequireAuth>
              <SubscriptionsPage />
            </RequireAuth>
          }
        />

        {/* Coupons */}
        <Route
          path="/user/coupons"
          element={
            <RequireAuth>
              <CouponsPage />
            </RequireAuth>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />

        {/* Topic detail page (protected) */}
        <Route
          path="/topics/:id"
          element={
            <RequireAuth>
              <TopicDetail />
            </RequireAuth>
          }
        />

        {/* Admin area */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="/admin/transactions" element={<RequireAdmin><AdminTransactions /></RequireAdmin>} />
        <Route path="/admin/withdrawals" element={<RequireAdmin><AdminWithdrawals /></RequireAdmin>} />
        <Route path="/admin/refunds" element={<RequireAdmin><AdminRefunds /></RequireAdmin>} />
        <Route path="/admin/instructor-review" element={<RequireAdmin><AdminInstructorReview /></RequireAdmin>} />
        <Route path="/admin/wallet-adjust" element={<RequireAdmin><WalletAdjust /></RequireAdmin>} />
        <Route path="/admin/subscriptions" element={<RequireAdmin><SubscriptionsAdmin /></RequireAdmin>} />
        <Route path="/admin/topic-categories" element={<RequireAdmin><TopicCategoriesAdmin /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><UsersAdmin /></RequireAdmin>} />
        <Route path="/admin/applications" element={<RequireAdmin><Applications /></RequireAdmin>} />

        {/* Pronunciation Module */}
        <Route
          path="/pronunciation"
          element={
            <RequireAuth>
              <PracticePage />
            </RequireAuth>
          }
        />
        <Route
          path="/pronunciation/history"
          element={
            <RequireAuth>
              <HistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/pronunciation/attempts/:id"
          element={
            <RequireAuth>
              <AttemptDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/pronunciation/paragraphs"
          element={
            <RequireAdmin>
              <ParagraphsAdminPage />
            </RequireAdmin>
          }
        />

        {/* Utilities */}
        <Route path="/api-smoke" element={<ApiSmoke />} />

        {/* Fallback */}
        <Route path="*" element={<div className="p-6">Page not found.</div>} />
      </Routes>
    </BrowserRouter>
  );
}
