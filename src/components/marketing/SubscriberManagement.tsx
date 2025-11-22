import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, Download, Users, TrendingUp, AlertCircle, CheckCircle, 
  Mail, Send, UserCheck, UserX, BarChart3, Database 
} from "lucide-react";
import jsPDF from "jspdf";

interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  source: string | null;
  tags: string[] | null;
  status: string | null;
  bounce_count: number;
  is_active: boolean;
  subscription_date: string;
  created_at: string;
  last_email_sent: string | null;
  last_bounce_at: string | null;
  subscription_preferences: any;
  metadata: any;
}

export const SubscriberManagement = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    bounced: 0,
    thisMonth: 0,
  });
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);

      // Calculate comprehensive stats
      const now = new Date();
      const thisMonth = data?.filter(s => {
        const created = new Date(s.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0;

      setStats({
        total: data?.length || 0,
        active: data?.filter(s => s.is_active && s.status === 'active').length || 0,
        inactive: data?.filter(s => !s.is_active).length || 0,
        bounced: data?.filter(s => s.status === 'bounced' || s.bounce_count > 0).length || 0,
        thisMonth,
      });

    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchSubscribers();
      toast({
        title: "Success",
        description: `Subscriber ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber",
        variant: "destructive",
      });
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'First Name', 'Last Name', 'Source', 'Status', 'Active', 'Bounce Count', 'Tags', 'Created At'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.first_name || '',
        sub.last_name || '',
        sub.source || 'website',
        sub.status || 'active',
        sub.is_active ? 'Yes' : 'No',
        sub.bounce_count || 0,
        sub.tags?.join(';') || '',
        new Date(sub.created_at).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Subscriber Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Total Active Subscribers: ${activeSubscribers.length}`, 20, 50);
    doc.text(`Total All Subscribers: ${subscribers.length}`, 20, 60);
    
    doc.setFontSize(14);
    doc.text('Active Subscribers:', 20, 80);
    
    let yPosition = 95;
    doc.setFontSize(10);
    
    doc.text('Email', 20, yPosition);
    doc.text('Name', 120, yPosition);
    doc.text('Subscribed', 180, yPosition);
    yPosition += 10;
    
    activeSubscribers.forEach((subscriber) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const name = subscriber.first_name || subscriber.last_name 
        ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
        : '-';
      
      doc.text(subscriber.email, 20, yPosition);
      doc.text(name, 120, yPosition);
      doc.text(new Date(subscriber.subscription_date).toLocaleDateString(), 180, yPosition);
      yPosition += 8;
    });
    
    doc.save(`subscribers_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const sendCampaign = async () => {
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both subject and body for the campaign",
        variant: "destructive",
      });
      return;
    }

    const activeSubscribers = subscribers.filter(s => s.is_active && s.status === 'active');
    
    if (activeSubscribers.length === 0) {
      toast({
        title: "No Subscribers",
        description: "There are no active subscribers to send the campaign to",
        variant: "destructive",
      });
      return;
    }

    setSendingCampaign(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: activeSubscribers.map(s => s.email),
          subject: campaignSubject,
          htmlBody: campaignBody,
        },
      });

      if (error) throw error;

      const subscriberIds = activeSubscribers.map(s => s.id);
      await supabase
        .from('newsletter_subscribers')
        .update({ last_email_sent: new Date().toISOString() })
        .in('id', subscriberIds);

      toast({
        title: "Campaign Sent!",
        description: `Successfully sent to ${activeSubscribers.length} subscribers`,
      });

      setCampaignSubject("");
      setCampaignBody("");
      setCampaignDialogOpen(false);
      await fetchSubscribers();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.first_name && sub.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sub.last_name && sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate source breakdown for analytics
  const sourceBreakdown = subscribers.reduce((acc, sub) => {
    const source = sub.source || 'website';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Database className="h-6 w-6" />
            Subscriber Management
          </h2>
          <p className="text-muted-foreground">
            Unified analytics, management, and campaigns
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounced</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.bounced}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.thisMonth}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Subscriber health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activation Rate</span>
                  <span className="text-sm font-medium">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  <span className="text-sm font-medium">
                    {stats.total > 0 ? Math.round((stats.bounced / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Growth This Month</span>
                  <span className="text-sm font-medium text-green-600">+{stats.thisMonth}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Breakdown</CardTitle>
                <CardDescription>Where subscribers come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(sourceBreakdown).slice(0, 5).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <Badge variant="outline">{source}</Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{stats.active}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bounced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-2xl font-bold">{stats.bounced}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.thisMonth}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lead Source Analysis</CardTitle>
              <CardDescription>Distribution of subscriber sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(sourceBreakdown).map(([source, count]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{source}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((count / stats.total) * 100)}%
                        </span>
                      </div>
                      <span className="text-sm font-medium">{count} subscribers</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>Lead quality and engagement indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Bounce Count</p>
                  <p className="text-2xl font-bold">
                    {subscribers.length > 0 
                      ? (subscribers.reduce((sum, s) => sum + (s.bounce_count || 0), 0) / subscribers.length).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subscribers with Tags</p>
                  <p className="text-2xl font-bold">
                    {subscribers.filter(s => s.tags && s.tags.length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={exportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Subscribers ({filteredSubscribers.length})</CardTitle>
              <CardDescription>View and manage your subscriber database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Bounces</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Last Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.email}</TableCell>
                          <TableCell>
                            {sub.first_name || sub.last_name 
                              ? `${sub.first_name || ''} ${sub.last_name || ''}`.trim()
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sub.source || 'website'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
                              {sub.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                              {sub.is_active ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>{sub.bounce_count || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {sub.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {sub.tags && sub.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{sub.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(sub.subscription_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {sub.last_email_sent 
                              ? new Date(sub.last_email_sent).toLocaleDateString()
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSubscriberStatus(sub.id, sub.is_active)}
                            >
                              {sub.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Campaigns
                  </CardTitle>
                  <CardDescription>
                    Send newsletters to {stats.active} active subscribers
                  </CardDescription>
                </div>
                <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Send Newsletter Campaign</DialogTitle>
                      <DialogDescription>
                        Send an email campaign to all {stats.active} active subscribers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Enter email subject..."
                          value={campaignSubject}
                          onChange={(e) => setCampaignSubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body">Email Body (HTML supported)</Label>
                        <Textarea
                          id="body"
                          placeholder="Enter your email content... You can use HTML tags for formatting."
                          value={campaignBody}
                          onChange={(e) => setCampaignBody(e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Alert>
                        <AlertDescription>
                          This will send an email to all {stats.active} active subscribers via Postmark.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCampaignDialogOpen(false)}
                        disabled={sendingCampaign}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={sendCampaign}
                        disabled={sendingCampaign || !campaignSubject.trim() || !campaignBody.trim()}
                      >
                        {sendingCampaign ? "Sending..." : `Send to ${stats.active} Subscribers`}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Campaign Tips:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Keep subject lines under 50 characters for better open rates</li>
                      <li>Use HTML for rich formatting and images</li>
                      <li>Test your email before sending to all subscribers</li>
                      <li>Campaigns are sent only to active, non-bounced subscribers</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Readiness</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Subscribers</span>
                      <span className="text-sm font-medium">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bounced/Excluded</span>
                      <span className="text-sm font-medium">{stats.bounced}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ready to Receive</span>
                      <span className="text-sm font-medium text-green-600">{stats.active}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};