import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, MessageSquare } from "lucide-react";

interface ApplicationWithProgress {
  id: string;
  user_id: string;
  status: string;
  resource_access_granted: boolean;
  user_name: string;
  preparation_programs: {
    id: string;
    title: string;
    program_type: string;
  };
  progress: Array<{
    resource_id: string;
    completed_at: string;
  }>;
  responses: Array<{
    question_id: string;
    response: string;
    is_correct: boolean;
    pastor_feedback: string;
  }>;
}

export const CandidateProgressViewer = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["candidate-progress"],
    queryFn: async () => {
      const { data: apps, error: appsError } = await supabase
        .from("program_applications")
        .select(`
          *,
          preparation_programs (id, title, program_type)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      
      if (appsError) throw appsError;

      // Get progress, responses, and profiles for each application
      const appsWithProgress = await Promise.all(
        apps.map(async (app) => {
          const [progressData, responsesData, profileData] = await Promise.all([
            supabase
              .from("applicant_progress")
              .select("resource_id, completed_at")
              .eq("application_id", app.id),
            supabase
              .from("applicant_responses")
              .select("question_id, response, is_correct, pastor_feedback")
              .eq("application_id", app.id),
            supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("user_id", app.user_id)
              .single(),
          ]);

          return {
            ...app,
            user_name: profileData.data ? 
              `${profileData.data.first_name} ${profileData.data.last_name}` : 
              "Unknown User",
            progress: progressData.data || [],
            responses: responsesData.data || [],
          };
        })
      );

      return appsWithProgress as ApplicationWithProgress[];
    },
  });

  const { data: resourceCounts } = useQuery({
    queryKey: ["resource-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_resources")
        .select("program_id")
        .eq("is_active", true);
      
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((resource) => {
        counts[resource.program_id] = (counts[resource.program_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: questionCounts } = useQuery({
    queryKey: ["question-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_questions")
        .select("program_id")
        .eq("is_required", true);
      
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((question) => {
        counts[question.program_id] = (counts[question.program_id] || 0) + 1;
      });
      return counts;
    },
  });

  const calculateProgress = (app: ApplicationWithProgress) => {
    const programId = app.preparation_programs?.id;
    if (!programId) return 0;

    const totalResources = resourceCounts?.[programId] || 0;
    const totalQuestions = questionCounts?.[programId] || 0;
    const total = totalResources + totalQuestions;

    if (total === 0) return 100;

    const completed = app.progress.length + app.responses.length;
    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading candidate progress...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Candidate Progress</h2>
        <p className="text-muted-foreground">
          Monitor participant progress through the program
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Candidates</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications && applications.length > 0 ? (
            <div className="grid gap-4">
              {applications.map((app) => {
                const progress = calculateProgress(app);
                const isComplete = progress === 100;

                return (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>
                            {app.user_name}
                          </CardTitle>
                          <CardDescription>
                            {app.preparation_programs?.title}
                          </CardDescription>
                        </div>
                        <Badge variant={isComplete ? "default" : "secondary"}>
                          {isComplete ? "Ready" : "In Progress"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {app.progress.length > 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>Resources: {app.progress.length}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {app.responses.length > 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>Responses: {app.responses.length}</span>
                          </div>
                        </div>
                      </div>

                      {app.responses.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <MessageSquare className="h-4 w-4" />
                            Recent Responses
                          </div>
                          {app.responses.slice(0, 3).map((response, idx) => (
                            <div key={idx} className="text-sm pl-6 text-muted-foreground">
                              {response.response.substring(0, 80)}...
                              {response.pastor_feedback && (
                                <span className="ml-2 text-xs text-blue-500">(Feedback given)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No approved candidates yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {applications?.filter(app => calculateProgress(app) < 100).map((app) => (
            <div key={app.id} className="text-sm">
              {app.user_name} - {calculateProgress(app)}%
            </div>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {applications?.filter(app => calculateProgress(app) === 100).map((app) => (
            <div key={app.id} className="text-sm">
              {app.user_name} ✓
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};