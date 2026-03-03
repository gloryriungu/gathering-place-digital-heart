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
import { TrendingUp, Calendar, DollarSign, ArrowLeft, Download, Filter, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  const generatePDFReport = async () => {
    if (filteredContributions.length === 0) {
      toast({
        title: "No Data",
        description: "No contributions to generate report",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user?.id)
        .maybeSingle();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Helper: Draw watermark on current page
      const drawWatermark = () => {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
        doc.setFontSize(60);
        doc.setTextColor(100, 100, 100);
        // Diagonal watermark
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;
        doc.text('THE OVERCOMER TRIBE', centerX, centerY, {
          align: 'center',
          angle: 35,
        });
        doc.restoreGraphicsState();
      };

      // Draw watermark on first page
      drawWatermark();

      // Decorative top bar
      doc.setFillColor(74, 144, 226);
      doc.rect(0, 0, pageWidth, 4, 'F');

      yPos = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Contribution Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(13);
      doc.setTextColor(74, 144, 226);
      doc.setFont(undefined, 'bold');
      doc.text('The Overcomer Tribe', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont(undefined, 'normal');
      doc.text('Official Giving Statement', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      doc.setDrawColor(74, 144, 226);
      doc.setLineWidth(0.8);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      yPos += 12;

      // User Information Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, yPos - 4, pageWidth - 40, 28, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, yPos - 4, pageWidth - 40, 28, 3, 3, 'S');

      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Prepared For:', 25, yPos + 4);
      doc.setFont(undefined, 'normal');
      doc.text(`${profile?.first_name || ''} ${profile?.last_name || ''}`, 60, yPos + 4);
      
      doc.setFont(undefined, 'bold');
      doc.text('Date:', 25, yPos + 12);
      doc.setFont(undefined, 'normal');
      doc.text(format(new Date(), 'PPP'), 60, yPos + 12);
      
      doc.setFont(undefined, 'bold');
      doc.text('Period:', 25, yPos + 20);
      doc.setFont(undefined, 'normal');
      const periodText = filterStartDate && filterEndDate 
        ? `${format(new Date(filterStartDate), 'PP')} - ${format(new Date(filterEndDate), 'PP')}`
        : 'All Time';
      doc.text(periodText, 60, yPos + 20);

      yPos += 36;

      // Summary Statistics Box with accent border
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F');
      doc.setDrawColor(74, 144, 226);
      doc.setLineWidth(1);
      doc.line(20, yPos, 20, yPos + 40); // Left accent border
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setTextColor(74, 144, 226);
      doc.setFont(undefined, 'bold');
      doc.text('GIVING SUMMARY', 28, yPos);
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(44, 62, 80);
      
      const summaryStartY = yPos;
      doc.setFont(undefined, 'bold');
      doc.text('Total Contributions:', 28, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(stats.contributionCount.toString(), 75, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text('This Month:', 28, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(formatAmount(stats.totalThisMonth), 75, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text('All Time Total:', 28, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(34, 139, 34);
      doc.setFont(undefined, 'bold');
      doc.text(formatAmount(stats.totalAllTime), 75, yPos);

      // Contribution by Type (right side)
      const typeBreakdown: { [key: string]: number } = {};
      filteredContributions
        .filter(c => c.transaction_status === 'completed')
        .forEach(c => {
          const type = getContributionTypeLabel(c.contribution_type);
          typeBreakdown[type] = (typeBreakdown[type] || 0) + c.amount;
        });

      let rightYPos = summaryStartY;
      doc.setTextColor(74, 144, 226);
      doc.setFont(undefined, 'bold');
      doc.text('BY TYPE', pageWidth / 2 + 10, rightYPos - 8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(44, 62, 80);
      
      Object.entries(typeBreakdown).forEach(([type, amount]) => {
        doc.setFont(undefined, 'normal');
        doc.text(`${type}:`, pageWidth / 2 + 10, rightYPos);
        doc.setFont(undefined, 'bold');
        doc.text(formatAmount(amount), pageWidth / 2 + 50, rightYPos);
        rightYPos += 7;
      });

      yPos += 18;

      // Detailed Transactions Table
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Transactions', 20, yPos);
      
      yPos += 5;

      const tableData = filteredContributions.map(c => [
        format(new Date(c.contribution_date), 'MM/dd/yyyy'),
        getContributionTypeLabel(c.contribution_type),
        formatAmount(c.amount),
        getPaymentMethodLabel(c.payment_method),
        c.transaction_status,
        (c.transaction_reference || '').substring(0, 15)
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Date', 'Type', 'Amount', 'Method', 'Status', 'Reference']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [74, 144, 226],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [44, 62, 80]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 35 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          // Watermark on every page
          drawWatermark();
          // Top bar on every page
          doc.setFillColor(74, 144, 226);
          doc.rect(0, 0, pageWidth, 4, 'F');
          // Footer on each page
          const footerY = pageHeight - 10;
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `The Overcomer Tribe • Contribution Report • Generated ${format(new Date(), 'PPP')} • Page ${data.pageNumber}`,
            pageWidth / 2,
            footerY,
            { align: 'center' }
          );
        }
      });

      // Save PDF
      doc.save(`contribution-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Your contribution report has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
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
            <div className="flex gap-2">
              <Button
                onClick={generatePDFReport}
                className="gap-2"
                disabled={filteredContributions.length === 0}
              >
                <FileText className="h-4 w-4" />
                Generate PDF Report
              </Button>
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
