import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Program {
  id: string;
  program_type: string;
  title: string;
  description: string | null;
  ceremony_date: string;
  ceremony_time: string | null;
  location: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  status: string;
}

interface Application {
  id: string;
  program_id: string;
  status: string;
  resource_access_granted: boolean;
  created_at: string;
}

interface ProgramApplicationFlowProps {
  programType: "baptism" | "baby_dedication";
  onApplicationApproved: (applicationId: string, programId: string) => void;
}

export const ProgramApplicationFlow = ({ programType, onApplicationApproved }: ProgramApplicationFlowProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch open programs
  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ["open-programs", programType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preparation_programs")
        .select("*")
        .eq("program_type", programType)
        .eq("status", "open")
        .order("ceremony_date", { ascending: true });
      
      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch user's applications
  const { data: myApplications, isLoading: loadingApplications } = useQuery({
    queryKey: ["my-program-applications", programType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("program_applications")
        .select(`
          id,
          program_id,
          status,
          resource_access_granted,
          created_at,
          preparation_programs!inner(program_type)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Filter by program type
      return (data || []).filter(
        (app: any) => app.preparation_programs?.program_type === programType
      ) as Application[];
    },
    enabled: !!user?.id,
  });

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async ({ programId, notes }: { programId: string; notes: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("program_applications")
        .insert({
          program_id: programId,
          user_id: user.id,
          application_notes: notes || null,
          status: "pending",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-program-applications"] });
      toast.success("Application submitted successfully!");
      setIsDialogOpen(false);
      setApplicationNotes("");
      setSelectedProgram(null);
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("You have already applied to this program");
      } else {
        toast.error("Failed to submit application");
      }
    },
  });

  const getApplicationForProgram = (programId: string) => {
    return myApplications?.find(app => app.program_id === programId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  // Check if user has an approved application
  const approvedApplication = myApplications?.find(
    app => app.status === "approved" && app.resource_access_granted
  );

  // If user has approved application with access, trigger the callback
  if (approvedApplication) {
    onApplicationApproved(approvedApplication.id, approvedApplication.program_id);
  }

  if (loadingPrograms || loadingApplications) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show application status if user has pending/approved applications
  const activeApplication = myApplications?.find(
    app => ["pending", "approved"].includes(app.status)
  );

  if (activeApplication && !approvedApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeApplication.status === "pending" ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            {getStatusBadge(activeApplication.status)}
          </div>
          
          {activeApplication.status === "pending" && (
            <p className="text-muted-foreground">
              Your application is being reviewed by our pastoral team. You'll be notified once it's approved and you'll gain access to the preparation materials.
            </p>
          )}
          
          {activeApplication.status === "approved" && !activeApplication.resource_access_granted && (
            <p className="text-muted-foreground">
              Your application has been approved! The pastor will grant you access to the resources soon.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Programs Available</CardTitle>
          <CardDescription>
            There are currently no {programType === "baptism" ? "baptism" : "baby dedication"} programs open for registration.
            Please check back later or contact the church office for more information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Available Programs</h2>
        <p className="text-muted-foreground">
          Select a program to apply for {programType === "baptism" ? "baptism" : "baby dedication"} preparation
        </p>
      </div>

      <div className="grid gap-4">
        {programs.map((program) => {
          const existingApplication = getApplicationForProgram(program.id);
          
          return (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{program.title}</CardTitle>
                    {program.description && (
                      <CardDescription className="mt-1">{program.description}</CardDescription>
                    )}
                  </div>
                  {existingApplication && getStatusBadge(existingApplication.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(program.ceremony_date).toLocaleDateString()}</span>
                  </div>
                  {program.ceremony_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{program.ceremony_time}</span>
                    </div>
                  )}
                  {program.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{program.location}</span>
                    </div>
                  )}
                  {program.max_participants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Max: {program.max_participants}</span>
                    </div>
                  )}
                </div>

                {program.registration_deadline && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Registration deadline: {new Date(program.registration_deadline).toLocaleDateString()}
                  </p>
                )}

                {!existingApplication && (
                  <Dialog open={isDialogOpen && selectedProgram?.id === program.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedProgram(program)}>
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {program.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application to join this {programType === "baptism" ? "baptism" : "baby dedication"} program.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Notes (optional)</label>
                          <Textarea
                            placeholder="Any additional information you'd like to share..."
                            value={applicationNotes}
                            onChange={(e) => setApplicationNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => applyMutation.mutate({ 
                            programId: program.id, 
                            notes: applicationNotes 
                          })}
                          disabled={applyMutation.isPending}
                        >
                          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
