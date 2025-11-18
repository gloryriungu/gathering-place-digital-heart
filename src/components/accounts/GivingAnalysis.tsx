import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeGivingDashboard } from "./RealTimeGivingDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, TrendingUp, Calendar, Filter } from "lucide-react";

interface Contribution {
  id: string;
  member_id: string | null;
  amount: number;
  contribution_date: string;
  contribution_type: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

interface GivingStats {
  totalThisWeek: number;
  totalThisMonth: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalQ4: number;
  totalFirstHalf: number;
  totalSecondHalf: number;
  totalYear: number;
}

export const GivingAnalysis = () => {
  const { toast } = useToast();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<GivingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchContributions();
    calculateStats();
  }, [dateFilter, typeFilter]);

  const fetchContributions = async () => {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .order('contribution_date', { ascending: false });

      // Apply filters
      if (dateFilter.start) {
        query = query.gte('contribution_date', dateFilter.start);
      }
      if (dateFilter.end) {
        query = query.lte('contribution_date', dateFilter.end);
      }
      if (typeFilter !== 'all') {
        query = query.eq('contribution_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContributions(data || []);
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

  const calculateStats = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Fetch contributions for various periods
      const queries = await Promise.all([
        // This week
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', weekStart.toISOString().split('T')[0]),
        
        // This month
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', monthStart.toISOString().split('T')[0]),
        
        // Q1
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-01-01`)
          .lte('contribution_date', `${currentYear}-03-31`),
        
        // Q2
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-04-01`)
          .lte('contribution_date', `${currentYear}-06-30`),
        
        // Q3
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-07-01`)
          .lte('contribution_date', `${currentYear}-09-30`),
        
        // Q4
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-10-01`)
          .lte('contribution_date', `${currentYear}-12-31`),
        
        // First Half
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-01-01`)
          .lte('contribution_date', `${currentYear}-06-30`),
        
        // Second Half
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-07-01`)
          .lte('contribution_date', `${currentYear}-12-31`),
        
        // Whole Year
        supabase
          .from('contributions')
          .select('amount')
          .gte('contribution_date', `${currentYear}-01-01`)
          .lte('contribution_date', `${currentYear}-12-31`)
      ]);

      const statsData = {
        totalThisWeek: queries[0].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalThisMonth: queries[1].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalQ1: queries[2].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalQ2: queries[3].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalQ3: queries[4].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalQ4: queries[5].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalFirstHalf: queries[6].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalSecondHalf: queries[7].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
        totalYear: queries[8].data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0
      };

      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error calculating stats",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddContribution = async (formData: FormData) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .insert({
          amount: parseFloat(formData.get('amount') as string),
          contribution_date: formData.get('contribution_date') as string,
          contribution_type: formData.get('contribution_type') as string,
          payment_method: formData.get('payment_method') as string,
          notes: formData.get('notes') as string || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contribution recorded successfully"
      });

      setIsAddContributionOpen(false);
      fetchContributions();
      calculateStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading giving data...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="realtime">Real-Time</TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="space-y-4">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Giving Analysis</h2>
          <p className="text-muted-foreground">Track and analyze church contributions</p>
        </div>
        
        <Dialog open={isAddContributionOpen} onOpenChange={setIsAddContributionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Contribution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Contribution</DialogTitle>
              <DialogDescription>Add a new cash contribution record</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddContribution(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contribution_date">Date</Label>
                  <Input name="contribution_date" type="date" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contribution_type">Type</Label>
                  <Select name="contribution_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tithe">Tithe</SelectItem>
                      <SelectItem value="offering">Offering</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="special_giving">Special Giving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select name="payment_method" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input name="notes" placeholder="Optional notes..." />
              </div>

              <Button type="submit" className="w-full">Record Contribution</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalThisWeek.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalThisMonth.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Q1</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalQ1.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">First Half</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalFirstHalf.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Whole Year</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalYear.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quarterly Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Q1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${stats.totalQ1.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Q2</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${stats.totalQ2.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Q3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${stats.totalQ3.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Q4</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${stats.totalQ4.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type_filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tithe">Tithe</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="special_giving">Special Giving</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDateFilter({ start: '', end: '' });
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.slice(0, 20).map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell>
                    {new Date(contribution.contribution_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${contribution.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {contribution.contribution_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {contribution.payment_method.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{contribution.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </div>
      </TabsContent>

      <TabsContent value="realtime">
        <RealTimeGivingDashboard />
      </TabsContent>
    </Tabs>
  );
};