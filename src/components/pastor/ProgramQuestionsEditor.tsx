import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Question {
  id: string;
  program_id: string;
  question: string;
  question_type: string;
  options: any;
  correct_answer: string;
  explanation: string;
  display_order: number;
  is_required: boolean;
}

interface Program {
  id: string;
  title: string;
  program_type: string;
}

export const ProgramQuestionsEditor = () => {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });

  const { data: programs } = useQuery({
    queryKey: ["preparation-programs-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preparation_programs")
        .select("id, title, program_type")
        .order("ceremony_date", { ascending: false });
      
      if (error) throw error;
      return data as Program[];
    },
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ["program-questions", selectedProgram],
    queryFn: async () => {
      if (!selectedProgram) return [];
      
      const { data, error } = await supabase
        .from("program_questions")
        .select("*")
        .eq("program_id", selectedProgram)
        .order("display_order");
      
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!selectedProgram,
  });

  const createOrUpdateQuestion = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const questionData: any = {
        program_id: selectedProgram,
        question: data.question,
        question_type: data.question_type,
        explanation: data.explanation,
        created_by: user.id,
        display_order: editingQuestion ? editingQuestion.display_order : (questions?.length || 0),
      };

      if (data.question_type === "multiple_choice") {
        questionData.options = data.options.filter(opt => opt.trim());
        questionData.correct_answer = data.correct_answer;
      } else {
        questionData.options = null;
        questionData.correct_answer = data.correct_answer || null;
      }

      if (editingQuestion) {
        const { error } = await supabase
          .from("program_questions")
          .update(questionData)
          .eq("id", editingQuestion.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("program_questions")
          .insert(questionData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-questions"] });
      toast.success(editingQuestion ? "Question updated" : "Question created");
      resetForm();
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("program_questions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-questions"] });
      toast.success("Question deleted");
    },
  });

  const toggleRequired = useMutation({
    mutationFn: async ({ id, is_required }: { id: string; is_required: boolean }) => {
      const { error } = await supabase
        .from("program_questions")
        .update({ is_required })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-questions"] });
    },
  });

  const reorderQuestion = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("program_questions")
        .update({ display_order: newOrder })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-questions"] });
    },
  });

  const resetForm = () => {
    setFormData({
      question: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    });
    setEditingQuestion(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      question_type: question.question_type,
      options: question.question_type === "multiple_choice" && question.options ? 
        [...question.options, "", "", "", ""].slice(0, 4) : ["", "", "", ""],
      correct_answer: question.correct_answer || "",
      explanation: question.explanation || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateQuestion.mutate(formData);
  };

  const moveQuestion = (question: Question, direction: "up" | "down") => {
    if (!questions) return;
    
    const currentIndex = questions.findIndex(q => q.id === question.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    
    reorderQuestion.mutate({ id: question.id, newOrder: targetIndex });
    reorderQuestion.mutate({ id: questions[targetIndex].id, newOrder: currentIndex });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question Management</h2>
          <p className="text-muted-foreground">
            Create assessment questions for programs
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Program</Label>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a program" />
            </SelectTrigger>
            <SelectContent>
              {programs?.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.title} ({program.program_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProgram && (
          <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? "Edit" : "Add"} Question</DialogTitle>
                  <DialogDescription>
                    Create assessment questions for participants
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_type">Question Type</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="text">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  {formData.question_type === "multiple_choice" && (
                    <>
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        {formData.options.map((option, index) => (
                          <Input
                            key={index}
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                          />
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="correct_answer">Correct Answer (option number)</Label>
                        <Input
                          id="correct_answer"
                          type="number"
                          min="1"
                          max="4"
                          value={formData.correct_answer}
                          onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                          placeholder="e.g., 1 for first option"
                          required
                        />
                      </div>
                    </>
                  )}

                  {formData.question_type === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="correct_answer">Expected Answer (optional)</Label>
                      <Input
                        id="correct_answer"
                        value={formData.correct_answer}
                        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                        placeholder="For reference only"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (optional)</Label>
                    <Textarea
                      id="explanation"
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows={3}
                      placeholder="Provide context or explanation for the answer"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createOrUpdateQuestion.isPending}>
                    {createOrUpdateQuestion.isPending ? "Saving..." : "Save Question"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {isLoading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : questions && questions.length > 0 ? (
              <div className="grid gap-4">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base">{question.question}</CardTitle>
                          <CardDescription>
                            {question.question_type === "multiple_choice" ? "Multiple Choice" : 
                             question.question_type === "text" ? "Short Answer" : "Essay"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveQuestion(question, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveQuestion(question, "down")}
                              disabled={index === questions.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Required</Label>
                            <Switch
                              checked={question.is_required}
                              onCheckedChange={(checked) => toggleRequired.mutate({ id: question.id, is_required: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {question.question_type === "multiple_choice" && question.options && (
                        <div className="mb-4 space-y-1">
                          {question.options.map((option: string, idx: number) => (
                            <div key={idx} className="text-sm">
                              {idx + 1}. {option}
                              {question.correct_answer === (idx + 1).toString() && (
                                <span className="ml-2 text-green-500">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteQuestion.mutate(question.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No questions yet. Click "Add Question" to create one.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};