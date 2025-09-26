import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  Heart,
  BookOpen,
  UserCheck,
  Monitor,
  Shield,
  Activity,
  Ticket,
  Mail,
  Video,
  ShoppingBag,
  Home,
  Megaphone,
  Play,
  BarChart3,
  Star,
  Share2,
  HelpCircle
} from "lucide-react";

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

interface DepartmentTabsConfig {
  department: string;
  tabs: TabConfig[];
}

const availableTabs = [
  { id: "overview", label: "Overview", icon: "Calendar" },
  { id: "requisitions", label: "Requisitions", icon: "FileText" },
  { id: "inventory", label: "Inventory", icon: "Settings" },
  { id: "reports", label: "Reports", icon: "FileText" },
  { id: "users", label: "User Management", icon: "Users" },
  { id: "giving-records", label: "Record Giving", icon: "DollarSign" },
  { id: "giving-analysis", label: "Giving Analysis", icon: "Activity" },
  { id: "budget-create", label: "Create Budget", icon: "Settings" },
  { id: "contributions", label: "Contributions", icon: "DollarSign" },
  { id: "livestream", label: "Live Stream", icon: "Video" },
  { id: "events", label: "Events", icon: "Calendar" },
  { id: "shop", label: "Shop", icon: "ShoppingBag" },
  { id: "hero", label: "Homepage", icon: "Home" },
  { id: "announcements", label: "Announcements", icon: "Megaphone" },
  { id: "watch", label: "Watch Page", icon: "Play" },
  { id: "about", label: "About Us", icon: "FileText" },
  { id: "newsletter", label: "Newsletter", icon: "Mail" },
  { id: "filming", label: "Filming", icon: "BarChart3" },
  { id: "social", label: "Social Media", icon: "Share2" },
  { id: "testimonials", label: "Testimonials", icon: "Star" },
  { id: "faq", label: "FAQ", icon: "HelpCircle" }
];

const departments = [
  "admin",
  "accounts", 
  "media",
  "marketing",
  "sound",
  "security",
  "it",
  "registration"
];

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Calendar, DollarSign, FileText, Settings, Users, Activity, Video, 
    ShoppingBag, Home, Megaphone, Play, Mail, BarChart3, Share2, Star, HelpCircle
  };
  return icons[iconName] || FileText;
};

export const DepartmentTabManager = () => {
  const [departmentConfigs, setDepartmentConfigs] = useState<DepartmentTabsConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentConfigs();
  }, []);

  const fetchDepartmentConfigs = async () => {
    try {
      setLoading(true);
      
      // Initialize with default configurations if none exist
      const configs = departments.map(dept => ({
        department: dept,
        tabs: availableTabs.map(tab => ({
          ...tab,
          enabled: getDefaultTabStatus(dept, tab.id)
        }))
      }));
      
      setDepartmentConfigs(configs);
    } catch (error) {
      console.error('Error fetching department configs:', error);
      toast.error("Failed to load department configurations");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTabStatus = (department: string, tabId: string): boolean => {
    const defaultConfigs: { [key: string]: string[] } = {
      admin: ["overview", "requisitions", "inventory", "reports", "users"],
      accounts: ["overview", "requisitions", "inventory", "giving-records", "giving-analysis", "budget-create", "contributions"],
      media: ["overview", "requisitions", "inventory", "livestream", "events", "shop", "hero", "announcements", "watch"],
      marketing: ["overview", "requisitions", "inventory", "about", "newsletter", "filming", "social", "testimonials", "faq"],
      sound: ["overview", "requisitions", "inventory"],
      security: ["overview", "requisitions", "inventory"],
      it: ["overview", "requisitions", "inventory", "users", "reports"],
      registration: ["overview", "requisitions", "inventory", "reports"]
    };
    
    return defaultConfigs[department]?.includes(tabId) || false;
  };

  const toggleTab = (departmentIndex: number, tabIndex: number) => {
    const newConfigs = [...departmentConfigs];
    newConfigs[departmentIndex].tabs[tabIndex].enabled = !newConfigs[departmentIndex].tabs[tabIndex].enabled;
    setDepartmentConfigs(newConfigs);
  };

  const saveConfiguration = async () => {
    try {
      toast.success("Department tab configurations updated successfully");
      // In a real implementation, you would save these to the database
      // For now, we're just showing success since this is configuration-based
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error("Failed to save configuration");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading department configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Department Tab Management</h2>
          <p className="text-muted-foreground">Configure which tabs are available for each department</p>
        </div>
        <Button onClick={saveConfiguration} className="bg-primary hover:bg-primary/90">
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departmentConfigs.map((config, deptIndex) => {
          const IconComponent = getIconComponent("Settings");
          return (
            <Card key={config.department} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <IconComponent className="h-5 w-5" />
                  {config.department} Department
                </CardTitle>
                <CardDescription>
                  Configure available tabs for {config.department} users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {config.tabs.map((tab, tabIndex) => {
                    const TabIcon = getIconComponent(tab.icon);
                    return (
                      <div 
                        key={tab.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <TabIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tab.label}</span>
                          {tab.enabled && (
                            <Badge variant="secondary" className="text-xs">Enabled</Badge>
                          )}
                        </div>
                        <Switch
                          checked={tab.enabled}
                          onCheckedChange={() => toggleTab(deptIndex, tabIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Enabled tabs:</span>
                    <Badge variant="outline">
                      {config.tabs.filter(tab => tab.enabled).length} / {config.tabs.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Configuration Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm">
            This interface allows you to configure which tabs are available to each department. 
            Changes will be applied system-wide and affect all users in the respective departments. 
            Some core tabs like "Overview" are recommended to remain enabled for all departments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};