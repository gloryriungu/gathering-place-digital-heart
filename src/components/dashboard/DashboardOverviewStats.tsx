import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, UserCheck, Calendar, ClipboardCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface UserStats {
  my_giving: number;
  my_attendance: number;
  my_registrations: number;
  upcoming_events: number;
}

const STATS_HIDDEN_KEY = "dashboard_stats_hidden";

export const DashboardOverviewStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    my_giving: 0,
    my_attendance: 0,
    my_registrations: 0,
    upcoming_events: 0
  });
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem(STATS_HIDDEN_KEY) === "true";
  });

  const toggleVisibility = () => {
    const newValue = !isHidden;
    setIsHidden(newValue);
    localStorage.setItem(STATS_HIDDEN_KEY, String(newValue));
  };

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const userEmail = user?.email;
      
      // Fetch user's contributions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount')
        .eq('donor_email', userEmail)
        .gte('contribution_date', startOfMonth.toISOString().split('T')[0])
        .eq('transaction_status', 'success');
      
      const myGiving = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      // Fetch user's attendance this year
      const startOfYear = new Date();
      startOfYear.setMonth(0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let myAttendance = 0;
      if (member) {
        const { count } = await supabase
          .from('attendance_records')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', member.id)
          .gte('service_date', startOfYear.toISOString().split('T')[0]);
        
        myAttendance = count || 0;
      }

      // Fetch user's event registrations
      const { count: registrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user?.id},email.eq.${userEmail}`);

      // Fetch upcoming events count
      const today = new Date().toISOString().split('T')[0];
      const { count: upcomingEvents } = await supabase
        .from('media_content')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'event')
        .eq('status', 'published')
        .gte('publish_date', today);

      setStats({
        my_giving: myGiving,
        my_attendance: myAttendance,
        my_registrations: registrations || 0,
        upcoming_events: upcomingEvents || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVisibility}
          className="text-muted-foreground hover:text-foreground"
        >
          {isHidden ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isHidden ? "Show Stats" : "Hide Stats"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Giving</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isHidden ? "••••••" : formatCurrency(stats.my_giving)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isHidden ? "••" : stats.my_attendance}</div>
            <p className="text-xs text-muted-foreground">Services this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isHidden ? "••" : stats.my_registrations}</div>
            <p className="text-xs text-muted-foreground">Events registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isHidden ? "••" : stats.upcoming_events}</div>
            <p className="text-xs text-muted-foreground">Don't miss out</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
