/**
 * PASTOR'S DASHBOARD - MINISTRY LEADERSHIP PORTAL
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Ensures type safety across the pastor dashboard features
 * - React: Component-based framework for building the interactive dashboard UI
 * - React Hooks: useState for managing active tab state
 * 
 * FUNCTIONALITY:
 * Comprehensive dashboard designed specifically for pastoral staff to manage church operations:
 * - Overview tab: Displays key ministry statistics and metrics
 * - Content Management: Manage website content, sermons, and media
 * - Department Visibility: Control which departments are visible to different users
 * - Requisitions System: Review and approve department purchase requests
 * - Demographics Analytics: View member demographics and growth patterns
 * - Recent Activity: Monitor recent changes and updates across the system
 * - Profile: View and update personal pastor profile information
 * 
 * ACCESS CONTROL:
 * - Protected by useInactivityLogout hook for automatic session timeout
 * - Only accessible to users with 'pastor' or 'senior_pastor' roles
 * - Provides high-level oversight of church management functions
 * 
 * NAVIGATION:
 * - Uses tabbed interface for easy navigation between different management areas
 * - Responsive design adapts to different screen sizes
 * - Integrates with main site navigation component
 */
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
import { FileText, LayoutDashboard, User, Calendar, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const PastorsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userRole } = useAuth();
  const isLeadership = userRole === 'founder' || userRole === 'senior_pastor' || userRole === 'it';
  useInactivityLogout();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <PastorDashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="counseling" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Counseling
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
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
  );
};

export default PastorsDashboard;