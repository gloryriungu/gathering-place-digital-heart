import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AttendanceTracker } from "@/components/dashboard/AttendanceTracker";
import { MemberManagement } from "@/components/registration/MemberManagement";
import { RegistrationDashboardHeader } from "@/components/registration/RegistrationDashboardHeader";
import { ReportsOverview } from "@/components/dashboard/ReportsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, FileText, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegistrationDashboard = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

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
    { value: "attendance", label: "Attendance Tracking", icon: Calendar },
    { value: "members", label: "Member Management", icon: Users },
    { value: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RegistrationDashboardHeader />
          
          <Tabs defaultValue="attendance" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="attendance">
              <AttendanceTracker />
            </TabsContent>

            <TabsContent value="members">
              <MemberManagement />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsOverview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashboard;