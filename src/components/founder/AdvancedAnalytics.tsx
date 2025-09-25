import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar, Activity, Target, Download } from "lucide-react";

interface AnalyticsData {
  membershipGrowth: Array<{ month: string; members: number }>;
  givingTrends: Array<{ period: string; amount: number }>;
  departmentActivity: Array<{ department: string; applications: number; active_members: number }>;
  sessionTypes: Array<{ type: string; count: number }>;
  contributionTypes: Array<{ type: string; amount: number }>;
  monthlyStats: {
    totalMembers: number;
    totalGiving: number;
    activeApplications: number;
    completedSessions: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12_months');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
      const now = new Date();
      const months = timeRange === '12_months' ? 12 : timeRange === '6_months' ? 6 : 3;
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

      // Fetch membership growth data
      const membershipData = await fetchMembershipGrowth(startDate);
      
      // Fetch giving trends
      const givingData = await fetchGivingTrends(startDate);
      
      // Fetch department activity
      const departmentData = await fetchDepartmentActivity();
      
      // Fetch counseling session types
      const sessionData = await fetchSessionTypes(startDate);
      
      // Fetch contribution types breakdown
      const contributionData = await fetchContributionTypes(startDate);
      
      // Fetch monthly stats
      const monthlyStats = await fetchMonthlyStats();

      setAnalytics({
        membershipGrowth: membershipData,
        givingTrends: givingData,
        departmentActivity: departmentData,
        sessionTypes: sessionData,
        contributionTypes: contributionData,
        monthlyStats
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipGrowth = async (startDate: Date) => {
    const { data, error } = await supabase
      .from('join_family_applications')
      .select('application_date')
      .eq('status', 'approved')
      .gte('application_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Group by month
    const monthlyData = (data || []).reduce((acc, item) => {
      const month = new Date(item.application_date).toLocaleDateString('default', { 
        month: 'short', 
        year: '2-digit' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData).map(([month, members]) => ({ month, members }));
  };

  const fetchGivingTrends = async (startDate: Date) => {
    const { data, error } = await supabase
      .from('contributions')
      .select('contribution_date, amount')
      .gte('contribution_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Group by month
    const monthlyData = (data || []).reduce((acc, item) => {
      const month = new Date(item.contribution_date).toLocaleDateString('default', { 
        month: 'short', 
        year: '2-digit' 
      });
      acc[month] = (acc[month] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData).map(([period, amount]) => ({ 
      period, 
      amount: Math.round(amount * 100) / 100 
    }));
  };

  const fetchDepartmentActivity = async () => {
    const { data: applications, error: appError } = await supabase
      .from('serve_applications')
      .select('department_id, status');

    if (appError) throw appError;

    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role');

    if (roleError) throw roleError;

    // Count applications and active members by department
    const departments = ['media', 'sound', 'security', 'registration', 'accounts'];
    return departments.map(dept => ({
      department: dept,
      applications: (applications || []).filter(app => app.department_id === dept).length,
      active_members: (roles || []).filter(role => role.role === dept).length
    }));
  };

  const fetchSessionTypes = async (startDate: Date) => {
    const { data, error } = await supabase
      .from('counseling_sessions')
      .select('session_type')
      .gte('session_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const typeCounts = (data || []).reduce((acc, session) => {
      acc[session.session_type] = (acc[session.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({ 
      type: type.replace('_', ' '), 
      count 
    }));
  };

  const fetchContributionTypes = async (startDate: Date) => {
    const { data, error } = await supabase
      .from('contributions')
      .select('contribution_type, amount')
      .gte('contribution_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const typeAmounts = (data || []).reduce((acc, contribution) => {
      acc[contribution.contribution_type] = (acc[contribution.contribution_type] || 0) + Number(contribution.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeAmounts).map(([type, amount]) => ({ 
      type: type.replace('_', ' '), 
      amount: Math.round(amount * 100) / 100 
    }));
  };

  const fetchMonthlyStats = async () => {
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const [membersResult, givingResult, applicationsResult, sessionsResult] = await Promise.all([
      supabase.from('join_family_applications').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabase.from('contributions').select('amount').gte('contribution_date', thisMonth + '-01'),
      supabase.from('serve_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('counseling_sessions').select('id', { count: 'exact' }).eq('status', 'completed').gte('session_date', thisMonth + '-01')
    ]);

    const totalGiving = (givingResult.data || []).reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      totalMembers: membersResult.count || 0,
      totalGiving: Math.round(totalGiving * 100) / 100,
      activeApplications: applicationsResult.count || 0,
      completedSessions: sessionsResult.count || 0
    };
  };

  const exportData = async () => {
    try {
      // Create CSV content
      const csvContent = `
Analytics Report - ${new Date().toLocaleDateString()}

Monthly Stats:
Total Members,${analytics?.monthlyStats.totalMembers || 0}
Total Giving This Month,$${analytics?.monthlyStats.totalGiving || 0}
Pending Applications,${analytics?.monthlyStats.activeApplications || 0}
Completed Sessions,${analytics?.monthlyStats.completedSessions || 0}

Membership Growth:
${analytics?.membershipGrowth.map(item => `${item.month},${item.members}`).join('\n')}

Giving Trends:
${analytics?.givingTrends.map(item => `${item.period},$${item.amount}`).join('\n')}
      `.trim();

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Analytics report exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and trends analysis</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3_months">Last 3 Months</SelectItem>
              <SelectItem value="6_months">Last 6 Months</SelectItem>
              <SelectItem value="12_months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Members</span>
              </div>
              <div className="text-2xl font-bold">{analytics.monthlyStats.totalMembers}</div>
              <div className="text-xs text-muted-foreground">Approved applications</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-2xl font-bold">${analytics.monthlyStats.totalGiving}</div>
              <div className="text-xs text-muted-foreground">Total giving</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold">{analytics.monthlyStats.activeApplications}</div>
              <div className="text-xs text-muted-foreground">Applications to review</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <div className="text-2xl font-bold">{analytics.monthlyStats.completedSessions}</div>
              <div className="text-xs text-muted-foreground">Counseling sessions</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1 */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Membership Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.membershipGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="members" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giving Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.givingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 2 */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Department Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departmentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                  <Bar dataKey="active_members" fill="#82ca9d" name="Active Members" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contribution Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.contributionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analytics.contributionTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tables */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Counseling Session Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.sessionTypes.map((session, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{session.type}</TableCell>
                      <TableCell className="text-right">{session.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Active Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.departmentActivity.map((dept, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{dept.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dept.applications}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{dept.active_members}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};