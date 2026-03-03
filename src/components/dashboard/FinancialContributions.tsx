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
import { DollarSign, TrendingUp, Calendar, Download, Trash2 } from "lucide-react";
import { formatAmount, getContributionTypeLabel } from "@/lib/paystack";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  { value: "offering", label: "Offering" },
  { value: "tithe", label: "Tithe" },
  { value: "building_fund", label: "Building Fund" },
  { value: "missions", label: "Missions" },
  { value: "community_outreach", label: "Community Outreach" },
  { value: "special_offering", label: "Special Offering" },
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
  const [newContribution, setNewContribution] = useState({
    type: "offering",
    amount: "",
    service: "",
    date: new Date().toISOString().split('T')[0],
    mpesaCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!newContribution.amount || !newContribution.service) {
      toast.error("Please fill in amount and service name");
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
        notes: newContribution.service,
        transaction_reference: newContribution.mpesaCode || null,
        payment_method: newContribution.mpesaCode ? 'mpesa' : 'manual',
        transaction_status: 'completed',
        donor_name: user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
          : user.email,
        donor_email: user.email,
      });

      if (error) throw error;

      toast.success("Contribution recorded successfully");
      setNewContribution({ type: "offering", amount: "", service: "", date: new Date().toISOString().split('T')[0], mpesaCode: "" });
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
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const generateStyledPDF = (period: string) => {
    const now = new Date();
    let filtered = completed;

    switch (period) {
      case 'daily':
        filtered = completed.filter(c => c.contribution_date?.startsWith(now.toISOString().split('T')[0]));
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        filtered = completed.filter(c => new Date(c.contribution_date) >= weekAgo);
        break;
      case 'monthly':
        filtered = completed.filter(c => {
          const d = new Date(c.contribution_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        break;
      case 'quarterly':
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= qStart);
        break;
      case 'semi-annual':
        const saStart = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= saStart);
        break;
      case 'annual':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = completed.filter(c => new Date(c.contribution_date) >= yearStart);
        break;
    }

    const doc = new jsPDF();
    const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);

    const drawPageDecoration = (pageNum: number, totalPages: number) => {
      // Top bar
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 8, 210, 2, 'F');

      // Watermark
      doc.saveGraphicsState();
      const gState = (doc as any).GState({ opacity: 0.06 });
      doc.setGState(gState);
      doc.setFontSize(50);
      doc.setTextColor(30, 41, 59);
      doc.text('THE OVERCOMER TRIBE', 105, 160, { align: 'center', angle: 45 });
      doc.restoreGraphicsState();

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('The Overcomer Tribe Church • Confidential Financial Report', 105, 285, { align: 'center' });
      doc.text(`Page ${pageNum} of ${totalPages}`, 195, 285, { align: 'right' });
    };

    // Header
    drawPageDecoration(1, 1);
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Report', 20, 25);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${period.charAt(0).toUpperCase() + period.slice(1)} Report • Generated ${format(now, 'PPP')}`, 20, 33);

    // Summary boxes
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

    // Type breakdown
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

    // Transaction table
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Type', 'Service/Notes', 'M-Pesa Code', 'Amount (KES)']],
      body: filtered.map(c => [
        c.contribution_date ? format(new Date(c.contribution_date), 'dd/MM/yyyy') : '-',
        getContributionTypeLabel(c.contribution_type),
        c.notes || c.donor_name || '-',
        c.transaction_reference || '-',
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

    doc.save(`financial-report-${period}-${format(now, 'yyyy-MM-dd')}.pdf`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Contributions</h2>
          <p className="text-muted-foreground">Track and manage church contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
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
                <p className="text-sm text-muted-foreground">This Week</p>
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
                <p className="text-sm text-muted-foreground">This Month</p>
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
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{completed.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Add Contribution</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Contribution</CardTitle>
              <CardDescription>Record a new financial contribution</CardDescription>
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
                  <Label htmlFor="service">Service Name</Label>
                  <Input id="service" placeholder="Enter service name" value={newContribution.service}
                    onChange={(e) => setNewContribution(p => ({ ...p, service: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributionDate">Date</Label>
                  <Input id="contributionDate" type="date" value={newContribution.date}
                    onChange={(e) => setNewContribution(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mpesaCode">M-Pesa Transaction Code (Optional)</Label>
                  <Input id="mpesaCode" placeholder="e.g. SLK4H7R2TY" value={newContribution.mpesaCode}
                    onChange={(e) => setNewContribution(p => ({ ...p, mpesaCode: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <Button onClick={addContribution} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Add Contribution"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Contribution Types Summary</CardTitle></CardHeader>
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
                <CardDescription>Download reports for different periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['daily', 'weekly', 'monthly'].map(p => (
                  <Button key={p} variant="outline" className="w-full justify-start" onClick={() => generateStyledPDF(p)}>
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
              <CardTitle>Recent Contributions</CardTitle>
              <CardDescription>Latest financial contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contributions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No contributions recorded yet</p>
                  </div>
                ) : (
                  contributions.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getTypeBadgeColor(c.contribution_type)}>
                          {getContributionTypeLabel(c.contribution_type)}
                        </Badge>
                        <div>
                          <p className="font-medium">{c.notes || c.donor_name || 'Contribution'}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.contribution_date ? format(new Date(c.contribution_date), 'dd/MM/yyyy') : '-'}
                            {c.transaction_reference && ` • M-Pesa: ${c.transaction_reference}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{formatAmount(c.amount)}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Reports</CardTitle>
              <CardDescription>Generate detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { period: 'quarterly', label: 'Quarterly Report', icon: Calendar },
                  { period: 'semi-annual', label: 'Semi-Annual Report', icon: TrendingUp },
                  { period: 'annual', label: 'Annual Report', icon: DollarSign },
                ].map(({ period, label, icon: Icon }) => (
                  <Button key={period} variant="outline" className="h-24 flex-col" onClick={() => generateStyledPDF(period)}>
                    <Icon className="h-6 w-6 mb-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
