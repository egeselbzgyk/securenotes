import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./auth-context";
import { RouterProvider, useRouter } from "./router";
import { AuthPage } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { VerifyEmail } from "./pages/verify-email";
import { ResetPassword } from "./pages/reset-password";
import { SharedNote } from "./pages/shared-note";
import { Datenschutz, Impressum } from "./pages/static";
import "./index.css";

// Handle initial non-hash paths (e.g. from email links)
// If the backend redirects to /verify-email, we need to correct it to /#/verify-email
// for the HashRouter to pick it up, or handle it here.
if (window.location.pathname === "/verify-email") {
  window.location.href = `/#/verify-email${window.location.search}`;
}
if (window.location.pathname === "/reset-password") {
  window.location.href = `/#/reset-password${window.location.search}`;
}

const AppRoutes: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect logged-in users away from auth page
    if (user && path === "/auth") {
      navigate("/");
    }
  }, [user, path, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 bg-white dark:bg-[#111821] dark:text-gray-400">
        Lädt...
      </div>
    );
  }

  // Public Routes
  if (path === "/datenschutz") return <Datenschutz />;
  if (path === "/impressum") return <Impressum />;
  if (path.startsWith("/verify-email")) return <VerifyEmail />;
  if (path.startsWith("/reset-password")) return <ResetPassword />;

  // Auth Route
  if (!user) {
    return <AuthPage />;
  }

  // Protected Routes (require login)
  if (path.startsWith("/note/")) return <SharedNote />;

  // Protected Route (Dashboard)
  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
