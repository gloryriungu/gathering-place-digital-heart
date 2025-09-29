import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const MarketingDashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-primary text-primary-foreground py-4 sm:py-6 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black">
              <span className="hidden sm:inline">MARKETING DEPARTMENT</span>
              <span className="sm:hidden">MARKETING DASHBOARD</span>
            </h1>
            <p className="text-primary-foreground/70 mt-1 text-xs sm:text-sm">
              <span className="hidden sm:inline">Content Management & Public Communications - TOT Int</span>
              <span className="sm:hidden">Communications</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border-border shadow-lg z-50" align="end" forceMount>
                  <DropdownMenuItem className="flex items-center focus:bg-muted">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Marketing Team</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="focus:bg-muted">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};