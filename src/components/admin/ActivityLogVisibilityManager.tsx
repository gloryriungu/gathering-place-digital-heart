import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";

interface VisibilitySettings {
  role: string;
  can_view_all_activity: boolean;
}

export const ActivityLogVisibilityManager = () => {
  const [settings, setSettings] = useState<VisibilitySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log_visibility')
        .select('role, can_view_all_activity')
        .order('role');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
      toast({
        title: "Error",
        description: "Failed to load visibility settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (role: string, currentValue: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('activity_log_visibility')
        .update({
          can_view_all_activity: !currentValue,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('role', role as any);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: `${getRoleLabel(role)} ${!currentValue ? 'can now' : 'can no longer'} view all activity logs`,
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility settings",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      founder: "Founder",
      admin: "Admin",
      senior_pastor: "Senior Pastor",
      pastor: "Pastor",
      registration: "Registration",
      accounts: "Accounts",
      media: "Media",
      marketing: "Marketing",
      sunday_school: "Sunday School",
      teacher: "Teacher",
      it: "IT",
      user: "User",
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    if (role === 'founder') return 'destructive';
    if (['admin', 'senior_pastor'].includes(role)) return 'destructive';
    if (['pastor', 'registration', 'accounts'].includes(role)) return 'default';
    if (['it', 'media', 'marketing'].includes(role)) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log Visibility Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Activity Log Visibility Control</CardTitle>
        </div>
        <CardDescription>
          Manage which roles can view all activity logs in the Recent Activity card. By default, only the founder has access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.role}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {setting.can_view_all_activity ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium cursor-pointer">
                      {getRoleLabel(setting.role)}
                    </Label>
                    <Badge variant={getRoleBadgeVariant(setting.role)}>
                      {setting.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {setting.can_view_all_activity 
                      ? 'Can view all activity logs from all users'
                      : 'Can only view their own activity logs'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={setting.can_view_all_activity}
                onCheckedChange={() => handleToggle(setting.role, setting.can_view_all_activity)}
                disabled={setting.role === 'founder'}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Security Note</h4>
          <p className="text-sm text-muted-foreground">
            The founder role always has full access and cannot be restricted. 
            Be cautious when granting access to activity logs as they may contain sensitive member information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
