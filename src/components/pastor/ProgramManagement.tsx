import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Calendar, Users, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Program {
  id: string;
  program_type: string;
  title: string;
  description: string;
  ceremony_date: string;
  ceremony_time: string;
  location: string;
  max_participants: number;
  registration_deadline: string;
  status: string;
  created_at: string;
}

export const ProgramManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    program_type: "baptism",
    title: "",
    description: "",
    ceremony_date: "",
    ceremony_time: "",
    location: "",
    max_participants: "",
    registration_deadline: "",
    status: "draft"
  });

  const { data: programs, isLoading } = useQuery({
    queryKey: ["preparation-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preparation_programs")
        .select("*")
        .order("ceremony_date", { ascending: false });
      
      if (error) throw error;
      return data as Program[];
    },
  });

  const createProgram = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("preparation_programs")
        .insert({
          ...data,
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          created_by: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preparation-programs"] });
      toast.success("Program created successfully");
      setIsDialogOpen(false);
      setFormData({
        program_type: "baptism",
        title: "",
        description: "",
        ceremony_date: "",
        ceremony_time: "",
        location: "",
        max_participants: "",
        registration_deadline: "",
        status: "draft"
      });
    },
    onError: (error) => {
      toast.error("Failed to create program");
      console.error(error);
    },
  });

  const updateProgramStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("preparation_programs")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preparation-programs"] });
      toast.success("Program status updated");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProgram.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500";
      case "closed": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Program Management</h2>
          <p className="text-muted-foreground">
            Create and manage Baptism and Baby Dedication programs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogDescription>
                Set up a new Baptism or Baby Dedication program
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program_type">Program Type</Label>
                <Select
                  value={formData.program_type}
                  onValueChange={(value) => setFormData({ ...formData, program_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baptism">Baptism</SelectItem>
                    <SelectItem value="baby_dedication">Baby Dedication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Program Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., March 2025 Baptism Class"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the program"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceremony_date">Ceremony Date</Label>
                  <Input
                    id="ceremony_date"
                    type="date"
                    value={formData.ceremony_date}
                    onChange={(e) => setFormData({ ...formData, ceremony_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ceremony_time">Ceremony Time</Label>
                  <Input
                    id="ceremony_time"
                    type="time"
                    value={formData.ceremony_time}
                    onChange={(e) => setFormData({ ...formData, ceremony_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ceremony location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open for Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createProgram.isPending}>
                {createProgram.isPending ? "Creating..." : "Create Program"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading programs...</div>
      ) : (
        <div className="grid gap-4">
          {programs?.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{program.title}</CardTitle>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {program.program_type === "baptism" ? "Baptism" : "Baby Dedication"}
                    </CardDescription>
                  </div>
                  <Select
                    value={program.status}
                    onValueChange={(value) => updateProgramStatus.mutate({ id: program.id, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {program.description && (
                  <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};