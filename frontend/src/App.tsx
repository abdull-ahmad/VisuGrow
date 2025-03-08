import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ChangePassword from "./pages/Auth/ChangePassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import UploadDataPage from "./pages/Data/UploadDataPage";
import HomePage from "./pages/Main/HomePage";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import VisualizationPage from "./pages/Visualization/VisualizationPage";
import { useAuthStore } from "./store/authStore";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return <>{children}</>;
};

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  const publicRoutes = [
    { path: "/", element: <HomePage /> },
    { path: "/register", element: <RegisterPage />, wrapper: AuthRedirect },
    { path: "/login", element: <LoginPage />, wrapper: AuthRedirect },
    { path: "/verify-email", element: <VerifyEmail />, wrapper: AuthRedirect },
    { path: "/forgot", element: <ForgotPassword />, wrapper: AuthRedirect },
    { path: "/reset-password/:token", element: <ChangePassword />, wrapper: AuthRedirect },
  ];

  const protectedRoutes = [
    { path: "/upload", element: <UploadDataPage /> },
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/visualization", element: <VisualizationPage /> },
  ];

  return (
    <div>
      <Routes>
        {publicRoutes.map(({ path, element, wrapper: Wrapper }) => (
          <Route
            key={path}
            path={path}
            element={Wrapper ? <Wrapper>{element}</Wrapper> : element}
          />
        ))}
        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<RequireAuth>{element}</RequireAuth>}
          />
        ))}
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;