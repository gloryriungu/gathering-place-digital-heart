import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff, UserPlus, LogIn, Users, Calculator, Settings, User, GraduationCap, BookOpen, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const demoAccounts = [
    { email: "admin@tot.com", password: "admin123", role: "Admin", icon: Settings, description: "Full system access" },
    { email: "pastor@tot.com", password: "pastor123", role: "Pastor", icon: BookOpen, description: "Content management & ministry oversight" },
    { email: "registration@tot.com", password: "reg123", role: "Registration", icon: Users, description: "Attendance tracking" },
    { email: "accounts@tot.com", password: "acc123", role: "Accounts", icon: Calculator, description: "Financial management & requisitions" },
    { email: "sundayschool@tot.com", password: "ss123", role: "Sunday School", icon: GraduationCap, description: "Manage children's ministry" },
    { email: "teacher@tot.com", password: "teach123", role: "Teacher", icon: BookOpen, description: "Class management & attendance" },
    { email: "it@tot.com", password: "it123", role: "IT", icon: Monitor, description: "System administration & support" },
    { email: "user@tot.com", password: "user123", role: "User", icon: User, description: "General access" }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check for demo credentials and redirect based on role
    const demoAccount = demoAccounts.find(account => 
      account.email === email && account.password === password
    );
    
    setTimeout(() => {
      setIsLoading(false);
      if (demoAccount) {
        // Store role in localStorage for demo purposes
        localStorage.setItem('userRole', demoAccount.role.toLowerCase().replace(' ', '_'));
        localStorage.setItem('userEmail', demoAccount.email);
        
        // Redirect based on role
        if (demoAccount.role === 'Pastor') {
          navigate("/pastors");
        } else if (demoAccount.role === 'Admin') {
          navigate("/admin");
        } else if (demoAccount.role === 'Accounts') {
          navigate("/requisitions");
        } else {
          navigate("/dashboard");
        }
      } else {
        // For other credentials, default to user role
        localStorage.setItem('userRole', 'user');
        navigate("/dashboard");
      }
    }, 1000);
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('userRole', account.role.toLowerCase().replace(' ', '_'));
      localStorage.setItem('userEmail', account.email);
      
      // Redirect based on role
      if (account.role === 'Pastor') {
        navigate("/pastors");
      } else if (account.role === 'Admin') {
        navigate("/admin");
      } else if (account.role === 'Accounts') {
        navigate("/requisitions");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock signup - will implement with Supabase later
    setTimeout(() => {
      setIsLoading(false);
      navigate("/join-the-family");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Join our family or continue your journey</p>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border shadow-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Log In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Welcome back! Please sign in to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join our church family today! Create your account to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <div className="relative">
                        <Input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Join Our Family"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Demo Accounts Section */}
          <Card className="mt-6 backdrop-blur-sm bg-card/80 border">
            <CardHeader>
              <CardTitle className="text-lg">Demo Accounts</CardTitle>
              <CardDescription>
                Quick login with pre-configured roles to explore the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.role}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent/50"
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <account.icon className="h-4 w-4" />
                      <Badge variant="secondary" className="text-xs">
                        {account.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {account.description}
                    </p>
                    <p className="text-xs font-mono text-left">
                      {account.email}
                    </p>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Need help? <Button variant="link" className="p-0 h-auto">Contact us</Button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;