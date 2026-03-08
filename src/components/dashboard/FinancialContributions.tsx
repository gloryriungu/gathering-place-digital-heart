import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Calendar, Download, Trash2, Search, Filter } from "lucide-react";
import { formatAmount, getContributionTypeLabel } from "@/lib/paystack";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "@/assets/logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const contributionTypes = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "gift_1", label: "Gift 1" },
  { value: "gift_2", label: "Gift 2" },
  { value: "seed", label: "Seed" },
  { value: "mission", label: "Mission" },
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "building_fund", label: "Building Fund" },
  { value: "community_outreach", label: "Community Outreach" },
  { value: "special_offering", label: "Special Offering" },
  { value: "others", label: "Others" },
];

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    tithe: "bg-green-100 text-green-800",
    offering: "bg-blue-100 text-blue-800",
    building_fund: "bg-purple-100 text-purple-800",
    missions: "bg-orange-100 text-orange-800",
    community_outreach: "bg-teal-100 text-teal-800",
    special_offering: "bg-pink-100 text-pink-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

export const FinancialContributions = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("add");
  const [newContribution, setNewContribution] = useState({
    type: "offering",
    amount: "",
    service: "",
    date: new Date().toISOString().split('T')[0],
    mpesaCode: "",
    bankedBy: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters for history
  const [filterType, setFilterType] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Filters for reports
  const [reportType, setReportType] = useState("all");
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");

  // Day report
  const [dayReportDate, setDayReportDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadContributions();

    const channel = supabase
      .channel('financial-contributions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => {
        loadContributions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .is('paystack_reference', null)
        .in('payment_method', ['manual', 'cash'])
        .order('contribution_date', { ascending: false })
        .limit(200);

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completed = contributions.filter(c => c.transaction_status === 'completed');

  // Apply filters to history
  const filteredHistory = completed.filter(c => {
    if (filterType !== "all" && c.contribution_type !== filterType) return false;
    if (filterDateFrom && c.contribution_date < filterDateFrom) return false;
    if (filterDateTo && c.contribution_date > filterDateTo) return false;
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      const matchName = c.donor_name?.toLowerCase().includes(search);
      const matchNotes = c.notes?.toLowerCase().includes(search);
      const matchRef = c.transaction_reference?.toLowerCase().includes(search);
      const matchBanked = c.banked_by?.toLowerCase().includes(search);
      if (!matchName && !matchNotes && !matchRef && !matchBanked) return false;
    }
    return true;
  });

  // Apply filters for reports
  const getReportFiltered = () => {
    return completed.filter(c => {
      if (reportType !== "all" && c.contribution_type !== reportType) return false;
      if (reportDateFrom && c.contribution_date < reportDateFrom) return false;
      if (reportDateTo && c.contribution_date > reportDateTo) return false;
      return true;
    });
  };

  const getDailyTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return completed.filter(c => c.contribution_date?.startsWith(today)).reduce((sum, c) => sum + c.amount, 0);
  };

  const getWeeklyTotal = () => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return completed.filter(c => new Date(c.contribution_date) >= weekAgo).reduce((sum, c) => sum + c.amount, 0);
  };

  const getMonthlyTotal = () => {
    const now = new Date();
    return completed.filter(c => {
      const d = new Date(c.contribution_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, c) => sum + c.amount, 0);
  };

  const getTotalByType = (type: string) =>
    completed.filter(c => c.contribution_type === type).reduce((sum, c) => sum + c.amount, 0);

  const addContribution = async () => {
    if (!newContribution.amount) {
      toast.error("Please fill in the amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not authenticated"); return; }

      const { error } = await supabase.from('contributions').insert({
        amount: parseFloat(newContribution.amount),
        contribution_type: newContribution.type,
        contribution_date: newContribution.date,
        notes: newContribution.service || null,
        transaction_reference: newContribution.mpesaCode || null,
        payment_method: 'cash',
        transaction_status: 'completed',
        donor_name: user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
          : user.email,
        donor_email: user.email,
        banked_by: newContribution.bankedBy || null,
      } as any);

      if (error) throw error;

      toast.success("Cash contribution recorded successfully");
      setNewContribution({ type: "offering", amount: "", service: "", date: new Date().toISOString().split('T')[0], mpesaCode: "", bankedBy: "" });
      await loadContributions();
      // Auto-switch to History tab so the user can see the saved record
      setActiveTab("history");
    } catch (error: any) {
      toast.error(error.message || "Failed to record contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteContribution = async (id: string) => {
    try {
      const { error } = await supabase.from('contributions').delete().eq('id', id);
      if (error) throw error;
      toast.success("Contribution deleted");
      await loadContributions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const generateStyledPDF = (filtered: any[], periodLabel: string) => {
    const now = new Date();
    const doc = new jsPDF();
    const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);

    const drawPageDecoration = (pageNum: number, totalPages: number) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 8, 210, 2, 'F');

      doc.saveGraphicsState();
      const gState = (doc as any).GState({ opacity: 0.06 });
      doc.setGState(gState);
      doc.setFontSize(40);
      doc.setTextColor(30, 41, 59);
      doc.text('TENT OF TESTIMONIES', 105, 150, { align: 'center', angle: 45 });
      doc.text('MINISTRIES INT', 105, 175, { align: 'center', angle: 45 });
      doc.restoreGraphicsState();

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Tent of Testimonies Ministries Int • Confidential Cash Contributions Report', 105, 285, { align: 'center' });
      doc.text(`Page ${pageNum} of ${totalPages}`, 195, 285, { align: 'right' });
    };

    drawPageDecoration(1, 1);
    try {
      doc.addImage(logoImg, 'PNG', 15, 12, 18, 18);
    } catch (e) {}
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Cash Contributions Report', 36, 25);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${periodLabel} • Generated ${format(now, 'PPP')}`, 36, 33);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, 42, 85, 28, 3, 3, 'F');
    doc.roundedRect(110, 42, 85, 28, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Total Amount (KES)', 20, 52);
    doc.text('Total Transactions', 115, 52);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(formatAmount(totalAmount), 20, 63);
    doc.text(String(filtered.length), 115, 63);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Breakdown by Type', 20, 85);

    let y = 93;
    doc.setFontSize(10);
    contributionTypes.forEach(type => {
      const amt = filtered.filter(c => c.contribution_type === type.value).reduce((s, c) => s + c.amount, 0);
      const count = filtered.filter(c => c.contribution_type === type.value).length;
      if (count > 0) {
        doc.setTextColor(71, 85, 105);
        doc.text(`${type.label}: ${formatAmount(amt)} (${count} transactions)`, 25, y);
        y += 7;
      }
    });

    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Type', 'Service/Notes', 'M-Pesa Code', 'Banked By', 'Amount (KES)']],
      body: filtered.map(c => [
        c.contribution_date ? format(new Date(c.contribution_date), 'dd/MM/yyyy') : '-',
        getContributionTypeLabel(c.contribution_type),
        c.notes || '-',
        c.transaction_reference || '-',
        c.banked_by || '-',
        formatAmount(c.amount),
      ]),
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        drawPageDecoration(data.pageNumber, pageCount);
      },
    });

    doc.save(`cash-contributions-report-${periodLabel.toLowerCase().replace(/\s+/g, '-')}-${format(now, 'yyyy-MM-dd')}.pdf`);
  };

  const generatePresetReport = (period: string) => {
    const now = new Date();
    let filtered = completed;
    let label = period.charAt(0).toUpperCase() + period.slice(1);

    switch (period) {
      case 'daily':
        filtered = completed.filter(c => c.contribution_date?.startsWith(now.toISOString().split('T')[0]));
        break;
      case 'weekly': {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        filtered = completed.filter(c => new Date(c.contribution_date) >= weekAgo);
        break;
      }
      case 'monthly':
        filtered = completed.filter(c => {
          const d = new Date(c.contribution_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        break;
      case 'quarterly': {
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= qStart);
        break;
      }
      case 'semi-annual': {
        const saStart = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= saStart);
        label = 'Semi-Annual';
        break;
      }
      case 'annual': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= yearStart);
        break;
      }
    }

    generateStyledPDF(filtered, `${label} Report`);
  };

  const generateCustomReport = () => {
    const filtered = getReportFiltered();
    if (filtered.length === 0) {
      toast.error("No records match your filter criteria");
      return;
    }
    const typeLabel = reportType === "all" ? "All Types" : contributionTypes.find(t => t.value === reportType)?.label || reportType;
    const dateLabel = reportDateFrom || reportDateTo
      ? `${reportDateFrom || 'Start'} to ${reportDateTo || 'Present'}`
      : 'All Dates';
    generateStyledPDF(filtered, `Custom Report • ${typeLabel} • ${dateLabel}`);
  };

  // Day Report helpers
  const getDayReportRecords = () => completed.filter(c => c.contribution_date === dayReportDate);
  const dayReportRecords = getDayReportRecords();
  const dayReportTotal = dayReportRecords.reduce((s, c) => s + c.amount, 0);

  const generateDayReportPDF = () => {
    const records = dayReportRecords;
    if (records.length === 0) {
      toast.error("No contributions found for this date");
      return;
    }

    const doc = new jsPDF();
    const selectedDate = new Date(dayReportDate + 'T00:00:00');
    const dateFormatted = format(selectedDate, 'EEEE, d MMMM yyyy');
    const totalAmount = records.reduce((s, c) => s + c.amount, 0);

    const drawPageDecoration = (pageNum: number, totalPages: number) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 8, 210, 2, 'F');

      doc.saveGraphicsState();
      const gState = (doc as any).GState({ opacity: 0.06 });
      doc.setGState(gState);
      doc.setFontSize(40);
      doc.setTextColor(30, 41, 59);
      doc.text('TENT OF TESTIMONIES', 105, 150, { align: 'center', angle: 45 });
      doc.text('MINISTRIES INT', 105, 175, { align: 'center', angle: 45 });
      doc.restoreGraphicsState();

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Tent of Testimonies Ministries Int • Confidential Daily Report', 105, 285, { align: 'center' });
      doc.text(`Page ${pageNum} of ${totalPages}`, 195, 285, { align: 'right' });
    };

    drawPageDecoration(1, 1);

    // Header with logo
    try {
      doc.addImage(logoImg, 'PNG', 15, 12, 18, 18);
    } catch (e) {}
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('DAILY CONTRIBUTIONS REPORT', 36, 25);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(dateFormatted, 36, 33);

    // Summary boxes
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(15, 42, 85, 30, 3, 3, 'F');
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(110, 42, 85, 30, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('GRAND TOTAL (KES)', 20, 52);
    doc.setFontSize(18);
    doc.text(formatAmount(totalAmount), 20, 65);

    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('TOTAL TRANSACTIONS', 115, 52);
    doc.setFontSize(18);
    doc.text(String(records.length), 115, 65);

    // Transactions table
    let y = 82;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Transaction Details', 20, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Type', 'Service/Notes', 'M-Pesa Code', 'Banked By', 'Amount (KES)']],
      body: [
        ...records.map((c, i) => [
          String(i + 1),
          getContributionTypeLabel(c.contribution_type),
          c.notes || '-',
          c.transaction_reference || '-',
          c.banked_by || '-',
          formatAmount(c.amount),
        ]),
        // Grand total row
        ['', '', '', '', { content: 'GRAND TOTAL', styles: { fontStyle: 'bold', halign: 'right' as const } }, { content: formatAmount(totalAmount), styles: { fontStyle: 'bold' } }],
      ],
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        drawPageDecoration(data.pageNumber, pageCount);
      },
    });

    doc.save(`daily-contributions-report-${dayReportDate}.pdf`);
    toast.success("Day report downloaded successfully");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const historyTotal = filteredHistory.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cash Giving Records</h2>
          <p className="text-muted-foreground">Track and manage physical cash contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Cash Total</p>
                <p className="text-2xl font-bold">{formatAmount(getDailyTotal())}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week (Cash)</p>
                <p className="text-2xl font-bold">{formatAmount(getWeeklyTotal())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month (Cash)</p>
                <p className="text-2xl font-bold">{formatAmount(getMonthlyTotal())}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Transactions</p>
                <p className="text-2xl font-bold">{completed.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Add Contribution</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History ({completed.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Record Cash Contribution</CardTitle>
              <CardDescription>Record a new physical cash contribution that has been counted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contribution Type</Label>
                  <Select value={newContribution.type} onValueChange={(v) => setNewContribution(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {contributionTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" value={newContribution.amount}
                    onChange={(e) => setNewContribution(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Name (Optional)</Label>
                  <Input id="service" placeholder="Optional - e.g. Sunday Service" value={newContribution.service}
                    onChange={(e) => setNewContribution(p => ({ ...p, service: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributionDate">Date</Label>
                  <Input id="contributionDate" type="date" value={newContribution.date}
                    onChange={(e) => setNewContribution(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesaCode">M-Pesa Transaction Code (Optional)</Label>
                  <Input id="mpesaCode" placeholder="e.g. SLK4H7R2TY" value={newContribution.mpesaCode}
                    onChange={(e) => setNewContribution(p => ({ ...p, mpesaCode: e.target.value.toUpperCase() }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankedBy">Banked By (Optional)</Label>
                  <Input id="bankedBy" placeholder="Name of person who banked the cash" value={newContribution.bankedBy}
                    onChange={(e) => setNewContribution(p => ({ ...p, bankedBy: e.target.value }))} />
                </div>
              </div>
              <Button onClick={addContribution} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Cash Contribution"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Cash Contribution Types Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {contributionTypes.map(type => {
                  const total = getTotalByType(type.value);
                  if (total === 0) return null;
                  return (
                    <div key={type.value} className="flex items-center justify-between">
                      <Badge className={getTypeBadgeColor(type.value)}>{type.label}</Badge>
                      <span className="font-semibold">{formatAmount(total)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Export</CardTitle>
                <CardDescription>Download cash contribution reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['daily', 'weekly', 'monthly'].map(p => (
                  <Button key={p} variant="outline" className="w-full justify-start" onClick={() => generatePresetReport(p)}>
                    <Download className="mr-2 h-4 w-4" />
                    {p.charAt(0).toUpperCase() + p.slice(1)} Report
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Cash Contribution History</CardTitle>
              <CardDescription>View, filter and search recorded cash contributions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Filter className="h-3 w-3" /> Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {contributionTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From Date</Label>
                  <Input type="date" className="h-9" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To Date</Label>
                  <Input type="date" className="h-9" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Search className="h-3 w-3" /> Search</Label>
                  <Input className="h-9" placeholder="Name, notes, ref..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                </div>
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredHistory.length}</span> record{filteredHistory.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Total: {formatAmount(historyTotal)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filteredHistory.length === 0}
                    onClick={() => {
                      const typeLabel = filterType === "all" ? "All Types" : contributionTypes.find(t => t.value === filterType)?.label || filterType;
                      const dateLabel = filterDateFrom || filterDateTo
                        ? `${filterDateFrom || 'Start'} to ${filterDateTo || 'Present'}`
                        : 'All Dates';
                      generateStyledPDF(filteredHistory, `Filtered History • ${typeLabel} • ${dateLabel}`);
                    }}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Table */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{completed.length === 0 ? 'No cash contributions recorded yet' : 'No records match your filters'}</p>
                  {completed.length > 0 && (
                    <Button variant="link" onClick={() => { setFilterType("all"); setFilterDateFrom(""); setFilterDateTo(""); setFilterSearch(""); }}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Service/Notes</TableHead>
                        <TableHead>M-Pesa Code</TableHead>
                        <TableHead>Banked By</TableHead>
                        <TableHead className="text-right">Amount (KES)</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="whitespace-nowrap">
                            {c.contribution_date ? format(new Date(c.contribution_date), 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeBadgeColor(c.contribution_type)}>
                              {getContributionTypeLabel(c.contribution_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.notes || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{c.transaction_reference || '-'}</TableCell>
                          <TableCell>{c.banked_by || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">{formatAmount(c.amount)}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contribution?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove this {formatAmount(c.amount)} contribution. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteContribution(c.id)} className="bg-destructive text-destructive-foreground">
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-6">
            {/* Day Report */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Day Report
                </CardTitle>
                <CardDescription>Generate a comprehensive PDF report for a specific day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Input type="date" value={dayReportDate} onChange={e => setDayReportDate(e.target.value)} />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Records Found</p>
                    <p className="text-lg font-bold">{dayReportRecords.length}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Grand Total (KES)</p>
                    <p className="text-lg font-bold">{formatAmount(dayReportTotal)}</p>
                  </div>
                </div>
                <Button onClick={generateDayReportPDF} disabled={dayReportRecords.length === 0} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Day Report
                </Button>
              </CardContent>
            </Card>

            {/* Custom filtered report */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Filtered Report</CardTitle>
                <CardDescription>Filter by type and date range, then download a PDF report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Contribution Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {contributionTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" value={reportDateFrom} onChange={e => setReportDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" value={reportDateTo} onChange={e => setReportDateTo(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {getReportFiltered().length} record{getReportFiltered().length !== 1 ? 's' : ''} match • Total: {formatAmount(getReportFiltered().reduce((s, c) => s + c.amount, 0))}
                  </span>
                  <Button onClick={generateCustomReport} disabled={getReportFiltered().length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preset reports */}
            <Card>
              <CardHeader>
                <CardTitle>Preset Reports</CardTitle>
                <CardDescription>Quick-generate standard period reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { period: 'daily', label: 'Daily Report', icon: Calendar },
                    { period: 'weekly', label: 'Weekly Report', icon: TrendingUp },
                    { period: 'monthly', label: 'Monthly Report', icon: DollarSign },
                    { period: 'quarterly', label: 'Quarterly Report', icon: Calendar },
                    { period: 'semi-annual', label: 'Semi-Annual Report', icon: TrendingUp },
                    { period: 'annual', label: 'Annual Report', icon: DollarSign },
                  ].map(({ period, label, icon: Icon }) => (
                    <Button key={period} variant="outline" className="h-20 flex-col" onClick={() => generatePresetReport(period)}>
                      <Icon className="h-5 w-5 mb-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
