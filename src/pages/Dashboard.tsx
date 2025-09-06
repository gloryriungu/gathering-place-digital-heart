import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  Bell,
  Heart,
  BookOpen,
  UserCheck,
  Monitor,
  Shield,
  Activity,
  Ticket
} from "lucide-react";
import { AttendanceTracker } from "@/components/dashboard/AttendanceTracker";
import { FinancialContributions } from "@/components/dashboard/FinancialContributions";
import { ReportsOverview } from "@/components/dashboard/ReportsOverview";
import { MyGiving } from "@/components/dashboard/MyGiving";
import { MyEvents } from "@/components/dashboard/MyEvents";
import { SundaySchoolDashboard } from "@/components/dashboard/SundaySchoolDashboard";
import { TeacherInterface } from "@/components/dashboard/TeacherInterface";
import { ITUserManagement } from "@/components/dashboard/ITUserManagement";
import { ITSystemLogs } from "@/components/dashboard/ITSystemLogs";
import { ITTicketingSystem } from "@/components/dashboard/ITTicketingSystem";
import { ITSystemMonitoring } from "@/components/dashboard/ITSystemMonitoring";
import { ITSecurity } from "@/components/dashboard/ITSecurity";
import { DashboardOverviewStats } from "@/components/dashboard/DashboardOverviewStats";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";

const Dashboard = () => {
  const { isAuthenticated, userRole: authUserRole, loading, signOut, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("user");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (authUserRole) {
      setUserRole(authUserRole);
    }
  }, [authUserRole]);

  // Refresh role when dashboard loads to get latest role changes
  useEffect(() => {
    if (isAuthenticated && refreshRole) {
      refreshRole();
    }
  }, [isAuthenticated, refreshRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getRoleBasedTabs = () => {
    const baseTabs = [
      { value: "overview", label: "Overview", icon: Calendar },
      { value: "profile", label: "Profile", icon: Users },
    ];

    const roleTabs = {
      admin: [
        { value: "reports", label: "Reports", icon: FileText },
        { value: "users", label: "User Management", icon: UserCheck },
        { value: "settings", label: "Settings", icon: Settings },
      ],
      registration: [
        { value: "attendance", label: "Attendance", icon: UserCheck },
        { value: "reports", label: "Reports", icon: FileText },
      ],
      accounts: [
        { value: "contributions", label: "Contributions", icon: DollarSign },
        { value: "reports", label: "Financial Reports", icon: FileText },
      ],
      sunday_school: [
        { value: "sunday-school", label: "Sunday School", icon: BookOpen },
        { value: "reports", label: "Reports", icon: FileText },
      ],
      teacher: [
        { value: "teacher-dashboard", label: "My Class", icon: Users },
        { value: "reports", label: "Reports", icon: FileText },
      ],
      it: [
        { value: "user-management", label: "User Management", icon: Users },
        { value: "system-logs", label: "System Logs", icon: Activity },
        { value: "ticketing", label: "Support Tickets", icon: Ticket },
        { value: "monitoring", label: "System Monitor", icon: Monitor },
        { value: "security", label: "Security", icon: Shield },
      ],
      user: [
        { value: "giving", label: "My Giving", icon: Heart },
        { value: "events", label: "Events", icon: Calendar },
      ]
    };

    return [...baseTabs, ...(roleTabs[userRole as keyof typeof roleTabs] || roleTabs.user)];
  };

  const getUserRoleBadge = () => {
    const roleColors = {
      admin: "destructive" as const,
      registration: "secondary" as const,
      accounts: "default" as const,
      sunday_school: "default" as const,
      teacher: "secondary" as const,
      it: "destructive" as const,
      user: "outline" as const
    };
    
    return (
      <Badge variant={roleColors[userRole as keyof typeof roleColors] || "outline"}>
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Department
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              {getUserRoleBadge()}
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-4 lg:grid-cols-6 w-full">
              {getRoleBasedTabs().map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardOverviewStats />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivityCard />
                <QuickActionsCard />
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceTracker />
            </TabsContent>

            <TabsContent value="contributions">
              <FinancialContributions />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsOverview />
            </TabsContent>

            <TabsContent value="giving">
              <MyGiving />
            </TabsContent>

            <TabsContent value="events">
              <MyEvents />
            </TabsContent>

            <TabsContent value="sunday-school">
              <SundaySchoolDashboard />
            </TabsContent>

            <TabsContent value="teacher-dashboard">
              <TeacherInterface />
            </TabsContent>

            <TabsContent value="user-management">
              <ITUserManagement />
            </TabsContent>

            <TabsContent value="system-logs">
              <ITSystemLogs />
            </TabsContent>

            <TabsContent value="ticketing">
              <ITTicketingSystem />
            </TabsContent>

            <TabsContent value="monitoring">
              <ITSystemMonitoring />
            </TabsContent>

            <TabsContent value="security">
              <ITSecurity />
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Profile management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;