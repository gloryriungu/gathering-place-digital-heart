import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useAuth } from "@/components/auth/AuthProvider";
import { PastorDashboardHeader } from "@/components/admin/PastorDashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ContentManagementGrid } from "@/components/admin/ContentManagementGrid";
import { DepartmentVisibilityPanel } from "@/components/admin/DepartmentVisibilityPanel";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { DemographicsAnalytics } from "@/components/founder/DemographicsAnalytics";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { PastorActivityLogs } from "@/components/pastor/PastorActivityLogs";
import { PastorAvailability } from "@/components/pastor/PastorAvailability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, LayoutDashboard, User, Calendar, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const PastorsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userRole } = useAuth();
  const isLeadership = userRole === 'founder' || userRole === 'senior_pastor' || userRole === 'it';
  useInactivityLogout();

  const menuItems = [
    { value: "overview", label: "Overview", icon: LayoutDashboard },
    { value: "counseling", label: "Counseling", icon: Calendar },
    { value: "audit", label: "Activity", icon: Activity },
    { value: "profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <Navigation />
      <SidebarProvider>
        <div className="min-h-screen bg-background w-full flex pt-16">
          <Sidebar className="border-r bg-card shadow-sm">
            <SidebarContent>
              <div className="p-4 border-b bg-card">
                <h2 className="text-lg font-semibold text-foreground">Pastor Dashboard</h2>
              </div>

            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    return (
                      <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.value)}
                        className={isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'}
                      >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 bg-background">
          <PastorDashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center gap-4 mb-8">
                <SidebarTrigger />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="hidden">
                  {menuItems.map((item) => (
                    <TabsTrigger key={item.value} value={item.value} />
                  ))}
                </TabsList>

                <TabsContent value="overview">
                  <DashboardStats />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2 space-y-8">
                      <ContentManagementGrid />
                      <Card className="border-2 border-black">
                        <CardHeader>
                          <CardTitle className="text-xl font-black flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            DEPARTMENT REQUISITIONS
                          </CardTitle>
                          <p className="text-gray-600">Manage department purchase requests and approvals</p>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6">
                            <Button className="font-bold" asChild>
                              <Link to="/requisitions">ACCESS REQUISITIONS SYSTEM</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <DepartmentVisibilityPanel />
                    </div>
                    <div className="space-y-8">
                      <RecentActivity />
                    </div>
                  </div>

                  {/* Demographics Analytics Section */}
                  <div className="mt-8">
                    <DemographicsAnalytics />
                  </div>
                </TabsContent>

                <TabsContent value="counseling">
                  <PastorAvailability isPastor={true} />
                </TabsContent>

                <TabsContent value="audit">
                  <PastorActivityLogs isLeadership={isLeadership} />
                </TabsContent>

                <TabsContent value="profile">
                  <UserProfile />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default PastorsDashboard;
