/**
 * Pastor Activity Logs Component
 * 
 * Purpose: Displays activity logs for pastors with filtering and audit capabilities
 * Language: TypeScript + React
 * 
 * Features:
 * - Activity log viewing for individual pastors or all pastors (leadership)
 * - Filtering by action type, date range, and pastor
 * - Real-time activity summary statistics
 * - Detailed activity timeline with metadata
 * - Export capabilities for audit reports
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Calendar, Filter, Download, User, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface PastorSummary {
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  availability_changes: number;
  last_activity: string | null;
}

interface PastorActivityLogsProps {
  isLeadership?: boolean;
  targetPastorId?: string;
}

export const PastorActivityLogs = ({ isLeadership = false, targetPastorId }: PastorActivityLogsProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<PastorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [selectedPastor, setSelectedPastor] = useState<string>(targetPastorId || user?.id || "");
  const [pastors, setPastors] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isLeadership) {
      fetchPastors();
    }
    fetchActivities();
    fetchSummary();
  }, [selectedPastor, actionFilter, dateFilter]);

  const fetchPastors = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!inner(first_name, last_name)
        `)
        .in('role', ['pastor', 'senior_pastor']);

      if (error) throw error;

      const pastorList = data?.map((p: any) => ({
        id: p.user_id,
        name: `${p.profiles.first_name} ${p.profiles.last_name}`
      })) || [];

      setPastors(pastorList);
    } catch (error) {
      console.error('Error fetching pastors:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activity_logs')
        .select('*')
        .in('entity_type', ['counseling_session', 'pastor_availability'])
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by pastor
      if (!isLeadership || selectedPastor !== 'all') {
        query = query.eq('user_id', selectedPastor || user?.id);
      }

      // Filter by action
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      // Filter by date
      if (dateFilter !== 'all') {
        const daysAgo = parseInt(dateFilter);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profile data separately for each activity
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(a => a.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, p]) || []
        );

        const activitiesWithProfiles = data.map(activity => ({
          ...activity,
          profiles: profilesMap.get(activity.user_id)
        }));

        setActivities(activitiesWithProfiles as ActivityLog[]);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const pastorId = isLeadership && selectedPastor !== 'all' ? selectedPastor : user?.id;
      if (!pastorId) return;

      const { data, error } = await supabase.rpc('get_pastor_activity_summary', {
        pastor_user_id: pastorId
      });

      if (error) throw error;
      setSummary(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'complete':
        return 'default';
      case 'cancel':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return 'No details';
    if (typeof details === 'string') return details;
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Pastor', 'Action', 'Entity Type', 'Details'];
    const rows = activities.map(activity => [
      format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss'),
      activity.profiles ? `${activity.profiles.first_name} ${activity.profiles.last_name}` : 'Unknown',
      activity.action,
      activity.entity_type,
      formatDetails(activity.details)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pastor-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Activity log exported');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.completed_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.cancelled_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Availability Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.availability_changes}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            {isLeadership ? 'Audit trail for all pastor activities' : 'Your activity history'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isLeadership && (
              <Select value={selectedPastor} onValueChange={setSelectedPastor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pastor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pastors</SelectItem>
                  {pastors.map(pastor => (
                    <SelectItem key={pastor.id} value={pastor.id}>
                      {pastor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="update">Updated</SelectItem>
                <SelectItem value="delete">Deleted</SelectItem>
                <SelectItem value="complete">Completed</SelectItem>
                <SelectItem value="cancel">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  {isLeadership && <TableHead>Pastor</TableHead>}
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isLeadership ? 5 : 4} className="text-center">
                      Loading activities...
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isLeadership ? 5 : 4} className="text-center">
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>No activities found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </TableCell>
                      {isLeadership && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {activity.profiles
                                ? `${activity.profiles.first_name} ${activity.profiles.last_name}`
                                : 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={getActionColor(activity.action)}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">
                          {activity.entity_type.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="text-sm text-muted-foreground">
                          {formatDetails(activity.details)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
