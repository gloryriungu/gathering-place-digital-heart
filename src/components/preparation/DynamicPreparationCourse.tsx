import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProgressTracker, defaultSteps } from "@/components/shared/ProgressTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Award, Download, ChevronRight, ChevronLeft, BookOpen, CheckCircle, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Resource {
  id: string;
  title: string;
  content: string;
  estimated_time: number | null;
  display_order: number;
}

interface Question {
  id: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string | null;
  explanation: string | null;
  display_order: number;
  is_required: boolean;
}

interface DynamicPreparationCourseProps {
  applicationId: string;
  programId: string;
  programType: "baptism" | "baby_dedication";
}

export const DynamicPreparationCourse = ({ 
  applicationId, 
  programId, 
  programType 
}: DynamicPreparationCourseProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStage, setCurrentStage] = useState<"reading" | "test" | "complete">("reading");
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testScore, setTestScore] = useState<number | null>(null);

  // Fetch resources
  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["program-resources", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_resources")
        .select("*")
        .eq("program_id", programId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as Resource[];
    },
  });

  // Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["program-questions", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_questions")
        .select("*")
        .eq("program_id", programId)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data.map(q => ({
        ...q,
        options: q.options as string[] | null
      })) as Question[];
    },
  });

  // Fetch progress
  const { data: progress } = useQuery({
    queryKey: ["applicant-progress", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applicant_progress")
        .select("resource_id")
        .eq("application_id", applicationId);
      
      if (error) throw error;
      return data.map(p => p.resource_id);
    },
  });

  // Fetch existing responses
  const { data: existingResponses } = useQuery({
    queryKey: ["applicant-responses", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applicant_responses")
        .select("*")
        .eq("application_id", applicationId);
      
      if (error) throw error;
      return data;
    },
  });

  // Mark resource complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from("applicant_progress")
        .insert({
          application_id: applicationId,
          resource_id: resourceId,
        });
      
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicant-progress", applicationId] });
    },
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async ({ questionId, response, isCorrect }: { 
      questionId: string; 
      response: string; 
      isCorrect: boolean | null;
    }) => {
      // Check if response already exists
      const existing = existingResponses?.find(r => r.question_id === questionId);
      
      if (existing) {
        const { error } = await supabase
          .from("applicant_responses")
          .update({ response, is_correct: isCorrect, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("applicant_responses")
          .insert({
            application_id: applicationId,
            question_id: questionId,
            response,
            is_correct: isCorrect,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicant-responses", applicationId] });
    },
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("program_applications")
        .update({ status })
        .eq("id", applicationId);
      
      if (error) throw error;
    },
  });

  // Check if all resources are completed
  const allResourcesCompleted = resources && progress && 
    resources.every(r => progress.includes(r.id));

  // Check if test is already completed
  useEffect(() => {
    if (existingResponses && questions && existingResponses.length === questions.length) {
      const correctCount = existingResponses.filter(r => r.is_correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      if (score >= 75) {
        setCurrentStage("complete");
        setTestScore(score);
      }
    }
  }, [existingResponses, questions]);

  const handleMarkResourceComplete = (resourceId: string) => {
    markCompleteMutation.mutate(resourceId);
  };

  const handleNextResource = () => {
    if (resources && currentResourceIndex < resources.length - 1) {
      setCurrentResourceIndex(prev => prev + 1);
    }
  };

  const handlePrevResource = () => {
    if (currentResourceIndex > 0) {
      setCurrentResourceIndex(prev => prev - 1);
    }
  };

  const handleStartTest = () => {
    if (!allResourcesCompleted) {
      toast.error("Please complete all reading materials first");
      return;
    }
    setCurrentStage("test");
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = async () => {
    if (!questions) return;

    let correctCount = 0;
    
    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (!userAnswer && question.is_required) {
        toast.error("Please answer all required questions");
        return;
      }

      let isCorrect: boolean | null = null;
      if (question.question_type === "multiple_choice" && question.correct_answer) {
        isCorrect = userAnswer === question.correct_answer;
        if (isCorrect) correctCount++;
      }

      await submitResponseMutation.mutateAsync({
        questionId: question.id,
        response: userAnswer || "",
        isCorrect,
      });
    }

    const score = Math.round((correctCount / questions.length) * 100);
    setTestScore(score);

    if (score >= 75) {
      setCurrentStage("complete");
      await updateApplicationMutation.mutateAsync("completed");
      toast.success(`Congratulations! You passed with ${score}%`);
    } else {
      toast.error(`You scored ${score}%. You need 75% to pass. Please review and try again.`);
    }
  };

  const getProgressSteps = () => {
    const steps = [...defaultSteps];
    
    if (currentStage === "reading") {
      steps[0].status = "current";
      steps[1].status = "upcoming";
      steps[2].status = "upcoming";
    } else if (currentStage === "test") {
      steps[0].status = "completed";
      steps[1].status = "current";
      steps[2].status = "upcoming";
    } else {
      steps[0].status = "completed";
      steps[1].status = "completed";
      steps[2].status = "completed";
    }
    
    return steps;
  };

  const getCurrentStep = () => {
    if (currentStage === "reading") return 0;
    if (currentStage === "test") return 1;
    return 2;
  };

  if (loadingResources || loadingQuestions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No resources created by pastor yet
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preparation Materials Coming Soon</CardTitle>
          <CardDescription>
            The pastor is preparing the learning materials for this program. 
            Please check back later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      <ProgressTracker 
        currentStep={getCurrentStep()} 
        totalSteps={3} 
        steps={getProgressSteps()} 
      />

      {/* Reading Stage */}
      {currentStage === "reading" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {resources[currentResourceIndex]?.title}
                  </CardTitle>
                  {resources[currentResourceIndex]?.estimated_time && (
                    <CardDescription>
                      Estimated reading time: {resources[currentResourceIndex].estimated_time} minutes
                    </CardDescription>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentResourceIndex + 1} of {resources.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {resources[currentResourceIndex]?.content}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevResource}
              disabled={currentResourceIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {!progress?.includes(resources[currentResourceIndex]?.id) ? (
                <Button
                  onClick={() => handleMarkResourceComplete(resources[currentResourceIndex].id)}
                  disabled={markCompleteMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              ) : (
                <Badge className="bg-green-500">Completed</Badge>
              )}
            </div>

            {currentResourceIndex < resources.length - 1 ? (
              <Button onClick={handleNextResource}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleStartTest}
                disabled={!allResourcesCompleted}
              >
                Start Assessment
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Resource list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {resources.map((resource, index) => (
                  <AccordionItem key={resource.id} value={resource.id}>
                    <AccordionTrigger 
                      className="hover:no-underline"
                      onClick={() => setCurrentResourceIndex(index)}
                    >
                      <div className="flex items-center gap-2">
                        {progress?.includes(resource.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2" />
                        )}
                        <span>{resource.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        {resource.estimated_time ? `${resource.estimated_time} min read` : "Reading material"}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Stage */}
      {currentStage === "test" && questions && questions.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Assessment</h2>
            <p className="text-muted-foreground">
              Test your understanding. You need 75% to pass.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-4 pb-6 border-b last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold">{index + 1}.</span>
                    <span>{question.question}</span>
                    {question.is_required && <span className="text-destructive">*</span>}
                  </div>

                  {question.question_type === "multiple_choice" && question.options && (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="pl-6 space-y-2"
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(optIndex)} id={`${question.id}-${optIndex}`} />
                          <Label htmlFor={`${question.id}-${optIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(question.question_type === "text" || question.question_type === "essay") && (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Your answer..."
                      rows={question.question_type === "essay" ? 4 : 2}
                      className="ml-6"
                    />
                  )}
                </div>
              ))}

              <Button 
                className="w-full" 
                onClick={handleSubmitTest}
                disabled={submitResponseMutation.isPending}
              >
                {submitResponseMutation.isPending ? "Submitting..." : "Submit Assessment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complete Stage */}
      {currentStage === "complete" && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Award className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">
              {programType === "baptism" ? "Baptism" : "Baby Dedication"} Preparation Complete!
            </CardTitle>
            <CardDescription>
              Congratulations! You've successfully completed the preparation course.
              {testScore && ` Final Score: ${testScore}%`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {programType === "baptism" 
                  ? "You're now ready for your baptism ceremony. The pastoral team will contact you with the ceremony details."
                  : "You're now ready to dedicate your child. The pastoral team will contact you with the ceremony details."
                }
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
