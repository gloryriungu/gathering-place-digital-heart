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
import { Plus, DollarSign, TrendingUp, Calendar, Filter, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/paystack";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Contribution {
  id: string;
  member_id: string | null;
  amount: number;
  contribution_date: string;
  contribution_type: string;
  payment_method: string;
  transaction_reference: string | null;
  notes: string | null;
  created_at: string;
  banked_by?: string | null;
  paystack_reference?: string | null;
}

interface GivingStats {
  weeklyTotal: number;
  monthlyTotal: number;
  quarterlyTotal: number;
  halfYearTotal: number;
  annualTotal: number;
}

type SourceFilter = 'all' | 'cash' | 'online';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());
const monthOptions = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

export const GivingAnalysis = () => {
  const { toast } = useToast();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<GivingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [activeTab, setActiveTab] = useState('analytics');

  // Interactive period selectors
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0]);
  const [statsMonth, setStatsMonth] = useState((new Date().getMonth() + 1).toString());
  const [statsMonthYear, setStatsMonthYear] = useState(currentYear.toString());
  const [statsQuarter, setStatsQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
  const [statsQuarterYear, setStatsQuarterYear] = useState(currentYear.toString());
  const [statsHalf, setStatsHalf] = useState(new Date().getMonth() < 6 ? 'H1' : 'H2');
  const [statsHalfYear, setStatsHalfYear] = useState(currentYear.toString());
  const [statsAnnualYear, setStatsAnnualYear] = useState(currentYear.toString());

  useEffect(() => {
    fetchContributions();
  }, [dateFilter, typeFilter, sourceFilter]);

  useEffect(() => {
    calculateStats();
  }, [sourceFilter, weekDate, statsMonth, statsMonthYear, statsQuarter, statsQuarterYear, statsHalf, statsHalfYear, statsAnnualYear]);

  const applySourceFilter = (query: any) => {
    if (sourceFilter === 'cash') {
      query = query.is('paystack_reference', null).in('payment_method', ['manual', 'cash']);
    } else if (sourceFilter === 'online') {
      query = query.not('paystack_reference', 'is', null);
    }
    return query;
  };

  const fetchContributions = async () => {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .order('contribution_date', { ascending: false });

      if (dateFilter.start) query = query.gte('contribution_date', dateFilter.start);
      if (dateFilter.end) query = query.lte('contribution_date', dateFilter.end);
      if (typeFilter !== 'all') query = query.eq('contribution_type', typeFilter);
      query = applySourceFilter(query);

      const { data, error } = await query;
      if (error) throw error;
      setContributions(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const buildQuery = (dateGte: string, dateLte?: string) => {
        let q = supabase.from('contributions').select('amount').gte('contribution_date', dateGte);
        if (dateLte) q = q.lte('contribution_date', dateLte);
        q = applySourceFilter(q);
        return q;
      };

      const sumResult = (data: any[] | null) => data?.reduce((s, c) => s + Number(c.amount), 0) || 0;

      // Weekly
      const wd = new Date(weekDate);
      const ws = startOfWeek(wd, { weekStartsOn: 0 });
      const we = endOfWeek(wd, { weekStartsOn: 0 });

      // Monthly
      const mY = parseInt(statsMonthYear);
      const mM = parseInt(statsMonth);
      const monthStart = `${mY}-${String(mM).padStart(2, '0')}-01`;
      const monthEnd = `${mY}-${String(mM).padStart(2, '0')}-${new Date(mY, mM, 0).getDate()}`;

      // Quarterly
      const qY = parseInt(statsQuarterYear);
      const qN = parseInt(statsQuarter.replace('Q', ''));
      const qStart = `${qY}-${String((qN - 1) * 3 + 1).padStart(2, '0')}-01`;
      const qEndMonth = qN * 3;
      const qEnd = `${qY}-${String(qEndMonth).padStart(2, '0')}-${new Date(qY, qEndMonth, 0).getDate()}`;

      // Semi-annual
      const hY = parseInt(statsHalfYear);
      const hStart = statsHalf === 'H1' ? `${hY}-01-01` : `${hY}-07-01`;
      const hEnd = statsHalf === 'H1' ? `${hY}-06-30` : `${hY}-12-31`;

      // Annual
      const aY = statsAnnualYear;

      const queries = await Promise.all([
        buildQuery(format(ws, 'yyyy-MM-dd'), format(we, 'yyyy-MM-dd')),
        buildQuery(monthStart, monthEnd),
        buildQuery(qStart, qEnd),
        buildQuery(hStart, hEnd),
        buildQuery(`${aY}-01-01`, `${aY}-12-31`),
      ]);

      setStats({
        weeklyTotal: sumResult(queries[0].data),
        monthlyTotal: sumResult(queries[1].data),
        quarterlyTotal: sumResult(queries[2].data),
        halfYearTotal: sumResult(queries[3].data),
        annualTotal: sumResult(queries[4].data),
      });
    } catch (error: any) {
      toast({ title: "Error calculating stats", description: error.message, variant: "destructive" });
    }
  };

  const handleAddContribution = async (formData: FormData) => {
    try {
      const mpesaCode = formData.get('mpesa_code') as string;
      const bankedBy = formData.get('banked_by') as string;
      const { error } = await supabase
        .from('contributions')
        .insert({
          amount: parseFloat(formData.get('amount') as string),
          contribution_date: formData.get('contribution_date') as string,
          contribution_type: formData.get('contribution_type') as string,
          payment_method: formData.get('payment_method') as string,
          transaction_reference: mpesaCode || null,
          notes: (formData.get('notes') as string) || null,
          banked_by: bankedBy || null,
        } as any);

      if (error) throw error;

      toast({ title: "Success", description: "Contribution recorded successfully" });
      setIsAddContributionOpen(false);
      fetchContributions();
      calculateStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading giving data...</div>;
  }

  const sourceLabel = sourceFilter === 'cash' ? ' (Cash Only)' : sourceFilter === 'online' ? ' (Online Only)' : '';

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
          <h2 className="text-2xl font-bold">Giving Analysis{sourceLabel}</h2>
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
                  <Label htmlFor="amount">Amount (KES)</Label>
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
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa_code">M-Pesa Transaction Code (Optional)</Label>
                <Input name="mpesa_code" placeholder="e.g. SLK4H7R2TQ" className="uppercase" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banked_by">Banked By (Optional)</Label>
                <Input name="banked_by" placeholder="Name of person who banked the cash" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Service / Notes (Optional)</Label>
                <Input name="notes" placeholder="Optional - e.g. Sunday Service" />
              </div>

              <Button type="submit" className="w-full">Record Contribution</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interactive Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Weekly */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weekly</span>
              </div>
              <Input
                type="date"
                value={weekDate}
                onChange={(e) => setWeekDate(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="text-2xl font-bold">{formatAmount(stats.weeklyTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {format(startOfWeek(new Date(weekDate), { weekStartsOn: 0 }), 'dd MMM')} – {format(endOfWeek(new Date(weekDate), { weekStartsOn: 0 }), 'dd MMM yyyy')}
              </p>
            </CardContent>
          </Card>

          {/* Monthly */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Monthly</span>
              </div>
              <div className="flex gap-1">
                <Select value={statsMonth} onValueChange={setStatsMonth}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label.slice(0, 3)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statsMonthYear} onValueChange={setStatsMonthYear}>
                  <SelectTrigger className="h-8 text-xs w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-2xl font-bold">{formatAmount(stats.monthlyTotal)}</div>
            </CardContent>
          </Card>

          {/* Quarterly */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quarterly</span>
              </div>
              <div className="flex gap-1">
                <Select value={statsQuarter} onValueChange={setStatsQuarter}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statsQuarterYear} onValueChange={setStatsQuarterYear}>
                  <SelectTrigger className="h-8 text-xs w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-2xl font-bold">{formatAmount(stats.quarterlyTotal)}</div>
            </CardContent>
          </Card>

          {/* Semi-Annual */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Semi-Annual</span>
              </div>
              <div className="flex gap-1">
                <Select value={statsHalf} onValueChange={setStatsHalf}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H1">H1 (Jan–Jun)</SelectItem>
                    <SelectItem value="H2">H2 (Jul–Dec)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statsHalfYear} onValueChange={setStatsHalfYear}>
                  <SelectTrigger className="h-8 text-xs w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-2xl font-bold">{formatAmount(stats.halfYearTotal)}</div>
            </CardContent>
          </Card>

          {/* Annual */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Annual</span>
              </div>
              <Select value={statsAnnualYear} onValueChange={setStatsAnnualYear}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="text-2xl font-bold">{formatAmount(stats.annualTotal)}</div>
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
              <Label>Source</Label>
              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="cash">Cash Only</SelectItem>
                  <SelectItem value="online">Online (Paystack)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                setSourceFilter('all');
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
                <TableHead>M-Pesa Code</TableHead>
                <TableHead>Banked By</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.slice(0, 20).map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell>
                    {new Date(contribution.contribution_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatAmount(contribution.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {contribution.contribution_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {contribution.payment_method.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{contribution.transaction_reference || '-'}</TableCell>
                  <TableCell>{contribution.banked_by || '-'}</TableCell>
                  <TableCell>{contribution.notes || '-'}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this contribution record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('contributions')
                                  .delete()
                                  .eq('id', contribution.id);
                                if (error) throw error;
                                toast({ title: "Deleted", description: "Contribution record removed" });
                                fetchContributions();
                                calculateStats();
                              } catch (error: any) {
                                toast({ title: "Error", description: error.message, variant: "destructive" });
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
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
