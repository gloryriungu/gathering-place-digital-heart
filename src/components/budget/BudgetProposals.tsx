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
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

interface BudgetProposal {
  id: string;
  submitted_by: string;
  department_id: string;
  proposal_type: string;
  amount: number;
  period_start: string;
  period_end: string;
  description: string;
  justification: string;
  status: string;
  reviewed_by: string | null;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface BudgetProposalsProps {
  userRole?: string;
  canCreate?: boolean;
  canReview?: boolean;
}

export const BudgetProposals = ({ userRole, canCreate = false, canReview = false }: BudgetProposalsProps) => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [userRole]);

  const fetchProposals = async () => {
    try {
      let query = supabase.from('budget_proposals').select('*');
      
      // Filter based on user role - accounts can only see their own
      if (userRole === 'accounts') {
        const user = await supabase.auth.getUser();
        query = query.eq('submitted_by', user.data.user?.id);
      }
      
      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
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

  const handleCreateProposal = async (formData: FormData) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('budget_proposals')
        .insert({
          submitted_by: user.data.user?.id,
          department_id: formData.get('department_id') as string,
          proposal_type: formData.get('proposal_type') as string,
          amount: parseFloat(formData.get('amount') as string),
          period_start: formData.get('period_start') as string,
          period_end: formData.get('period_end') as string,
          description: formData.get('description') as string,
          justification: formData.get('justification') as string
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Budget proposal submitted successfully"
      });

      setIsCreateOpen(false);
      fetchProposals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReviewProposal = async (proposalId: string, status: string, notes?: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('budget_proposals')
        .update({
          status,
          reviewed_by: user.data.user?.id,
          review_notes: notes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Proposal ${status} successfully`
      });

      fetchProposals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'revision_required': return 'secondary';
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading budget proposals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Proposals</h2>
          <p className="text-muted-foreground">
            {canReview 
              ? "Review and manage budget proposals from departments"
              : "Submit and track your budget proposals"
            }
          </p>
        </div>
        
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Budget Proposal</DialogTitle>
                <DialogDescription>Submit a new budget proposal for review</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateProposal(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select name="department_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accounts">Accounts</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="sound">Sound</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="proposal_type">Proposal Type</Label>
                    <Select name="proposal_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly Budget</SelectItem>
                        <SelectItem value="monthly">Monthly Budget</SelectItem>
                        <SelectItem value="quarterly">Quarterly Budget</SelectItem>
                        <SelectItem value="annual">Annual Budget</SelectItem>
                        <SelectItem value="special">Special Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Period Start</Label>
                    <Input name="period_start" type="date" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period_end">Period End</Label>
                    <Input name="period_end" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input name="description" required placeholder="Brief description of the budget request" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea 
                    name="justification" 
                    required 
                    placeholder="Explain why this budget is needed and how it will be used..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">Submit Proposal</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                {canReview && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proposal.description}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {proposal.justification}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{proposal.department_id}</TableCell>
                  <TableCell className="capitalize">{proposal.proposal_type}</TableCell>
                  <TableCell className="font-medium">${proposal.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(proposal.period_start).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(proposal.period_end).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      <Badge variant={getStatusColor(proposal.status)}>
                        {proposal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(proposal.submitted_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  {canReview && (
                    <TableCell>
                      {proposal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReviewProposal(proposal.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const notes = prompt("Review notes:");
                              if (notes) {
                                handleReviewProposal(proposal.id, 'rejected', notes);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {proposal.review_notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <FileText className="h-3 w-3 inline mr-1" />
                          {proposal.review_notes}
                        </div>
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