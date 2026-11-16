import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Workspace from "./pages/Workspace.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Navigation Loader
function NavigationLoader() {
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const previousPath = useRef(location.pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Initial page load par loader nahi dikhega
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPath.current = location.pathname;
      return;
    }

    const previous = previousPath.current;
    const current = location.pathname;

    previousPath.current = current;

    // Landing -> Login / Signup
    const isLandingToAuth =
      previous === "/" &&
      (current === "/login" || current === "/signup");

    // Login <-> Signup
    const isAuthNavigation =
      (previous === "/login" || previous === "/signup") &&
      (current === "/login" || current === "/signup");

    // Auth navigation par loader nahi
    if (isLandingToAuth || isAuthNavigation) {
      setLoading(false);
      return;
    }

    // Other navigation par loader
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080b0a]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/15 border-t-white"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

// Public Route
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080b0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/15 border-t-white" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/workspace" replace />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  return (
    <>
      <NavigationLoader />

      <Routes>
        {/* Public Pages */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Pages */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;