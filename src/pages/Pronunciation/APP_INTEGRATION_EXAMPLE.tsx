/**
 * Example App.tsx Integration
 * 
 * Copy and adapt this example to your actual App.tsx
 * This shows how to add the Pronunciation module routes
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

// ============ Import Pronunciation Pages ============
import PracticePage from './PracticePage';
import HistoryPage from './HistoryPage';
import AttemptDetailPage from './AttemptDetailPage';
import ParagraphsAdminPage from './ParagraphsAdminPage';

// ============ Other Pages (Example) ============
// import Dashboard from './pages/Dashboard';
// import Profile from './pages/Profile';

// ============ Protected Route (Optional) ============
interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

function ProtectedRoute({ children, isAuthenticated, isAdmin }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin && !isUserAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}

// ============ Helper Function ============
function isUserAdmin(): boolean {
  // Implement your admin check logic here
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
}

// ============ Main App Component ============
export default function App() {
  // Check if user is authenticated (uses app-standard key `access_token`)
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/login" element={<LoginPage />} /> */}

        {/* Protected Routes */}

        {/* Pronunciation Module */}
        <Route
          path="/pronunciation"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PracticePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pronunciation/history"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pronunciation/attempts/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AttemptDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/pronunciation/paragraphs"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isAdmin={true}>
              <ParagraphsAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Other existing routes */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/pronunciation" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * ============ ALTERNATIVE: Using Layout Wrapper ============
 * 
 * If you have a shared layout with header/nav, use this pattern:
 * 
 * ```tsx
 * export default function App() {
 *   return (
 *     <Router>
 *       <Layout>
 *         <Routes>
 *           <Route path="/pronunciation" element={<PracticePage />} />
 *           <Route path="/pronunciation/history" element={<HistoryPage />} />
 *           <Route path="/pronunciation/attempts/:id" element={<AttemptDetailPage />} />
 *           <Route path="/admin/pronunciation/paragraphs" element={<ParagraphsAdminPage />} />
 *         </Routes>
 *       </Layout>
 *     </Router>
 *   );
 * }
 * ```
 */

/**
 * ============ ALTERNATIVE: Using Vite + React Router v6 with Lazy Loading ============
 * 
 * For better performance, use code splitting:
 * 
 * import { lazy, Suspense } from 'react';
 * 
 * const PracticePage = lazy(() => import('./pages/Pronunciation/PracticePage'));
 * const HistoryPage = lazy(() => import('./pages/Pronunciation/HistoryPage'));
 * const AttemptDetailPage = lazy(() => import('./pages/Pronunciation/AttemptDetailPage'));
 * const ParagraphsAdminPage = lazy(() => import('./pages/Pronunciation/ParagraphsAdminPage'));
 * 
 * function LoadingSpinner() {
 *   return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
 * }
 * 
 * export default function App() {
 *   return (
 *     <Router>
 *       <Suspense fallback={<LoadingSpinner />}>
 *         <Routes>
 *           <Route path="/pronunciation" element={<PracticePage />} />
 *           <Route path="/pronunciation/history" element={<HistoryPage />} />
 *           <Route path="/pronunciation/attempts/:id" element={<AttemptDetailPage />} />
 *           <Route path="/admin/pronunciation/paragraphs" element={<ParagraphsAdminPage />} />
 *         </Routes>
 *       </Suspense>
 *     </Router>
 *   );
 * }
 */

/**
 * ============ EXAMPLE: Navbar Integration ============
 * 
 * Add to your Navbar/Header component:
 * 
 * import { Link } from 'react-router-dom';
 * import { pronunciationNavLinks } from './pages/Pronunciation/router.config';
 * 
 * export function Navbar() {
 *   const isAdmin = JSON.parse(localStorage.getItem('user') || '{}').role === 'admin';
 * 
 *   return (
 *     <nav>
 *       {pronunciationNavLinks.map(link => {
 *         if (link.adminOnly && !isAdmin) return null;
 *         return (
 *           <Link key={link.path} to={link.path}>
 *             {link.icon} {link.label}
 *           </Link>
 *         );
 *       })}
 *     </nav>
 *   );
 * }
 */

/**
 * ============ ENV SETUP ============
 * 
 * Add to your .env file:
 * 
 * VITE_API_BASE_URL=http://localhost:5000/api/v1
 * 
 * For production:
 * VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
 */

/**
 * ============ AUTHENTICATION FLOW ============
 * 
 * 1. User logs in:
 *    localStorage.setItem('access_token', response.data.token);
 *    localStorage.setItem('edulearn_user', JSON.stringify(response.data.user));
 * 
 * 2. The API service automatically includes the token:
 *    Authorization: Bearer <token>
 * 
 * 3. All Pronunciation routes are protected and require valid token
 * 
 * 4. Token is automatically sent with every request via axios interceptor
 */
