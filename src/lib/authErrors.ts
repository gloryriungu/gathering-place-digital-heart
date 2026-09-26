export const SUPPORT_EMAIL = 'info@tot.co.ke';

export interface FriendlyError {
  title: string;
  description: string;
  /** Suggested next step the UI can offer, e.g. reset password */
  action?: 'reset-password' | 'google' | 'retry' | 'support';
}

const normalise = (message?: string) => (message || '').toLowerCase();

/**
 * Turns raw Supabase auth errors into plain-language guidance with a recovery step.
 */
export const getSignInErrorMessage = (error: any): FriendlyError => {
  const msg = normalise(error?.message);
  const status = error?.status;

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return {
      title: 'Email or password not recognised',
      description:
        'Check your email address and password and try again. If you first joined using Google, use the "Continue with Google" button instead. Otherwise use "Forgot password" to set a new one.',
      action: 'reset-password',
    };
  }

  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return {
      title: 'Email not verified yet',
      description:
        'We sent a verification link when you signed up. Open it from your inbox (check spam too), then sign in again.',
      action: 'support',
    };
  }

  if (msg.includes('too many') || status === 429) {
    return {
      title: 'Too many attempts',
      description: 'For your security, please wait about 5 minutes and then try signing in again.',
      action: 'retry',
    };
  }

  if (msg.includes('user not found') || msg.includes('no user')) {
    return {
      title: 'No account with that email',
      description: 'Double-check the spelling, or create a new account using the Sign Up tab.',
      action: 'support',
    };
  }

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return {
      title: 'Connection problem',
      description: 'We could not reach the server. Check your internet connection and try again.',
      action: 'retry',
    };
  }

  if (msg.includes('password') && msg.includes('short')) {
    return {
      title: 'Password too short',
      description: 'Use at least 6 characters, mixing letters and numbers.',
      action: 'retry',
    };
  }

  return {
    title: 'We could not sign you in',
    description: `Please try once more. If it keeps happening, contact us at ${SUPPORT_EMAIL} and mention what you were doing.`,
    action: 'support',
  };
};

/**
 * Turns raw database errors from saving a profile into plain-language guidance.
 */
export const getProfileSaveErrorMessage = (error: any): FriendlyError => {
  const msg = normalise(error?.message);
  const code = error?.code;

  if (msg.includes('permission denied') || code === '42501' || code === '42883') {
    return {
      title: 'Your account does not have permission to save yet',
      description: `Please sign out, sign back in and try again. If the message returns, email ${SUPPORT_EMAIL} so we can unlock your account.`,
      action: 'support',
    };
  }

  if (msg.includes('row-level security') || code === 'PGRST301') {
    return {
      title: 'Your session has expired',
      description: 'Please sign in again, then finish your profile.',
      action: 'support',
    };
  }

  if (msg.includes('duplicate') || code === '23505') {
    return {
      title: 'Those details are already on another account',
      description: `The phone number or email may already be registered. Use different details or email ${SUPPORT_EMAIL} to merge the accounts.`,
      action: 'support',
    };
  }

  if (msg.includes('violates not-null') || code === '23502') {
    return {
      title: 'Some required details are missing',
      description: 'Please fill in your name, phone number, address and county, then save again.',
      action: 'retry',
    };
  }

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return {
      title: 'Connection problem',
      description: 'Your details were not saved. Check your internet connection and press Save again.',
      action: 'retry',
    };
  }

  return {
    title: 'We could not save your details',
    description: `Please try again. If the problem continues, email ${SUPPORT_EMAIL} and we will help you finish.`,
    action: 'support',
  };
};
