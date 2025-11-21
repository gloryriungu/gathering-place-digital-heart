import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CreditCard, Pause, Play, Trash2, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatAmount, getContributionTypeLabel } from "@/lib/paystack";
import { format } from "date-fns";

interface RecurringContribution {
  id: string;
  contribution_type: string;
  amount: number;
  frequency: string;
  status: string;
  next_charge_date: string;
  last_charge_date: string | null;
  last_charge_status: string | null;
  failed_attempts: number;
  payment_method: any;
}

export const RecurringGivingManager = () => {
  const [recurringContributions, setRecurringContributions] = useState<RecurringContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecurringContributions();
  }, []);

  const loadRecurringContributions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recurring_contributions')
        .select(`
          *,
          payment_method:saved_payment_methods(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecurringContributions(data || []);
    } catch (error) {
      console.error('Error loading recurring contributions:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring contributions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('recurring_contributions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: newStatus === 'active' ? "Resumed" : "Paused",
        description: `Recurring giving has been ${newStatus === 'active' ? 'resumed' : 'paused'}`,
      });

      loadRecurringContributions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update recurring giving status",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_contributions')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cancelled",
        description: "Recurring giving has been cancelled",
      });

      loadRecurringContributions();
    } catch (error) {
      console.error('Error cancelling:', error);
      toast({
        title: "Error",
        description: "Failed to cancel recurring giving",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, failedAttempts: number) => {
    if (status === 'active' && failedAttempts > 0) {
      return <Badge variant="destructive">Payment Failed</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Giving</CardTitle>
        <CardDescription>
          Manage your automated monthly contributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recurringContributions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No recurring contributions set up</p>
            <p className="text-sm mt-1">
              Set up automated giving when making a contribution
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {getContributionTypeLabel(contribution.contribution_type)}
                      </h3>
                      {getStatusBadge(contribution.status, contribution.failed_attempts)}
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatAmount(contribution.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Monthly • Next charge: {format(new Date(contribution.next_charge_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {contribution.status !== 'cancelled' && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePauseResume(contribution.id, contribution.status)}
                        >
                          {contribution.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Recurring Giving?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will stop all future automated contributions. You can always set up recurring giving again later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Active</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(contribution.id)}>
                                Cancel Recurring
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  {contribution.payment_method?.phone_number ? (
                    <span>M-Pesa: {contribution.payment_method.phone_number}</span>
                  ) : (
                    <span>
                      {contribution.payment_method?.card_type} •••• {contribution.payment_method?.card_last4}
                    </span>
                  )}
                </div>

                {contribution.failed_attempts > 0 && contribution.status === 'active' && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Payment Failed</p>
                      <p className="text-muted-foreground mt-1">
                        {contribution.failed_attempts === 1 ? '1 failed attempt' : `${contribution.failed_attempts} failed attempts`}. 
                        Please check your payment method or update it in Saved Payment Methods.
                      </p>
                    </div>
                  </div>
                )}

                {contribution.last_charge_date && contribution.last_charge_status === 'completed' && (
                  <div className="text-sm text-muted-foreground">
                    Last successful charge: {format(new Date(contribution.last_charge_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
