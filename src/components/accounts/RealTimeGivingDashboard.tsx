import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatAmount, getContributionTypeLabel, getPaymentMethodLabel } from "@/lib/paystack";
import { format } from "date-fns";
import { Download, TrendingUp, DollarSign, Users, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const RealTimeGivingDashboard = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContributions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('contributions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contributions',
        },
        () => {
          loadContributions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setContributions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completed = data.filter(c => c.transaction_status === 'completed');

    setStats({
      today: completed
        .filter(c => new Date(c.created_at) >= today)
        .reduce((sum, c) => sum + c.amount, 0),
      thisWeek: completed
        .filter(c => new Date(c.created_at) >= weekAgo)
        .reduce((sum, c) => sum + c.amount, 0),
      thisMonth: completed
        .filter(c => new Date(c.created_at) >= monthStart)
        .reduce((sum, c) => sum + c.amount, 0),
      totalCount: completed.length
    });
  };

  const filteredContributions = contributions.filter(c => {
    if (filterType !== "all" && c.contribution_type !== filterType) return false;
    if (filterStatus !== "all" && c.transaction_status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        c.donor_name?.toLowerCase().includes(search) ||
        c.donor_email?.toLowerCase().includes(search) ||
        c.donor_phone?.includes(search) ||
        c.transaction_reference?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Name', 'Email', 'Phone', 'Type', 'Amount', 'Method', 'Status', 'Reference'],
      ...filteredContributions.map(c => [
        format(new Date(c.created_at), 'yyyy-MM-dd HH:mm:ss'),
        c.donor_name || '',
        c.donor_email || '',
        c.donor_phone || '',
        c.contribution_type,
        c.amount,
        c.payment_method,
        c.transaction_status,
        c.transaction_reference || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.today)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.thisWeek)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.thisMonth)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time Contributions</CardTitle>
              <CardDescription>Live feed of all giving transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadContributions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tithe">Tithe</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="building_fund">Building Fund</SelectItem>
                  <SelectItem value="missions">Missions</SelectItem>
                  <SelectItem value="community_outreach">Community Outreach</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContributions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No contributions found</p>
              </div>
            ) : (
              filteredContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {contribution.donor_name || 'Anonymous'}
                      </span>
                      <Badge variant={getStatusColor(contribution.transaction_status)}>
                        {contribution.transaction_status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contribution.donor_email || contribution.donor_phone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getContributionTypeLabel(contribution.contribution_type)} •{' '}
                      {getPaymentMethodLabel(contribution.payment_method)} •{' '}
                      {format(new Date(contribution.created_at), 'PPp')}
                    </div>
                    {contribution.transaction_reference && (
                      <div className="text-xs text-muted-foreground">
                        Ref: {contribution.transaction_reference}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatAmount(contribution.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};