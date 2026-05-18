/**
 * ADMIN DASHBOARD - SYSTEM ADMINISTRATION CONTROL PANEL
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Ensures type safety for admin operations
 * - React: Component-based framework for dashboard UI
 * - React Hooks: useState for tab management
 * 
 * FUNCTIONALITY:
 * Main administrative control panel for church administrators with full system access:
 * - Overview Tab: High-level system statistics and quick actions
 * - Dashboard Stats: Key metrics across all church operations
 * - Quick Actions: Common administrative tasks with one-click access
 * - Modules Grid: Access to all system modules and features
 * - Recent Activity: Monitor system-wide changes and user actions
 * - AI Insights: Automated insights and recommendations based on data patterns
 * - Profile: Admin user profile management
 * 
 * ACCESS CONTROL:
 * - Highest level administrative access in the system
 * - Protected by inactivity logout for security
 * - Only accessible to users with 'admin' role
 * - Can manage all aspects of the church management system
 * 
 * ADMINISTRATIVE CAPABILITIES:
 * - Full access to all church management modules
 * - User role and permission management
 * - System-wide configuration and settings
 * - Content management across all sections
 * - Reports and analytics for all departments
 * - Audit trails and activity monitoring
 * 
 * NAVIGATION:
 * - Two-tab interface: Overview and Profile
 * - Simple, clean design for quick access to admin functions
 * - Responsive layout works on all devices
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { QuickActions } from "@/components/admin/QuickActions";
import { ModulesGrid } from "@/components/admin/ModulesGrid";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AIInsights } from "@/components/admin/AIInsights";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { LayoutDashboard, User, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userRoles } = useAuth();
  const isIT = userRoles.includes("it");
  useInactivityLogout();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
              </TabsList>
              {isIT && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/portal-access">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Manage Portal Access
                  </Link>
                </Button>
              )}
            </div>

            <TabsContent value="overview">
              <DashboardStats />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-8">
                  <QuickActions />
                  <ModulesGrid />
                </div>
                <div className="space-y-8">
                  <RecentActivity />
                  <AIInsights />
                </div>
              </div>
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

export default AdminDashboard;
