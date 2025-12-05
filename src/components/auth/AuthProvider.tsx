import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Check for recovery mode IMMEDIATELY on script load (before React)
const RECOVERY_STORAGE_KEY = 'password_recovery_mode';

const checkUrlForRecovery = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  
  // Check search params
  if (params.get('type') === 'recovery') return true;
  
  // Check hash for recovery type or access_token (Supabase puts tokens in hash)
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    if (hashParams.get('type') === 'recovery') return true;
    // If there's an access_token in hash AND we came from a recovery link
    if (hashParams.get('access_token') && window.location.pathname === '/auth') {
      // Check if there's type=recovery in either place
      if (params.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
        return true;
      }
    }
  }
  
  return false;
};

// Check on script load and persist to sessionStorage
const urlHasRecovery = checkUrlForRecovery();
if (urlHasRecovery) {
  sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    // Check sessionStorage first (persists across Supabase redirects)
    const stored = sessionStorage.getItem(RECOVERY_STORAGE_KEY);
    if (stored === 'true') return true;
    // Also check URL on initial load
    return checkUrlForRecovery();
  });
  const { toast } = useToast();

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
    sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        console.log('No role found, defaulting to user');
        setUserRole('user');
        return;
      }

      // Prioritize roles: founder > senior_pastor > admin > it > media > marketing > registration > accounts > sunday_school > teacher > pastor > user
      const roles = data.map(item => item.role);
      console.log('User roles found:', roles);
      
      if (roles.includes('founder')) {
        console.log('Setting role to founder');
        setUserRole('founder');
      } else if (roles.includes('senior_pastor')) {
        console.log('Setting role to senior_pastor');
        setUserRole('senior_pastor');
      } else if (roles.includes('admin')) {
        console.log('Setting role to admin');
        setUserRole('admin');
      } else if (roles.includes('it')) {
        console.log('Setting role to it');
        setUserRole('it');
      } else if (roles.includes('media')) {
        console.log('Setting role to media');
        setUserRole('media');
      } else if (roles.includes('marketing')) {
        console.log('Setting role to marketing');
        setUserRole('marketing');
      } else if (roles.includes('registration')) {
        console.log('Setting role to registration');
        setUserRole('registration');
      } else if (roles.includes('accounts')) {
        console.log('Setting role to accounts');
        setUserRole('accounts');
      } else if (roles.includes('sunday_school')) {
        console.log('Setting role to sunday_school');
        setUserRole('sunday_school');
      } else if (roles.includes('teacher')) {
        console.log('Setting role to teacher');
        setUserRole('teacher');
      } else if (roles.includes('pastor')) {
        console.log('Setting role to pastor');
        setUserRole('pastor');
      } else {
        console.log('Setting role to user (default)');
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, address, county')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        setNeedsProfileCompletion(true);
        return;
      }
      
      // Check if required fields are missing
      const isIncomplete = !data.phone || !data.address || !data.county;
      setNeedsProfileCompletion(isIncomplete);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setNeedsProfileCompletion(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        // Handle PASSWORD_RECOVERY event - set flag to prevent redirect
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery detected via event');
          setIsPasswordRecovery(true);
          sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the role fetch to avoid blocking auth state changes
          setTimeout(() => {
            fetchUserRole(session.user.id);
            checkProfileCompletion(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setNeedsProfileCompletion(false);
        }
        
        setLoading(false);
      }
    );

    // Set up real-time subscription for role changes
    let roleSubscription: any = null;
    
    const setupRoleSubscription = (userId: string) => {
      roleSubscription = supabase
        .channel('user_role_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${userId}`
          },
          () => {
            // Role changed - refresh the role
            fetchUserRole(userId);
          }
        )
        .subscribe();
    };

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        checkProfileCompletion(session.user.id);
        setupRoleSubscription(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (roleSubscription) {
        roleSubscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = 'https://stg.tot.co.ke/';
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to Our Church Community!',
              htmlBody: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333;">Welcome to Our Church Community!</h1>
                  <p>Dear ${userData.first_name || 'Friend'},</p>
                  <p>Thank you for signing up! We're thrilled to have you join our community.</p>
                  <p>Your account has been created successfully. Please check your email to verify your account and complete the registration process.</p>
                  <p>If you have any questions or need assistance, please don't hesitate to reach out to us.</p>
                  <p>God bless you!</p>
                  <br>
                  <p style="color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
                </div>
              `
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
        
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account, then log in.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "You have successfully signed in.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const refreshRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    try {
      // Use direct OAuth redirect instead of popup to avoid opening additional pages
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://stg.tot.co.ke/dashboard',
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Google Sign-In Error",
          description: error.message
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: errorMessage
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear local state regardless of server response
      setUser(null);
      setSession(null);
      setUserRole(null);
      setNeedsProfileCompletion(false);
      
      // Only show error if it's not a "session not found" error
      if (error && !error.message.toLowerCase().includes('session')) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error: any) {
      // Still clear local state even on unexpected errors
      setUser(null);
      setSession(null);
      setUserRole(null);
      setNeedsProfileCompletion(false);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshRole,
    isAuthenticated: !!user,
    needsProfileCompletion,
    isPasswordRecovery,
    clearPasswordRecovery
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
