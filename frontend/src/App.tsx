import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import RegisterPage from "./pages/Auth/RegisterPage"
import LoginPage from "./pages/Auth/LoginPage"
import ForgotPassword from "./pages/Auth/ForgotPassword"
import ChangePassword from "./pages/Auth/ChangePassword"
import VerifyEmail from "./pages/Auth/VerifyEmail"
import { useAuthStore } from "./store/authStore"
import { useEffect } from "react"
import HomePage from "./pages/Main/HomePage"
import LoadingSpinner from "./components/LoadingSpinner"

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return <>{children}</>;
};

const RedirectAuthUser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner/> ; 
  }

  return (
    <div>
      <Routes>
        <Route path="/" element=
          {
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={
          <RedirectAuthUser>
            <RegisterPage />
          </RedirectAuthUser>
        } />
        <Route path="/login" element={
          <RedirectAuthUser>
            <LoginPage />
          </RedirectAuthUser>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot" element={
          <RedirectAuthUser>
            <ForgotPassword />
          </RedirectAuthUser>
        } />
        <Route path="/reset-password/:token" element={
          <RedirectAuthUser>
            <ChangePassword />
          </RedirectAuthUser>
        } />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
