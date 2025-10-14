import { useState } from "react";
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
import { LayoutDashboard, User } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  useInactivityLogout();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
