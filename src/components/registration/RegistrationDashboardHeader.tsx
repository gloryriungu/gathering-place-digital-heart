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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            <span className="hidden sm:inline">Registration Dashboard</span>
            <span className="sm:hidden">Registration</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            <span className="hidden sm:inline">Manage member attendance and registration</span>
            <span className="sm:hidden">Members & Attendance</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs sm:text-sm">
            <span className="hidden sm:inline">Registration Department</span>
            <span className="sm:hidden">Registration</span>
          </Badge>
          <Button variant="outline" onClick={signOut} size="sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Members</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {loading ? '...' : stats.totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  <span className="hidden sm:inline">Today's Attendance</span>
                  <span className="sm:hidden">Today</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {loading ? '...' : stats.todayAttendance.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  <span className="hidden sm:inline">New Members (Week)</span>
                  <span className="sm:hidden">New</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {loading ? '...' : stats.thisWeekNewMembers}
                </p>
              </div>
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  <span className="hidden sm:inline">Attendance Rate</span>
                  <span className="sm:hidden">Rate</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {loading ? '...' : `${stats.attendanceRate}%`}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};