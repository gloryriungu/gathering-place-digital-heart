import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const DISMISS_KEY = 'profile_status_banner_dismissed';

const HIDDEN_PATHS = ['/auth', '/auth/complete-profile'];

export const ProfileStatusBanner = () => {
  const { isAuthenticated, needsProfileCompletion, isPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === 'true');
  }, [isAuthenticated, needsProfileCompletion]);

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  if (!isAuthenticated || isPasswordRecovery || dismissed) return null;
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const incomplete = needsProfileCompletion;

  return (
    <div
      role="status"
      className={`fixed top-16 left-0 right-0 z-40 border-b ${
        incomplete ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-foreground'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {incomplete ? (
          <AlertCircle className="h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        )}
        <p className="text-sm flex-1 leading-snug">
          {incomplete
            ? 'Your profile is incomplete. Add your phone, address and county so we can stay in touch.'
            : 'Your profile is complete. Thank you for keeping your details up to date.'}
        </p>
        {incomplete && (
          <Button
            size="sm"
            variant="default"
            className="shrink-0"
            onClick={() => navigate('/auth/complete-profile')}
          >
            Complete now
          </Button>
        )}
        <button
          type="button"
          aria-label="Dismiss profile notice"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 hover:bg-foreground/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileStatusBanner;
