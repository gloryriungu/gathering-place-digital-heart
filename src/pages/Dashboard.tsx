import { useState } from "react";
import { Navigation } from "@/components/Navigation";
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

const Dashboard = () => {
  const [userRole, setUserRole] = useState(() => {
    return (localStorage.getItem("userRole") as string) || "user";
  });

  // Quick role switcher for testing (remove in production)
  const handleRoleChange = (role: string) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

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
              <select 
                value={userRole} 
                onChange={(e) => handleRoleChange(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="registration">Registration</option>
                <option value="accounts">Accounts</option>
                <option value="sunday_school">Sunday School</option>
                <option value="teacher">Teacher</option>
                <option value="it">IT</option>
              </select>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week's Attendance</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">856</div>
                    <p className="text-xs text-muted-foreground">69% attendance rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$25,430</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New member joined</p>
                        <p className="text-xs text-muted-foreground">Sarah Johnson joined the family</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sunday service attendance recorded</p>
                        <p className="text-xs text-muted-foreground">856 members attended this week</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Monthly report generated</p>
                        <p className="text-xs text-muted-foreground">Financial summary for November</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Frequently used features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Record Today's Attendance
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Add Contribution
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Member Directory
                    </Button>
                  </CardContent>
                </Card>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Dashboard
                  </CardTitle>
                  <CardDescription>
                    Advanced security monitoring and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Advanced security features coming soon...</p>
                </CardContent>
              </Card>
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