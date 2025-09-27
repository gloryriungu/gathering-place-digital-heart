
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { QuickActions } from "@/components/admin/QuickActions";
import { ModulesGrid } from "@/components/admin/ModulesGrid";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AIInsights } from "@/components/admin/AIInsights";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
