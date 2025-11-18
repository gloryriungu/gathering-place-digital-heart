import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAmount, getContributionTypeLabel, getPaymentMethodLabel } from "@/lib/paystack";
import { format } from "date-fns";
import { TrendingUp, Calendar, DollarSign, ArrowLeft, Download, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function GivingHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<any[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    totalAllTime: 0,
    contributionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>("");

  useEffect(() => {
    loadGivingData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('giving-history-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
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

  useEffect(() => {
    applyFilters();
  }, [contributions, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);

  const loadGivingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get member_id
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch all contributions (both pending and completed)
      let query = supabase
        .from('contributions')
        .select('*')
        .order('contribution_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (member) {
        query = query.or(`member_id.eq.${member.id},donor_email.eq.${user.email}`);
      } else {
        query = query.eq('donor_email', user.email);
      }

      const { data, error } = await query;

      if (error) throw error;

      setContributions(data || []);

      // Calculate stats (only completed)
      const completedContributions = data?.filter(c => c.transaction_status === 'completed') || [];
      const now = new Date();
      const thisMonth = completedContributions.filter(c => {
        const date = new Date(c.contribution_date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

      setStats({
        totalThisMonth: thisMonth.reduce((sum, c) => sum + c.amount, 0),
        totalAllTime: completedContributions.reduce((sum, c) => sum + c.amount, 0),
        contributionCount: completedContributions.length
      });

    } catch (error: any) {
      console.error('Error loading giving data:', error);
      toast({
        title: "Error",
        description: "Failed to load giving history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contributions];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(c => c.contribution_type === filterType);
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(c => new Date(c.contribution_date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      filtered = filtered.filter(c => new Date(c.contribution_date) <= new Date(filterEndDate));
    }

    // Filter by amount range
    if (filterMinAmount) {
      filtered = filtered.filter(c => c.amount >= parseFloat(filterMinAmount));
    }
    if (filterMaxAmount) {
      filtered = filtered.filter(c => c.amount <= parseFloat(filterMaxAmount));
    }

    setFilteredContributions(filtered);
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  };

  const hasActiveFilters = filterType !== "all" || filterStartDate || filterEndDate || filterMinAmount || filterMaxAmount;

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Amount", "Payment Method", "Status", "Reference"];
    const rows = filteredContributions.map(c => [
      format(new Date(c.contribution_date), "yyyy-MM-dd"),
      getContributionTypeLabel(c.contribution_type),
      c.amount,
      getPaymentMethodLabel(c.payment_method),
      c.transaction_status,
      c.transaction_reference || c.paystack_reference || ""
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giving-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your giving history has been exported to CSV"
    });
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-3 mb-8">
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
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Giving History"
        description="View your complete giving history and contributions"
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Giving History</h1>
                <p className="text-muted-foreground">View and manage your contributions</p>
              </div>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="gap-2"
              disabled={filteredContributions.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This Month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(stats.totalThisMonth)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  All Time Total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(stats.totalAllTime)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contributionCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                  <Label htmlFor="filter-type">Contribution Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="tithe">Tithe</SelectItem>
                      <SelectItem value="offering">Offering</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                      <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-start-date">Start Date</Label>
                  <Input
                    id="filter-start-date"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="filter-end-date">End Date</Label>
                  <Input
                    id="filter-end-date"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="filter-min-amount">Min Amount (KES)</Label>
                  <Input
                    id="filter-min-amount"
                    type="number"
                    placeholder="0"
                    value={filterMinAmount}
                    onChange={(e) => setFilterMinAmount(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="filter-max-amount">Max Amount (KES)</Label>
                  <Input
                    id="filter-max-amount"
                    type="number"
                    placeholder="No limit"
                    value={filterMaxAmount}
                    onChange={(e) => setFilterMaxAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredContributions.length} of {contributions.length} contributions
              </div>
            </CardContent>
          </Card>

          {/* Contributions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                A detailed record of all your contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContributions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No contributions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your filters to see more results"
                      : "You haven't made any contributions yet"}
                  </p>
                  {!hasActiveFilters && (
                    <Button onClick={() => navigate('/give')}>
                      Make Your First Contribution
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell className="font-medium">
                            {format(new Date(contribution.contribution_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {getContributionTypeLabel(contribution.contribution_type)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(contribution.amount)}
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodLabel(contribution.payment_method)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(contribution.transaction_status)}>
                              {contribution.transaction_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {contribution.transaction_reference || contribution.paystack_reference || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
