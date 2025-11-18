import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, getContributionTypeLabel, getPaymentMethodLabel } from "@/lib/paystack";
import { format } from "date-fns";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

export const GivingHistory = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    totalAllTime: 0,
    contributionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGivingData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('giving-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contributions',
        },
        () => {
          loadGivingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGivingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get member_id
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch contributions
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('transaction_status', 'completed')
        .order('contribution_date', { ascending: false });

      if (member) {
        query = query.or(`member_id.eq.${member.id},donor_email.eq.${user.email}`);
      } else {
        query = query.eq('donor_email', user.email);
      }

      const { data, error } = await query;

      if (error) throw error;

      setContributions(data || []);

      // Calculate stats
      const now = new Date();
      const thisMonth = data?.filter(c => {
        const date = new Date(c.contribution_date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }) || [];

      setStats({
        totalThisMonth: thisMonth.reduce((sum, c) => sum + c.amount, 0),
        totalAllTime: data?.reduce((sum, c) => sum + c.amount, 0) || 0,
        contributionCount: data?.length || 0
      });

    } catch (error) {
      console.error('Error loading giving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Total This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.totalThisMonth)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Total All Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.totalAllTime)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contributionCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giving History</CardTitle>
          <CardDescription>Your recent contributions to the ministry</CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No contributions yet</p>
              <p className="text-sm mt-1">Your giving history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getContributionTypeLabel(contribution.contribution_type)}
                      </span>
                      <Badge variant={getStatusColor(contribution.transaction_status)}>
                        {contribution.transaction_status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(contribution.contribution_date), 'PPP')} •{' '}
                      {getPaymentMethodLabel(contribution.payment_method)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatAmount(contribution.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};