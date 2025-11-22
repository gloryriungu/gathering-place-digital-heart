import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { AttendanceTracker } from "@/components/dashboard/AttendanceTracker";
import { AttendanceQRScanner } from "@/components/dashboard/AttendanceQRScanner";
import { MemberManagement } from "@/components/registration/MemberManagement";
import { RegistrationDashboardHeader } from "@/components/registration/RegistrationDashboardHeader";
import { ReportsOverview } from "@/components/dashboard/ReportsOverview";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ImportHistory } from "@/components/registration/ImportHistory";
import { MemberLinkingManager } from "@/components/registration/MemberLinkingManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Users, Calendar, FileText, User, Upload, Link2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const RegistrationDashboard = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("qr-scanner");
  useInactivityLogout();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && userRole !== 'registration' && userRole !== 'it') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, userRole, navigate]);

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

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { value: "qr-scanner", label: "QR Scanner", icon: QrCode },
    { value: "attendance", label: "Attendance Tracking", icon: Calendar },
    { value: "members", label: "Member Management", icon: Users },
    { value: "import", label: "Import Members", icon: Upload },
    { value: "linking", label: "Link Members", icon: Link2 },
    { value: "reports", label: "Reports", icon: FileText },
    { value: "profile", label: "Profile", icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Registration Dashboard</h2>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <SidebarMenuItem key={tab.value}>
                        <SidebarMenuButton
                          onClick={() => setActiveTab(tab.value)}
                          className={isActive ? 'bg-primary text-primary-foreground font-medium' : ''}
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
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <Navigation />
          <div className="pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <RegistrationDashboardHeader />
              
              <div className="flex items-center gap-4 mb-8">
                <SidebarTrigger />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="hidden">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} />
                  ))}
                </TabsList>

                <TabsContent value="qr-scanner">
                  <AttendanceQRScanner 
                    selectedDate={new Date().toISOString().split('T')[0]}
                    serviceType="sunday_service"
                  />
                </TabsContent>

                <TabsContent value="attendance">
                  <AttendanceTracker />
                </TabsContent>

                <TabsContent value="members">
                  <MemberManagement />
                </TabsContent>

                <TabsContent value="import">
                  <ImportHistory />
                </TabsContent>

                <TabsContent value="linking">
                  <MemberLinkingManager />
                </TabsContent>

                <TabsContent value="reports">
                  <ReportsOverview />
                </TabsContent>

                <TabsContent value="profile">
                  <UserProfile />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegistrationDashboard;
