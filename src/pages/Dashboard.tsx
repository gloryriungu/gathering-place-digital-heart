/**
 * MAIN USER DASHBOARD - ROLE-BASED PORTAL - v2.1
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Strong typing for complex role-based logic
 * - React: Component framework for dynamic dashboard
 * - React Hooks: useState, useEffect, useNavigate for state and routing
 * 
 * FUNCTIONALITY:
 * Central hub that adapts based on user role, providing role-specific features and access:
 * 
 * USER ROLES SUPPORTED:
 * - admin: Full system access with all modules
 * - founder: Advanced analytics, demographics, budget review, all inventory
 * - senior_pastor: Demographics, giving analysis, budget review, activity logs
 * - pastor: Availability management, counseling, ministry oversight
 * - registration: Family applications, attendance tracking, reports
 * - accounts: Giving records, financial analysis, requisitions, budgets
 * - media: Requisitions and inventory for media department
 * - marketing: Requisitions and inventory for marketing department
 * - sunday_school: Sunday school management and reports
 * - teacher: Individual class management
 * - it: User management, system logs, ticketing, monitoring, security, tab management
 * - user: Basic member features (give, events, applications, profile)
 * 
 * CORE FEATURES (ALL USERS):
 * - Overview: Dashboard stats and quick actions
 * - Give: Donation interface
 * - Profile: User profile management
 * - Newsletter: Newsletter subscription
 * 
 * NAVIGATION & SECURITY:
 * - Role-based tab visibility (getRoleBasedTabs function)
 * - Automatic redirection based on role (media → media dashboard, etc.)
 * - Session timeout protection via useInactivityLogout
 * - Authentication check before rendering
 * - Role badge display showing current permissions
 * 
 * DATA INTEGRATION:
 * - Real-time Supabase integration for all features
 * - Attendance tracking and QR scanning
 * - Financial contributions management
 * - Event registration and RSVP
 * - Inventory management per department
 * - Requisition workflow
 * - Advanced analytics and demographics
 * 
 * UI/UX FEATURES:
 * - Tabbed interface with icons for easy navigation
 * - Responsive grid layout adapts to screen size
 * - Loading states while checking authentication
 * - Sign out button easily accessible
 * - Notification bell for alerts
 * - Color-coded role badges for visual identification
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  Ticket,
  Mail,
  CreditCard,
  Cookie
} from "lucide-react";
import { AttendanceTracker } from "@/components/dashboard/AttendanceTracker";
import { FinancialContributions } from "@/components/dashboard/FinancialContributions";
import { ReportsOverview } from "@/components/dashboard/ReportsOverview";
import { ConsolidatedGiving } from "@/components/giving/ConsolidatedGiving";
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
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import { JoinFamilyForm } from "@/components/forms/JoinFamilyForm";
import { MinistriesManager } from "@/components/admin/MinistriesManager";
import { ServeApplicationsManager } from "@/components/admin/ServeApplicationsManager";
import { ApplyToMinistry } from "@/components/dashboard/ApplyToMinistry";
import { ApplyToServe } from "@/components/dashboard/ApplyToServe";
import { BookCounseling } from "@/components/dashboard/BookCounseling";
import { DepartmentInventory } from "@/components/inventory/DepartmentInventory";
import { AllDepartmentsInventory } from "@/components/inventory/AllDepartmentsInventory";
import { RequisitionManager } from "@/components/requisitions/RequisitionManager";
import { GivingAnalysis } from "@/components/accounts/GivingAnalysis";
import { PastorAvailability } from "@/components/pastor/PastorAvailability";
import { ActivityLogs } from "@/components/admin/ActivityLogs";
import { AdvancedAnalytics } from "@/components/founder/AdvancedAnalytics";
import { DemographicsAnalytics } from "@/components/founder/DemographicsAnalytics";
import { BudgetProposals } from "@/components/budget/BudgetProposals";
import { DepartmentTabManager } from "@/components/admin/DepartmentTabManager";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ApplicationStatus } from "@/components/dashboard/ApplicationStatus";
import { ActivityLogVisibilityManager } from "@/components/admin/ActivityLogVisibilityManager";
import CounselingSessionsManagement from "@/components/dashboard/CounselingSessionsManagement";
import PastorCounselingSessions from "@/components/pastor/PastorCounselingSessions";
import { ProgramManagement } from "@/components/pastor/ProgramManagement";
import { ProgramApplicationsManager } from "@/components/pastor/ProgramApplicationsManager";
import { ProgramResourcesEditor } from "@/components/pastor/ProgramResourcesEditor";
import { ProgramQuestionsEditor } from "@/components/pastor/ProgramQuestionsEditor";
import { CandidateProgressViewer } from "@/components/pastor/CandidateProgressViewer";
import { MyDownloads } from "@/components/dashboard/MyDownloads";
import { CookieConsentManager } from "@/components/admin/CookieConsentManager";

const Dashboard = () => {
  const { isAuthenticated, userRole: authUserRole, loading, signOut, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("user");
  const [activeTab, setActiveTab] = useState("overview");
  useInactivityLogout();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Redirect media users to media dashboard
  useEffect(() => {
    console.log('Dashboard redirect check:', { loading, isAuthenticated, authUserRole });
    if (!loading && isAuthenticated && authUserRole === 'media') {
      console.log('Redirecting media user to media dashboard');
      navigate('/media-dashboard');
    }
  }, [isAuthenticated, loading, authUserRole, navigate]);

  // Redirect marketing users to marketing dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && authUserRole === 'marketing') {
      console.log('Redirecting marketing user to marketing dashboard');
      navigate('/marketing-dashboard');
    }
  }, [isAuthenticated, loading, authUserRole, navigate]);

  // Redirect registration users to registration dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && authUserRole === 'registration') {
      console.log('Redirecting registration user to registration dashboard');
      navigate('/registration-dashboard');
    }
  }, [isAuthenticated, loading, authUserRole, navigate]);

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
      { value: "give", label: "Give", icon: Heart },
      { value: "my-downloads", label: "My Downloads", icon: BookOpen },
      { value: "profile", label: "Profile", icon: Users },
      { value: "newsletter", label: "Newsletter", icon: Mail },
      { value: "counseling", label: "Counseling Sessions", icon: Users },
    ];

    const roleTabs = {
      admin: [
        { value: "programs", label: "Programs", icon: BookOpen },
        { value: "ministries", label: "Ministries", icon: Users },
        { value: "serve-management", label: "Serve Management", icon: UserCheck },
        { value: "applications", label: "Applications", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
        { value: "reports", label: "Reports", icon: FileText },
        { value: "users", label: "User Management", icon: UserCheck },
      ],
      founder: [
        { value: "programs", label: "Programs", icon: BookOpen },
        { value: "analytics", label: "Advanced Analytics", icon: Activity },
        { value: "demographics", label: "Demographics", icon: Users },
        { value: "giving-analysis", label: "Giving Analysis", icon: DollarSign },
        { value: "budget-requests", label: "Budget Requests", icon: DollarSign },
        { value: "inventory", label: "All Inventory", icon: Settings },
        { value: "activity-visibility", label: "Activity Visibility", icon: Shield },
        { value: "system-overview", label: "System Overview", icon: Monitor },
        { value: "reports", label: "All Reports", icon: FileText },
        { value: "users", label: "All Users", icon: Users },
      ],
      senior_pastor: [
        { value: "programs", label: "Programs", icon: BookOpen },
        { value: "demographics", label: "Demographics", icon: Users },
        { value: "giving-analysis", label: "Giving Analysis", icon: DollarSign },
        { value: "budget-review", label: "Budget Review", icon: FileText },
        { value: "inventory", label: "All Inventory", icon: Settings },
        { value: "activity-logs", label: "Activity Logs", icon: Activity },
        { value: "users", label: "All Users", icon: Users },
      ],
      pastor: [
        { value: "programs", label: "Programs", icon: BookOpen },
        { value: "availability", label: "My Availability", icon: Calendar },
        { value: "ministries-view", label: "View Ministries", icon: Heart },
        { value: "serve-view", label: "View Departments", icon: UserCheck },
        { value: "users", label: "All Users", icon: Users },
      ],
      registration: [
        { value: "family-applications", label: "Family Applications", icon: FileText },
        { value: "attendance", label: "Attendance", icon: UserCheck },
        { value: "reports", label: "Reports", icon: FileText },
      ],
      accounts: [
        { value: "giving-records", label: "Record Giving", icon: DollarSign },
        { value: "giving-analysis", label: "Giving Analysis", icon: Activity },
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
        { value: "budget-create", label: "Create Budget", icon: Settings },
        { value: "contributions", label: "Contributions", icon: DollarSign },
      ],
      media: [
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
      ],
      marketing: [
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
      ],
      sound: [
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
      ],
      security: [
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "Inventory", icon: Settings },
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
        { value: "programs", label: "Programs", icon: BookOpen },
        { value: "user-management", label: "User Management", icon: Users },
        { value: "system-logs", label: "System Logs", icon: Activity },
        { value: "ticketing", label: "Support Tickets", icon: Ticket },
        { value: "monitoring", label: "System Monitor", icon: Monitor },
        { value: "security", label: "Security", icon: Shield },
        { value: "cookie-consent", label: "Cookie Consent", icon: Cookie },
        { value: "tab-management", label: "Tab Management", icon: Settings },
        { value: "requisitions", label: "Requisitions", icon: FileText },
        { value: "inventory", label: "All Inventory", icon: Settings },
      ],
      user: [
        { value: "events", label: "Events", icon: Calendar },
        { value: "join-family", label: "Join Family", icon: Heart },
        { value: "apply-ministry", label: "Apply to Ministry", icon: Users },
        { value: "apply-serve", label: "Apply to Serve", icon: UserCheck },
        { value: "counseling-book", label: "Book Counseling", icon: Calendar },
      ]
    };

    return [...baseTabs, ...(roleTabs[userRole as keyof typeof roleTabs] || roleTabs.user)];
  };

  const getUserRoleBadge = () => {
    const roleColors = {
      admin: "destructive" as const,
      founder: "destructive" as const,
      senior_pastor: "destructive" as const,
      pastor: "secondary" as const,
      registration: "secondary" as const,
      accounts: "default" as const,
      sunday_school: "default" as const,
      teacher: "secondary" as const,
      it: "destructive" as const,
      media: "default" as const,
      marketing: "default" as const,
      user: "outline" as const
    };

    const roleLabels = {
      admin: "Admin",
      founder: "Founder",
      senior_pastor: "Senior Pastor",
      pastor: "Pastor",
      registration: "Registration", 
      accounts: "Accounts",
      sunday_school: "Sunday School",
      teacher: "Teacher",
      it: "IT",
      media: "Media",
      marketing: "Marketing",
      user: "User"
    };
    
    return (
      <Badge variant={roleColors[userRole as keyof typeof roleColors] || "outline"}>
        {roleLabels[userRole as keyof typeof roleLabels] || "User"} Department
      </Badge>
    );
  };

  return (
    <>
      <Navigation />
      <SidebarProvider>
        <div className="min-h-screen bg-background w-full flex pt-16">
          <Sidebar className="border-r bg-card shadow-sm">
            <SidebarContent className="overflow-y-auto pb-20">
              <div className="p-4 border-b bg-card sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                <div className="mt-2">{getUserRoleBadge()}</div>
              </div>

              <SidebarGroup>
                <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                <SidebarMenu>
                  {getRoleBasedTabs().map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <SidebarMenuItem key={tab.value}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(tab.value)}
                        className={isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'}
                      >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button variant="outline" onClick={signOut} className="w-full">
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                  </div>
                </div>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="hidden">
                  {getRoleBasedTabs().map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} />
                  ))}
                </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardOverviewStats />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApplicationStatus />
                <RecentActivityCard />
              </div>
              
              <QuickActionsCard />
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

            <TabsContent value="give">
              <ConsolidatedGiving />
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

            <TabsContent value="cookie-consent">
              <CookieConsentManager />
            </TabsContent>

            <TabsContent value="tab-management">
              <DepartmentTabManager />
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>

            <TabsContent value="my-downloads">
              <MyDownloads />
            </TabsContent>

            <TabsContent value="join-family">
              <JoinFamilyForm />
            </TabsContent>

            <TabsContent value="ministries">
              <MinistriesManager />
            </TabsContent>

            <TabsContent value="serve-management">
              <ServeApplicationsManager />
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>View all pending applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Application management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              {userRole === 'admin' || userRole === 'founder' || userRole === 'senior_pastor' || userRole === 'accounts' ? (
                <AllDepartmentsInventory />
              ) : (
                <DepartmentInventory 
                  departmentId={userRole} 
                  departmentName={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                />
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <AdvancedAnalytics />
            </TabsContent>

            <TabsContent value="demographics">
              <DemographicsAnalytics />
            </TabsContent>

            <TabsContent value="budget-requests">
              <BudgetProposals userRole={userRole} canReview={true} />
            </TabsContent>

            <TabsContent value="activity-visibility">
              <ActivityLogVisibilityManager />
            </TabsContent>

            <TabsContent value="budget-create">
              <BudgetProposals userRole={userRole} canCreate={true} />
            </TabsContent>


            <TabsContent value="apply-ministry">
              <ApplyToMinistry />
            </TabsContent>

            <TabsContent value="apply-serve">
              <ApplyToServe />
            </TabsContent>

            <TabsContent value="counseling-book">
              <BookCounseling />
            </TabsContent>

            <TabsContent value="newsletter">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Subscription</CardTitle>
                  <CardDescription>Stay connected with weekly inspiration and church updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterSignup showCard={false} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accounts Role Tabs */}
            <TabsContent value="giving-records">
              <FinancialContributions />
            </TabsContent>

            <TabsContent value="giving-analysis">
              <GivingAnalysis />
            </TabsContent>

            <TabsContent value="requisitions">
              <RequisitionManager userRole={userRole} departmentId={userRole} />
            </TabsContent>

            <TabsContent value="budget-review">
              <BudgetProposals userRole={userRole} canReview={true} />
            </TabsContent>

            {/* Pastor Role Tabs */}
            <TabsContent value="programs">
              <Tabs defaultValue="manage">
                <TabsList>
                  <TabsTrigger value="manage">Manage Programs</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                <TabsContent value="manage"><ProgramManagement /></TabsContent>
                <TabsContent value="applications"><ProgramApplicationsManager /></TabsContent>
                <TabsContent value="resources"><ProgramResourcesEditor /></TabsContent>
                <TabsContent value="questions"><ProgramQuestionsEditor /></TabsContent>
                <TabsContent value="progress"><CandidateProgressViewer /></TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="availability">
              <PastorAvailability isPastor={true} />
            </TabsContent>

            <TabsContent value="counseling">
              {userRole === 'pastor' || userRole === 'senior_pastor' ? (
                <PastorCounselingSessions />
              ) : (
                <CounselingSessionsManagement />
              )}
            </TabsContent>

            <TabsContent value="ministries-view">
              <MinistriesManager />
            </TabsContent>

            <TabsContent value="serve-view">
              <ServeApplicationsManager />
            </TabsContent>

            {/* Senior Pastor & Founder Role Tabs */}
            <TabsContent value="activity-logs">
              <ActivityLogs />
            </TabsContent>

            <TabsContent value="system-overview">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Complete system status and health monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DashboardOverviewStats />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <RecentActivityCard />
                    <QuickActionsCard />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <ITUserManagement />
            </TabsContent>

            <TabsContent value="family-applications">
              <Card>
                <CardHeader>
                  <CardTitle>Family Applications</CardTitle>
                  <CardDescription>Review and approve family membership applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Family application management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Department Role Tabs - Available for all departments */}
            <TabsContent value="requisitions">
              <RequisitionManager userRole={userRole} departmentId={userRole === 'admin' || userRole === 'accounts' || userRole === 'it' || userRole === 'founder' || userRole === 'senior_pastor' ? undefined : userRole} />
            </TabsContent>

              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Dashboard;