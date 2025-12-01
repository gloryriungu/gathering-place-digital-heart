import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Key } from "lucide-react";

interface Application {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  application_notes: string;
  resource_access_granted: boolean;
  created_at: string;
  preparation_programs: {
    title: string;
    program_type: string;
    ceremony_date: string;
  };
}

export const ProgramApplicationsManager = () => {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["program-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_applications")
        .select(`
          *,
          preparation_programs (title, program_type, ceremony_date)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Fetch profile data separately for each application
      const appsWithProfiles = await Promise.all(
        data.map(async (app) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", app.user_id)
            .single();
          
          return {
            ...app,
            user_name: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown User"
          };
        })
      );

      return appsWithProfiles;
    },
  });

  const updateApplication = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      resource_access_granted 
    }: { 
      id: string; 
      status: string; 
      resource_access_granted?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: any = {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (reviewNotes) {
        updateData.application_notes = reviewNotes;
      }

      if (resource_access_granted !== undefined) {
        updateData.resource_access_granted = resource_access_granted;
      }

      const { error } = await supabase
        .from("program_applications")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-applications"] });
      toast.success("Application updated successfully");
      setSelectedApplication(null);
      setReviewNotes("");
    },
    onError: (error) => {
      toast.error("Failed to update application");
      console.error(error);
    },
  });

  const handleApprove = (application: Application) => {
    updateApplication.mutate({ 
      id: application.id, 
      status: "approved",
      resource_access_granted: true 
    });
  };

  const handleReject = (application: Application) => {
    updateApplication.mutate({ 
      id: application.id, 
      status: "rejected" 
    });
  };

  const toggleResourceAccess = (application: Application) => {
    updateApplication.mutate({ 
      id: application.id, 
      status: application.status,
      resource_access_granted: !application.resource_access_granted 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-yellow-500";
    }
  };

  const filterApplications = (status: string) => {
    return applications?.filter(app => app.status === status) || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Application Management</h2>
        <p className="text-muted-foreground">
          Review and manage program applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({filterApplications("pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({filterApplications("approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({filterApplications("rejected").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterApplications("completed").length})
          </TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "completed"].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : filterApplications(status).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No {status} applications
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterApplications(status).map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>
                            {(application as any).user_name}
                          </CardTitle>
                          <CardDescription>
                            {application.preparation_programs?.title}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {application.application_notes && (
                          <div className="text-sm">
                            <strong>Notes:</strong> {application.application_notes}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {application.resource_access_granted ? (
                            <Badge variant="outline" className="bg-green-500/10">
                              <Key className="h-3 w-3 mr-1" />
                              Resources Granted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10">
                              <Key className="h-3 w-3 mr-1" />
                              Resources Locked
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(application)}
                                disabled={updateApplication.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve & Grant Access
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(application)}
                                disabled={updateApplication.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleResourceAccess(application)}
                              disabled={updateApplication.isPending}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              {application.resource_access_granted ? "Revoke Access" : "Grant Access"}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <strong>Applicant:</strong> {(selectedApplication as any).user_name}
              </div>
              <div>
                <strong>Program:</strong> {selectedApplication.preparation_programs?.title}
              </div>
              <div>
                <strong>Applied:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong> <Badge className={getStatusColor(selectedApplication.status)}>{selectedApplication.status}</Badge>
              </div>
              <div>
                <Textarea
                  placeholder="Add review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};