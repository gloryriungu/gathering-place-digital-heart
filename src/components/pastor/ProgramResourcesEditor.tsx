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
import { Plus, Edit, Trash2, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Resource {
  id: string;
  program_id: string;
  title: string;
  content: string;
  estimated_time: number;
  display_order: number;
  is_active: boolean;
}

interface Program {
  id: string;
  title: string;
  program_type: string;
}

export const ProgramResourcesEditor = () => {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    estimated_time: "",
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

  const { data: resources, isLoading } = useQuery({
    queryKey: ["program-resources", selectedProgram],
    queryFn: async () => {
      if (!selectedProgram) return [];
      
      const { data, error } = await supabase
        .from("program_resources")
        .select("*")
        .eq("program_id", selectedProgram)
        .order("display_order");
      
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!selectedProgram,
  });

  const createOrUpdateResource = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const resourceData = {
        program_id: selectedProgram,
        ...data,
        estimated_time: parseInt(data.estimated_time) || null,
        created_by: user.id,
        display_order: editingResource ? editingResource.display_order : (resources?.length || 0),
      };

      if (editingResource) {
        const { error } = await supabase
          .from("program_resources")
          .update(resourceData)
          .eq("id", editingResource.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("program_resources")
          .insert(resourceData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-resources"] });
      toast.success(editingResource ? "Resource updated" : "Resource created");
      resetForm();
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("program_resources")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-resources"] });
      toast.success("Resource deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("program_resources")
        .update({ is_active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-resources"] });
    },
  });

  const reorderResource = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("program_resources")
        .update({ display_order: newOrder })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-resources"] });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", estimated_time: "" });
    setEditingResource(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      content: resource.content,
      estimated_time: resource.estimated_time?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateResource.mutate(formData);
  };

  const moveResource = (resource: Resource, direction: "up" | "down") => {
    if (!resources) return;
    
    const currentIndex = resources.findIndex(r => r.id === resource.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= resources.length) return;
    
    reorderResource.mutate({ id: resource.id, newOrder: targetIndex });
    reorderResource.mutate({ id: resources[targetIndex].id, newOrder: currentIndex });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
          <p className="text-muted-foreground">
            Create and manage reading materials for programs
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
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingResource ? "Edit" : "Add"} Resource</DialogTitle>
                  <DialogDescription>
                    Create reading material for program participants
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_time">Estimated Reading Time (minutes)</Label>
                    <Input
                      id="estimated_time"
                      type="number"
                      value={formData.estimated_time}
                      onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createOrUpdateResource.isPending}>
                    {createOrUpdateResource.isPending ? "Saving..." : "Save Resource"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {isLoading ? (
              <div className="text-center py-8">Loading resources...</div>
            ) : resources && resources.length > 0 ? (
              <div className="grid gap-4">
                {resources.map((resource, index) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle>{resource.title}</CardTitle>
                          <CardDescription>
                            {resource.estimated_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {resource.estimated_time} minutes
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveResource(resource, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveResource(resource, "down")}
                              disabled={index === resources.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Switch
                            checked={resource.is_active}
                            onCheckedChange={(checked) => toggleActive.mutate({ id: resource.id, is_active: checked })}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {resource.content}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteResource.mutate(resource.id)}
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
                  No resources yet. Click "Add Resource" to create one.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};