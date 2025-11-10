import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, Eye, Trash2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  status: string;
  segment_filters: any;
  created_at: string;
}

export const CampaignBuilder = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    html_content: "",
    text_content: "",
    segment_source: "",
    segment_tags: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const segment_filters: any = {};
      if (formData.segment_source) segment_filters.source = formData.segment_source;
      if (formData.segment_tags) segment_filters.tags = formData.segment_tags.split(',').map(t => t.trim());

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          name: formData.name,
          subject: formData.subject,
          html_content: formData.html_content,
          text_content: formData.text_content,
          segment_filters,
          status: 'draft',
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        subject: "",
        html_content: "",
        text_content: "",
        segment_source: "",
        segment_tags: "",
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('send-campaign', {
        body: { campaign_id: campaignId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign is being sent",
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign deleted",
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Create and manage targeted email campaigns with segmentation
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                  <DialogDescription>
                    Design your email campaign with personalization and segmentation
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="html_content">Email Content (HTML)</Label>
                    <Textarea
                      id="html_content"
                      value={formData.html_content}
                      onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                      rows={8}
                      placeholder="Use {{first_name}} and {{last_name}} for personalization"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_content">Plain Text Version (Optional)</Label>
                    <Textarea
                      id="text_content"
                      value={formData.text_content}
                      onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Segmentation (Optional)</h4>
                    
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="segment_source">Filter by Source</Label>
                      <Input
                        id="segment_source"
                        value={formData.segment_source}
                        onChange={(e) => setFormData({ ...formData, segment_source: e.target.value })}
                        placeholder="e.g., website, event, form"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="segment_tags">Filter by Tags (comma-separated)</Label>
                      <Input
                        id="segment_tags"
                        value={formData.segment_tags}
                        onChange={(e) => setFormData({ ...formData, segment_tags: e.target.value })}
                        placeholder="e.g., member, visitor, volunteer"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Campaign"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No campaigns yet</TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.subject}</TableCell>
                    <TableCell>
                      <Badge variant={
                        campaign.status === 'sent' ? 'default' :
                        campaign.status === 'sending' ? 'secondary' :
                        campaign.status === 'failed' ? 'destructive' :
                        'outline'
                      }>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendCampaign(campaign.id)}
                            disabled={loading}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
