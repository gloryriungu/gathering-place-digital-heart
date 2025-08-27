import { Navigation } from "@/components/Navigation";
import { PastorDashboardHeader } from "@/components/admin/PastorDashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ContentManagementGrid } from "@/components/admin/ContentManagementGrid";
import { DepartmentVisibilityPanel } from "@/components/admin/DepartmentVisibilityPanel";
import { RecentActivity } from "@/components/admin/RecentActivity";

const PastorsDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <PastorDashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardStats />
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <ContentManagementGrid />
              <DepartmentVisibilityPanel />
            </div>
            <div className="space-y-8">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastorsDashboard;