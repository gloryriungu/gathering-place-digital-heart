import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, parse, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  pastor_id: z.string().uuid({ message: "Please select a pastor" }),
  session_date: z.date({
    required_error: "Please select a date",
  }),
  time_slot: z.string().min(1, { message: "Please select a time slot" }),
  session_type: z.string().min(1, { message: "Please select a session type" }),
  member_notes: z.string().max(500, { message: "Notes must be less than 500 characters" }).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Pastor {
  id: string;
  email: string;
  raw_user_meta_data: {
    first_name?: string;
    last_name?: string;
  };
}

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface CounselingBookingFormProps {
  onSuccess?: () => void;
}

const sessionTypes = [
  { value: "general", label: "General Counseling" },
  { value: "marriage", label: "Marriage Counseling" },
  { value: "family", label: "Family Counseling" },
  { value: "pre-marital", label: "Pre-Marital Counseling" },
  { value: "grief", label: "Grief Counseling" },
  { value: "addiction", label: "Addiction Recovery" },
];

export default function CounselingBookingForm({ onSuccess }: CounselingBookingFormProps) {
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      member_notes: "",
    },
  });

  const selectedDate = form.watch("session_date");
  const selectedPastor = form.watch("pastor_id");

  // Fetch pastors with pastor or senior_pastor roles
  useEffect(() => {
    const fetchPastors = async () => {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["pastor", "senior_pastor"]);

      if (error) {
        console.error("Error fetching pastor roles:", error);
        return;
      }

      if (!userRoles || userRoles.length === 0) {
        return;
      }

      const pastorIds = userRoles.map(role => role.user_id);
      
      // Fetch pastor user details from auth.users via profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", pastorIds);

      if (profileError) {
        console.error("Error fetching pastor profiles:", profileError);
        return;
      }

      const pastorsData = profiles?.map(profile => ({
        id: profile.user_id,
        email: "",
        raw_user_meta_data: {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
        }
      })) || [];

      setPastors(pastorsData);
    };

    fetchPastors();
  }, []);

  // Fetch available time slots when date and pastor are selected
  useEffect(() => {
    if (!selectedDate || !selectedPastor) {
      setAvailableTimeSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      setFetchingSlots(true);
      try {
        const dayOfWeek = format(selectedDate, "EEEE");
        
        // Fetch pastor availability for the selected day
        const { data: availability, error: availError } = await supabase
          .from("pastor_availability")
          .select("*")
          .eq("pastor_id", selectedPastor)
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true)
          .maybeSingle();

        if (availError) {
          console.error("Error fetching availability:", availError);
          toast.error("Failed to fetch available time slots");
          return;
        }

        if (!availability) {
          setAvailableTimeSlots([]);
          toast.info("Pastor is not available on this day");
          return;
        }

        // Fetch existing bookings for that day
        const { data: existingBookings, error: bookingError } = await supabase
          .from("counseling_sessions")
          .select("start_time, end_time")
          .eq("pastor_id", selectedPastor)
          .eq("session_date", format(selectedDate, "yyyy-MM-dd"))
          .in("status", ["scheduled", "confirmed"]);

        if (bookingError) {
          console.error("Error fetching existing bookings:", bookingError);
        }

        // Generate time slots based on availability
        const slots: TimeSlot[] = [];
        const startTime = parse(availability.start_time, "HH:mm:ss", new Date());
        const endTime = parse(availability.end_time, "HH:mm:ss", new Date());
        const sessionDuration = availability.session_duration;

        let currentSlot = startTime;
        while (isBefore(currentSlot, endTime)) {
          const slotEnd = addDays(currentSlot, 0);
          slotEnd.setMinutes(slotEnd.getMinutes() + sessionDuration);
          
          if (isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime()) {
            const slotStartStr = format(currentSlot, "HH:mm:ss");
            const slotEndStr = format(slotEnd, "HH:mm:ss");
            
            // Check if slot is already booked
            const isBooked = existingBookings?.some(booking => 
              booking.start_time === slotStartStr
            );

            if (!isBooked) {
              slots.push({
                start_time: slotStartStr,
                end_time: slotEndStr,
              });
            }
          }
          
          currentSlot = slotEnd;
        }

        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error("Error processing time slots:", error);
        toast.error("Failed to process available time slots");
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, selectedPastor]);

  const onSubmit = async (values: BookingFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to book a session");
        return;
      }

      const [startTime, endTime] = values.time_slot.split(" - ");

      const { error } = await supabase
        .from("counseling_sessions")
        .insert({
          pastor_id: values.pastor_id,
          member_id: user.id,
          session_date: format(values.session_date, "yyyy-MM-dd"),
          start_time: startTime,
          end_time: endTime,
          session_type: values.session_type,
          member_notes: values.member_notes || null,
          status: "scheduled",
        });

      if (error) throw error;

      toast.success("Counseling session booked successfully!");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error booking session:", error);
      toast.error(error.message || "Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Pastor Selection */}
        <FormField
          control={form.control}
          name="pastor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Pastor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pastor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pastors.map((pastor) => (
                    <SelectItem key={pastor.id} value={pastor.id}>
                      {pastor.raw_user_meta_data.first_name} {pastor.raw_user_meta_data.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the pastor you'd like to meet with
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Session Type */}
        <FormField
          control={form.control}
          name="session_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                What type of counseling do you need?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Picker */}
        <FormField
          control={form.control}
          name="session_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Appointment Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      isBefore(startOfDay(date), startOfDay(new Date()))
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select a date for your appointment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Slot Selection */}
        <FormField
          control={form.control}
          name="time_slot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Time Slots</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedDate || !selectedPastor || fetchingSlots}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      fetchingSlots ? "Loading slots..." : 
                      !selectedDate || !selectedPastor ? "Select date and pastor first" :
                      availableTimeSlots.length === 0 ? "No slots available" :
                      "Choose a time slot"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimeSlots.map((slot, index) => (
                    <SelectItem 
                      key={index} 
                      value={`${slot.start_time} - ${slot.end_time}`}
                    >
                      {format(parse(slot.start_time, "HH:mm:ss", new Date()), "h:mm a")} - 
                      {format(parse(slot.end_time, "HH:mm:ss", new Date()), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {fetchingSlots ? "Checking availability..." : 
                 availableTimeSlots.length > 0 ? `${availableTimeSlots.length} slot(s) available` :
                 selectedDate && selectedPastor ? "No available slots for this date" : 
                 "Select a date and pastor to see available times"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="member_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share any specific concerns or topics you'd like to discuss..."
                  className="resize-none"
                  rows={4}
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Book Appointment
        </Button>
      </form>
    </Form>
  );
}
