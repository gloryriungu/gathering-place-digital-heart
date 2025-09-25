import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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

      // Prioritize roles: admin > it > media > marketing > registration > accounts > sunday_school > teacher > user
      const roles = data.map(item => item.role);
      console.log('User roles found:', roles);
      
      if (roles.includes('admin')) {
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
      async (event, session) => {
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
      const redirectUrl = `${window.location.origin}/`;
      
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

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/complete-profile`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setUser(null);
        setSession(null);
        setUserRole(null);
        setNeedsProfileCompletion(false);
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred",
        variant: "destructive"
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
    needsProfileCompletion
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};