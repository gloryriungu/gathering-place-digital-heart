import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, UserPlus, MapPin, Phone, User, ArrowLeft, Mail, KeyRound, Camera } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Kenya counties list
const kenyaCounties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
  "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira",
  "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

// Recovery mode storage key - must match AuthProvider
const RECOVERY_STORAGE_KEY = 'password_recovery_mode';

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, isAuthenticated, needsProfileCompletion, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  // Initialize from sessionStorage - set by index.html BEFORE any JS loads
  const [resetPasswordMode, setResetPasswordMode] = useState(() => {
    const stored = sessionStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';
    console.log('[Auth] Recovery mode on mount:', stored || isPasswordRecovery);
    return stored || isPasswordRecovery;
  });

  // Also update resetPasswordMode when isPasswordRecovery changes
  useEffect(() => {
    if (isPasswordRecovery) {
      setResetPasswordMode(true);
    }
  }, [isPasswordRecovery]);

  // Redirect authenticated users - but NEVER if in recovery mode
  useEffect(() => {
    // Check sessionStorage directly as well for extra safety
    const storedRecovery = sessionStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';
    
    // Skip ALL redirects if ANY recovery indicator is true
    if (isPasswordRecovery || resetPasswordMode || storedRecovery) {
      console.log('Blocking redirect - in password recovery mode');
      return;
    }
    
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        navigate('/auth/complete-profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsProfileCompletion, navigate, resetPasswordMode, isPasswordRecovery]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    password: '',
    confirmPassword: '',
    photographyConsent: false,
    acceptedTerms: false,
    churchUpdatesOptIn: false,
  });

  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Reset password form state
  const [resetPasswordForm, setResetPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpForm.acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "You must accept the Privacy Policy and Terms of Service to create an account.",
        variant: "destructive"
      });
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (signUpForm.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        first_name: signUpForm.firstName,
        last_name: signUpForm.lastName,
        phone: signUpForm.phone,
        address: signUpForm.address,
        county: signUpForm.county,
        photography_consent: signUpForm.photographyConsent,
      };
      
      const { error } = await signUp(signUpForm.email, signUpForm.password, userData);

      if (!error) {
        // Switch to login tab
        setActiveTab("login");
        // Reset form
        setSignUpForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          county: '',
          password: '',
          confirmPassword: '',
          photographyConsent: false,
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: 'https://stg.tot.co.ke/auth?type=recovery',
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Sent",
          description: "Check your email for a password reset link.",
        });
        setForgotPasswordMode(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (resetPasswordForm.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // First check if we have an active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Your reset link has expired. Please request a new password reset.",
          variant: "destructive"
        });
        // Clear recovery state and show forgot password form
        clearPasswordRecovery();
        setResetPasswordMode(false);
        setForgotPasswordMode(true);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: resetPasswordForm.password
      });

      if (error) {
        // Check if it's a session-related error
        if (error.message.includes('session') || error.message.includes('Session')) {
          toast({
            title: "Session Expired",
            description: "Your reset link has expired. Please request a new password reset.",
            variant: "destructive"
          });
          clearPasswordRecovery();
          setResetPasswordMode(false);
          setForgotPasswordMode(true);
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset. You can now sign in.",
        });
        // Clear ALL recovery state
        clearPasswordRecovery();
        setResetPasswordMode(false);
        setResetPasswordForm({ password: '', confirmPassword: '' });
        // Sign out user and redirect to login
        await supabase.auth.signOut();
        navigate('/auth', { replace: true });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try requesting a new reset link.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Form UI
  if (resetPasswordMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your new password below
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-card/95 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <KeyRound className="h-6 w-6" />
                  New Password
                </CardTitle>
                <CardDescription className="text-center">
                  Choose a strong password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={resetPasswordForm.password}
                        onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={resetPasswordForm.confirmPassword}
                      onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {resetPasswordForm.password && resetPasswordForm.confirmPassword && (
                    <p className={`text-sm ${resetPasswordForm.password === resetPasswordForm.confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                      {resetPasswordForm.password === resetPasswordForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Form UI
  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your email to receive a password reset link
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-card/95 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Mail className="h-6 w-6" />
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center">
                  We'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setForgotPasswordMode(false)}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
            <p className="text-muted-foreground mt-2">
              Join our church family or sign in to continue
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-card/95 shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join Us
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                  <CardDescription className="text-center">
                    Welcome back! Please enter your credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm"
                        onClick={() => setForgotPasswordMode(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl text-center">Join Our Family</CardTitle>
                  <CardDescription className="text-center">
                    Create an account to become part of our community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={signUpForm.firstName}
                            onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                            className="pl-9"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={signUpForm.lastName}
                          onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+254 700 000 000"
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Your address"
                          value={signUpForm.address}
                          onChange={(e) => setSignUpForm({ ...signUpForm, address: e.target.value })}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="county">County</Label>
                      <Select
                        value={signUpForm.county}
                        onValueChange={(value) => setSignUpForm({ ...signUpForm, county: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your county" />
                        </SelectTrigger>
                        <SelectContent>
                          {kenyaCounties.map((county) => (
                            <SelectItem key={county} value={county}>
                              {county}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {signUpForm.password && signUpForm.confirmPassword && (
                      <p className={`text-sm ${signUpForm.password === signUpForm.confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                        {signUpForm.password === signUpForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}

                    <div className="flex items-start space-x-3 rounded-md border border-border p-3">
                      <Checkbox
                        id="photographyConsent"
                        checked={signUpForm.photographyConsent}
                        onCheckedChange={(checked) => setSignUpForm({ ...signUpForm, photographyConsent: checked === true })}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="photographyConsent" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          Photography & Videography Consent
                          <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          I consent to being photographed and/or recorded during church services and events. 
                          Images and videos may be used for church communications, social media, and promotional materials 
                          in accordance with Kenya's Data Protection Act, 2019.
                        </p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
