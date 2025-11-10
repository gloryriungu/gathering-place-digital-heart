import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, Plus, Trash2, AlertTriangle } from "lucide-react";

interface SuppressionEntry {
  id: string;
  email: string;
  reason: string;
  notes: string;
  added_at: string;
}

export const SuppressionListManager = () => {
  const [suppressions, setSuppressions] = useState<SuppressionEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    reason: "manual",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const fetchSuppressions = async () => {
    try {
      const { data, error } = await supabase
        .from('suppression_list')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;
      setSuppressions(data || []);
    } catch (error: any) {
      console.error('Error fetching suppressions:', error);
      toast({
        title: "Error",
        description: "Failed to load suppression list",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('suppression_list')
        .insert({
          email: formData.email.toLowerCase(),
          reason: formData.reason,
          notes: formData.notes,
          added_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email added to suppression list",
      });

      setDialogOpen(false);
      setFormData({ email: "", reason: "manual", notes: "" });
      fetchSuppressions();
    } catch (error: any) {
      console.error('Error adding suppression:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFromSuppression = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppression_list')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email removed from suppression list",
      });

      fetchSuppressions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getReasonBadge = (reason: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      bounce: "destructive",
      spam_complaint: "destructive",
      unsubscribe: "secondary",
      manual: "outline",
    };
    return <Badge variant={variants[reason] || "outline"}>{reason}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Suppression List
            </CardTitle>
            <CardDescription>
              Emails that will not receive campaigns (bounces, spam complaints, unsubscribes)
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Suppression List</DialogTitle>
                <DialogDescription>
                  Manually add an email address to prevent future campaigns
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
                      <SelectItem value="spam_complaint">Spam Complaint</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add to Suppression List
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppressions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No suppressed emails
                  </TableCell>
                </TableRow>
              ) : (
                suppressions.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.email}</TableCell>
                    <TableCell>{getReasonBadge(entry.reason)}</TableCell>
                    <TableCell>{entry.notes || '-'}</TableCell>
                    <TableCell>{new Date(entry.added_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromSuppression(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};
