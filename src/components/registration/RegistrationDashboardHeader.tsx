import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, UserPlus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationStats {
  totalMembers: number;
  todayAttendance: number;
  thisWeekNewMembers: number;
  attendanceRate: number;
}

export const RegistrationDashboardHeader = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<RegistrationStats>({
    totalMembers: 0,
    todayAttendance: 0,
    thisWeekNewMembers: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total active members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAttendance } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('service_date', today);

      // Get this week's new members
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: thisWeekNewMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())
        .eq('status', 'active');

      // Calculate attendance rate
      const attendanceRate = totalMembers && todayAttendance 
        ? Math.round((todayAttendance / totalMembers) * 100) 
        : 0;

      setStats({
        totalMembers: totalMembers || 0,
        todayAttendance: todayAttendance || 0,
        thisWeekNewMembers: thisWeekNewMembers || 0,
        attendanceRate
      });
    } catch (error) {
      console.error('Error fetching registration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registration Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage member attendance and registration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Registration Department
          </Badge>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Attendance</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.todayAttendance.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Members (Week)</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.thisWeekNewMembers}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : `${stats.attendanceRate}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};