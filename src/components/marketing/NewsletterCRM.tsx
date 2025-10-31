import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Users, Search, Plus, Download, Send, UserCheck, UserX } from "lucide-react";
import jsPDF from "jspdf";

interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_date: string;
  last_email_sent: string | null;
  is_active: boolean;
  subscription_preferences: any;
}

export const NewsletterCRM = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscription_date', { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(s => s.is_active).length || 0;
      const inactive = total - active;
      const thisMonth = data?.filter(s => 
        new Date(s.subscription_date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0;

      setStats({ total, active, inactive, thisMonth });
    } catch (error) {
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

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Newsletter Subscribers Report', 20, 20);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Total Active Subscribers: ${activeSubscribers.length}`, 20, 50);
    doc.text(`Total All Subscribers: ${subscribers.length}`, 20, 60);
    
    // Subscribers List
    doc.setFontSize(14);
    doc.text('Active Subscribers:', 20, 80);
    
    let yPosition = 95;
    doc.setFontSize(10);
    
    // Headers
    doc.text('Email', 20, yPosition);
    doc.text('Name', 120, yPosition);
    doc.text('Subscribed', 180, yPosition);
    yPosition += 10;
    
    activeSubscribers.forEach((subscriber, index) => {
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
    
    doc.save(`newsletter_subscribers_${new Date().toISOString().split('T')[0]}.pdf`);
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

    const activeSubscribers = subscribers.filter(s => s.is_active);
    
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
      // Send bulk email via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: activeSubscribers.map(s => s.email),
          subject: campaignSubject,
          htmlBody: campaignBody,
        },
      });

      if (error) throw error;

      // Update last_email_sent for all active subscribers
      const subscriberIds = activeSubscribers.map(s => s.id);
      await supabase
        .from('newsletter_subscribers')
        .update({ last_email_sent: new Date().toISOString() })
        .in('id', subscriberIds);

      toast({
        title: "Campaign Sent!",
        description: `Successfully sent to ${activeSubscribers.length} subscribers`,
      });

      // Reset form and close dialog
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

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscriber.first_name && subscriber.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subscriber.last_name && subscriber.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Newsletter & CRM Management
          </h2>
          <p className="text-muted-foreground">
            Manage newsletter subscribers and customer relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Newsletter Campaign</DialogTitle>
                <DialogDescription>
                  Send an email campaign to all {stats.active} active subscribers using Postmark
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
                    This will send an email to all {stats.active} active subscribers. The sender will be 1040458@cuea.edu via Postmark.
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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          <CardDescription>
            Manage your newsletter subscriber base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>
                    {subscriber.first_name || subscriber.last_name 
                      ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(subscriber.subscription_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subscriber.last_email_sent 
                      ? new Date(subscriber.last_email_sent).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                    >
                      {subscriber.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};