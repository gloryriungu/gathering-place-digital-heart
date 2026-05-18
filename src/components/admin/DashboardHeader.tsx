
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from "lucide-react";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";

export const DashboardHeader = () => {
  return (
    <div className="bg-black text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">
              <span className="hidden sm:inline">MISSION CONTROL CENTER</span>
              <span className="sm:hidden">ADMIN DASHBOARD</span>
            </h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base truncate">
              <span className="hidden sm:inline">Administrative Dashboard - TOT Int</span>
              <span className="sm:hidden">TOT Int Admin</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <PortalSwitcher variant="outline" className="bg-white text-black hover:bg-gray-100 border-white" />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
