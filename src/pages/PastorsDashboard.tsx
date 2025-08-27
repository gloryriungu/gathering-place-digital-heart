import { Navigation } from "@/components/Navigation";
import { PastorDashboardHeader } from "@/components/admin/PastorDashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ContentManagementGrid } from "@/components/admin/ContentManagementGrid";
import { DepartmentVisibilityPanel } from "@/components/admin/DepartmentVisibilityPanel";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

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
        </div>
      </div>
    </div>
  );
};

export default PastorsDashboard;