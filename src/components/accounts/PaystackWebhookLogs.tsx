import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WebhookLog {
  id: string;
  event_type: string;
  event_data: any;
  signature_valid: boolean;
  processing_status: string;
  processing_error: string | null;
  reference: string | null;
  related_contribution_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  processed_at: string | null;
}

export function PaystackWebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('paystack_webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq('processing_status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`reference.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      toast.error('Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('webhook-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paystack_webhook_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      pending: "secondary",
      failed: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const viewDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Event Type', 'Reference', 'Status', 'Signature Valid', 'Error'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.event_type,
      log.reference || 'N/A',
      log.processing_status,
      log.signature_valid ? 'Yes' : 'No',
      log.processing_error || 'None'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Webhook logs exported successfully');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Paystack Webhook Logs</CardTitle>
              <CardDescription>
                Monitor and audit all incoming Paystack webhook events
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                Export CSV
              </Button>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or event type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading webhook logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No webhook logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.reference || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.processing_status)}</TableCell>
                      <TableCell>
                        {log.signature_valid ? (
                          <Badge variant="default">Valid</Badge>
                        ) : (
                          <Badge variant="destructive">Invalid</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Webhook Event Details</DialogTitle>
            <DialogDescription>
              Full details of the webhook event and processing status
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                    <p className="text-sm font-mono">{selectedLog.event_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reference</p>
                    <p className="text-sm font-mono">{selectedLog.reference || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="text-sm">{format(new Date(selectedLog.created_at), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processed At</p>
                    <p className="text-sm">
                      {selectedLog.processed_at 
                        ? format(new Date(selectedLog.processed_at), 'PPpp')
                        : 'Not processed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processing Status</p>
                    <div className="mt-1">{getStatusBadge(selectedLog.processing_status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signature Valid</p>
                    <div className="mt-1">
                      {selectedLog.signature_valid ? (
                        <Badge variant="default">Valid</Badge>
                      ) : (
                        <Badge variant="destructive">Invalid</Badge>
                      )}
                    </div>
                  </div>
                  {selectedLog.ip_address && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                      <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                    </div>
                  )}
                  {selectedLog.related_contribution_id && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contribution ID</p>
                      <p className="text-sm font-mono">{selectedLog.related_contribution_id}</p>
                    </div>
                  )}
                </div>

                {selectedLog.processing_error && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Processing Error</p>
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      {selectedLog.processing_error}
                    </div>
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">User Agent</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Full Event Data</p>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.event_data, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
