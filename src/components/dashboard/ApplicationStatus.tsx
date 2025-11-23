import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  application_date: string;
  reviewed_at: string | null;
  notes: string | null;
}

export const ApplicationStatus = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('join_family_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        title: "Error",
        description: "Failed to load application status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approved',
          variant: 'default' as const,
          color: 'text-green-600',
          description: 'Your application has been approved! Welcome to the family.',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending Review',
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          description: 'Your application is being reviewed by our team.',
        };
      case 'contacted':
        return {
          icon: MessageSquare,
          label: 'Contacted',
          variant: 'outline' as const,
          color: 'text-blue-600',
          description: 'We have reached out to you. Please check your email.',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          label: 'Needs Review',
          variant: 'destructive' as const,
          color: 'text-red-600',
          description: 'Please contact the church office for more information.',
        };
      default:
        return {
          icon: Clock,
          label: status,
          variant: 'secondary' as const,
          color: 'text-gray-600',
          description: 'Application status unknown.',
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Family Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Family Application</CardTitle>
          <CardDescription>You haven't submitted an application yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ready to become a part of our church family?
          </p>
          <a
            href="/join-the-family"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit Application
          </a>
        </CardContent>
      </Card>
    );
  }

  const statusDetails = getStatusDetails(application.status);
  const StatusIcon = statusDetails.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Family Application</CardTitle>
        <CardDescription>Your membership application status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${statusDetails.color}`} />
            <div>
              <Badge variant={statusDetails.variant}>{statusDetails.label}</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {statusDetails.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Application Date:</span>
            <span className="font-medium">
              {format(new Date(application.application_date), 'MMM dd, yyyy')}
            </span>
          </div>
          
          {application.reviewed_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reviewed Date:</span>
              <span className="font-medium">
                {format(new Date(application.reviewed_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Applicant:</span>
            <span className="font-medium">
              {application.first_name} {application.last_name}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{application.email}</span>
          </div>
        </div>

        {application.status === 'pending' && (
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>What's next?</strong> Our registration team will review your application within 3-5 business days. 
              You'll receive an email once your application has been processed.
            </p>
          </div>
        )}

        {application.status === 'approved' && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mt-4">
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>Congratulations!</strong> You're now officially part of our church family. 
              Check your email for next steps and information about upcoming events.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
