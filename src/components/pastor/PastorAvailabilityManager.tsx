import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clock, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const availabilitySchema = z.object({
  day_of_week: z.string().min(1, { message: "Please select a day" }),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)" }),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)" }),
  session_duration: z.number().min(15).max(180, { message: "Duration must be between 15-180 minutes" }),
  max_sessions: z.number().min(1).max(20, { message: "Max sessions must be between 1-20" }),
  is_active: z.boolean(),
}).refine((data) => data.start_time < data.end_time, {
  message: "End time must be after start time",
  path: ["end_time"],
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
  max_sessions: number;
  is_active: boolean;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function PastorAvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      day_of_week: "",
      start_time: "09:00",
      end_time: "17:00",
      session_duration: 60,
      max_sessions: 4,
      is_active: true,
    },
  });

  const fetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pastor_availability")
        .select("*")
        .eq("pastor_id", user.id)
        .order("day_of_week", { ascending: true });

      if (error) throw error;

      // Sort by day of week order
      const sortedData = (data || []).sort((a, b) => {
        return daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week);
      });

      setAvailabilities(sortedData);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const onSubmit = async (values: AvailabilityFormValues) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      if (editingAvailability) {
        // Update existing availability
        const { error } = await supabase
          .from("pastor_availability")
          .update({
            day_of_week: values.day_of_week,
            start_time: values.start_time + ":00",
            end_time: values.end_time + ":00",
            session_duration: values.session_duration,
            max_sessions: values.max_sessions,
            is_active: values.is_active,
          })
          .eq("id", editingAvailability.id);

        if (error) throw error;
        toast.success("Availability updated successfully");
      } else {
        // Create new availability
        const { error } = await supabase
          .from("pastor_availability")
          .insert({
            pastor_id: user.id,
            day_of_week: values.day_of_week,
            start_time: values.start_time + ":00",
            end_time: values.end_time + ":00",
            session_duration: values.session_duration,
            max_sessions: values.max_sessions,
            is_active: values.is_active,
          });

        if (error) throw error;
        toast.success("Availability added successfully");
      }

      setDialogOpen(false);
      setEditingAvailability(null);
      form.reset();
      fetchAvailability();
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error(error.message || "Failed to save availability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (availability: Availability) => {
    setEditingAvailability(availability);
    form.reset({
      day_of_week: availability.day_of_week,
      start_time: availability.start_time.substring(0, 5),
      end_time: availability.end_time.substring(0, 5),
      session_duration: availability.session_duration,
      max_sessions: availability.max_sessions,
      is_active: availability.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("pastor_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Availability deleted successfully");
      fetchAvailability();
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Failed to delete availability");
    } finally {
      setDeleting(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingAvailability(null);
      form.reset();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Schedule</CardTitle>
          <CardDescription>Loading your schedule...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Schedule
            </CardTitle>
            <CardDescription>
              Set your weekly availability for counseling sessions
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAvailability ? "Edit Availability" : "Add Availability"}
                </DialogTitle>
                <DialogDescription>
                  Set your available times for counseling appointments
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="day_of_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="session_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={15}
                            max={180}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          How long each counseling session should last
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_sessions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Sessions Per Day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of sessions you can handle this day
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Allow bookings for this time slot
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingAvailability ? "Update" : "Add"} Availability
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {availabilities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No availability schedule set</p>
            <p className="text-sm">Add your available times to allow members to book counseling sessions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((availability) => (
              <Card key={availability.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{availability.day_of_week}</span>
                        <Badge variant={availability.is_active ? "default" : "secondary"}>
                          {availability.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {availability.start_time.substring(0, 5)} - {availability.end_time.substring(0, 5)}
                        {" • "}
                        {availability.session_duration} min sessions
                        {" • "}
                        Max {availability.max_sessions} sessions/day
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(availability)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleting === availability.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Availability?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove your availability for {availability.day_of_week}.
                              Members will no longer be able to book sessions during this time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(availability.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
