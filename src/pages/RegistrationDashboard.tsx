/**
 * REGISTRATION DASHBOARD - MEMBER & ATTENDANCE MANAGEMENT
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Provides strong typing for registration and member data structures
 * - React: Component-based UI framework for the dashboard interface
 * - React Hooks: useState, useEffect, useNavigate for state and navigation management
 * 
 * FUNCTIONALITY:
 * Centralized dashboard for church registration staff to manage all member-related operations:
 * - QR Scanner: Quick attendance check-in using QR codes for contactless registration
 * - Attendance Tracking: Record and monitor service attendance across different services
 * - Member Management: Add, edit, view, and organize member information
 * - Import Members: Bulk upload members from CSV/Excel files
 * - Link Members: Connect duplicate profiles and family relationships
 * - Reports: Generate attendance and membership reports
 * - Profile: View and update personal user profile
 * 
 * ACCESS CONTROL:
 * - Restricted to users with 'registration' or 'it' roles
 * - Auto-redirects unauthorized users to appropriate dashboards
 * - Implements session timeout via useInactivityLogout hook
 * - Checks authentication status before rendering content
 * 
 * DATA MANAGEMENT:
 * - Integrates with Supabase for real-time data synchronization
 * - Handles member import history and validation
 * - Supports family linking and relationship management
 * - Generates comprehensive attendance and membership reports
 */
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
import { Users, Calendar, FileText, User, Upload, Link2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegistrationDashboard = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RegistrationDashboardHeader />
          
          <Tabs defaultValue="qr-scanner" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 h-auto bg-muted p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
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
  );
};

export default RegistrationDashboard;