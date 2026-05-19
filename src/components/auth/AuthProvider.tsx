import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Storage key for password recovery mode - set by index.html before any JS loads
const RECOVERY_STORAGE_KEY = 'password_recovery_mode';

// Simple helper to check sessionStorage - the index.html script sets this BEFORE Supabase loads
const isRecoveryModeActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  userRoles: string[];
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  switchActiveRole: (role: string) => void;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const ACTIVE_ROLE_STORAGE_KEY = 'active_portal_role';

const ROLE_PRIORITY = [
  'founder', 'senior_pastor', 'admin', 'it', 'media', 'marketing',
  'registration', 'accounts', 'sunday_school', 'teacher', 'pastor',
  'sound', 'security', 'user'
];

const pickPrimaryRole = (roles: string[]): string => {
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return r;
  }
  return 'user';
};

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
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  // Check sessionStorage - this is set by index.html before Supabase can clear the hash
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(isRecoveryModeActive);
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
        setUserRoles(['user']);
        setUserRole('user');
        return;
      }

      const roles = Array.from(new Set(data.map((item: any) => item.role as string)));
      console.log('User roles found:', roles);
      setUserRoles(roles);

      // Honor previously-selected active portal if user still has access to it
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY)
        : null;
      if (stored && roles.includes(stored)) {
        setUserRole(stored);
      } else {
        const primary = pickPrimaryRole(roles);
        setUserRole(primary);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, primary);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRoles(['user']);
      setUserRole('user');
    }
  };

  const switchActiveRole = (role: string) => {
    if (!userRoles.includes(role)) {
      console.warn(`Cannot switch to role "${role}" — user does not have it.`);
      return;
    }
    setUserRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
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
          setUserRoles([]);
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
        // Add to newsletter subscribers if opted in
        if (userData.church_updates_opt_in) {
          try {
            await supabase.from('newsletter_subscribers').insert({
              email: email.toLowerCase(),
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              is_active: true,
              source: 'signup_form',
              tags: ['church_updates', 'signup_opt_in'],
              metadata: {
                subscribed_from: '/auth',
                opt_in_type: 'signup_consent',
              },
            });
          } catch (newsletterError) {
            console.error('Failed to add to newsletter:', newsletterError);
          }
        }

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
          redirectTo: 'https://stg.tot.co.ke/auth/complete-profile',
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
      setUserRoles([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
      }
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
      setUserRoles([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
      }
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
    userRoles,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshRole,
    switchActiveRole,
    isAuthenticated: !!user,
    needsProfileCompletion,
    isPasswordRecovery,
    clearPasswordRecovery
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
