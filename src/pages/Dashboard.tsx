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
  UserCheck
} from "lucide-react";
import { AttendanceTracker } from "@/components/dashboard/AttendanceTracker";
import { FinancialContributions } from "@/components/dashboard/FinancialContributions";
import { ReportsOverview } from "@/components/dashboard/ReportsOverview";

const Dashboard = () => {
  const [userRole] = useState("registration"); // Mock role - will get from auth context

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