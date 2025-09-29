import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from "lucide-react";

export const PastorDashboardHeader = () => {
  return (
    <div className="bg-primary text-primary-foreground py-4 sm:py-6 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black">
              <span className="hidden sm:inline">PASTORS PORTAL</span>
              <span className="sm:hidden">PASTOR DASHBOARD</span>
            </h1>
            <p className="text-primary-foreground/70 mt-1 text-xs sm:text-sm">
              <span className="hidden sm:inline">Content Management & Department Visibility - TOT Int</span>
              <span className="sm:hidden">Content & Departments</span>
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};