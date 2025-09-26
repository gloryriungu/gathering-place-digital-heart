import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import jsPDF from 'jspdf';

interface Requisition {
  id: string;
  department_id: string;
  requested_by: string;
  approved_by: string | null;
  request_type: string;
  title: string;
  description: string;
  amount: number | null;
  priority: string;
  status: string;
  reason: string | null;
  requested_date: string;
  required_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface RequisitionManagerProps {
  userRole?: string;
  departmentId?: string;
}

export const RequisitionManager = ({ userRole, departmentId }: RequisitionManagerProps) => {
  const { toast } = useToast();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);

  useEffect(() => {
    fetchRequisitions();
  }, [departmentId, userRole]);

  const fetchRequisitions = async () => {
    try {
      let query = supabase.from('requisitions').select('*');
      
      // Filter based on user role
      if (departmentId && userRole !== 'accounts' && userRole !== 'admin') {
        query = query.eq('department_id', departmentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRequisitions(data || []);
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

  const handleCreateRequisition = async (formData: FormData) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('requisitions')
        .insert({
          department_id: departmentId || formData.get('department_id') as string,
          requested_by: user.data.user.id,
          request_type: formData.get('request_type') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          amount: formData.get('amount') ? parseFloat(formData.get('amount') as string) : null,
          priority: formData.get('priority') as string,
          required_by: formData.get('required_by') as string || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Requisition submitted successfully"
      });

      setIsCreateOpen(false);
      fetchRequisitions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (requisitionId: string, status: string, reason?: string) => {
    try {
      const user = await supabase.auth.getUser();
      const updates: any = {
        status,
        approved_by: user.data.user?.id,
        approved_at: new Date().toISOString()
      };

      if (reason) {
        updates.reason = reason;
      }

      const { error } = await supabase
        .from('requisitions')
        .update(updates)
        .eq('id', requisitionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Requisition ${status} successfully`
      });

      fetchRequisitions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text('Requisitions Report', 20, yPosition);
    yPosition += 15;

    // Add generated date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Add table headers
    pdf.setFontSize(12);
    pdf.text('Title', 20, yPosition);
    pdf.text('Dept', 70, yPosition);
    pdf.text('Type', 100, yPosition);
    pdf.text('Amount', 130, yPosition);
    pdf.text('Status', 160, yPosition);
    yPosition += 10;

    // Add requisitions data
    pdf.setFontSize(10);
    requisitions.forEach((req) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(req.title.substring(0, 25), 20, yPosition);
      pdf.text(req.department_id, 70, yPosition);
      pdf.text(req.request_type, 100, yPosition);
      pdf.text(req.amount ? `$${req.amount.toFixed(2)}` : '-', 130, yPosition);
      pdf.text(req.status, 160, yPosition);
      yPosition += 8;
    });

    pdf.save(`requisitions-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading requisitions...</div>;
  }

  const canManageRequisitions = userRole === 'accounts' || userRole === 'founder';
  const canCreateRequisitions = departmentId || userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Requisitions</h2>
          <p className="text-muted-foreground">
            {canManageRequisitions 
              ? "Review and manage department requisition requests"
              : "Submit and track your department's requisition requests"
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {canCreateRequisitions && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Requisition
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Requisition</DialogTitle>
                <DialogDescription>Submit a new requisition request</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateRequisition(new FormData(e.currentTarget)); }} className="space-y-4">
                {!departmentId && (
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select name="department_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="sound">Sound</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="accounts">Accounts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="request_type">Request Type</Label>
                    <Select name="request_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget Request</SelectItem>
                        <SelectItem value="inventory">Inventory/Equipment</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" required placeholder="Brief description of the request" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    name="description" 
                    required 
                    placeholder="Detailed description of what you need and why..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (if applicable)</Label>
                    <Input name="amount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="required_by">Required By</Label>
                    <Input name="required_by" type="date" />
                  </div>
                </div>

                <Button type="submit" className="w-full">Submit Requisition</Button>
              </form>
            </DialogContent>
          </Dialog>
          )}
          
          <Button onClick={exportToPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Requisitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                {canManageRequisitions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.map((requisition) => (
                <TableRow key={requisition.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{requisition.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {requisition.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{requisition.department_id}</TableCell>
                  <TableCell className="capitalize">{requisition.request_type}</TableCell>
                  <TableCell>
                    {requisition.amount ? `$${requisition.amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(requisition.priority)}>
                      {requisition.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(requisition.status)}
                      <span className="capitalize">{requisition.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(requisition.requested_date).toLocaleDateString()}
                  </TableCell>
                  {canManageRequisitions && (
                    <TableCell>
                      {requisition.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(requisition.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt("Reason for rejection:");
                              if (reason) {
                                handleStatusUpdate(requisition.id, 'rejected', reason);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {requisition.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(requisition.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};