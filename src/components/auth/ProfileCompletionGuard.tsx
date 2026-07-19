import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

// Routes where we should NOT force-redirect to profile completion
const EXEMPT_PATHS = [
  "/auth/complete-profile",
  "/privacy-policy",
  "/terms-of-service",
];

/**
 * Global guard: whenever an authenticated OAuth user is missing profile
 * details (phone/address/county), redirect them to /auth/complete-profile
 * no matter which route Supabase dropped them on after the OAuth callback.
 */
export const ProfileCompletionGuard = () => {
  const { isAuthenticated, needsProfileCompletion, isPasswordRecovery, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !needsProfileCompletion) return;
    if (isPasswordRecovery) return;
    if (EXEMPT_PATHS.includes(location.pathname)) return;

    navigate("/auth/complete-profile", { replace: true });
  }, [isAuthenticated, needsProfileCompletion, isPasswordRecovery, loading, location.pathname, navigate]);

  return null;
};

export default ProfileCompletionGuard;
