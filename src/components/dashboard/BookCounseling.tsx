import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";
import { Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";

interface PastorAvailability {
  id: string;
  pastor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
  max_sessions: number;
  is_active: boolean;
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  pastorId: string;
  availabilityId: string;
}

interface MySession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
}

const SESSION_TYPES = [
  { value: 'general', label: 'General Counseling' },
  { value: 'marriage', label: 'Marriage Counseling' },
  { value: 'family', label: 'Family Counseling' },
  { value: 'spiritual', label: 'Spiritual Guidance' },
  { value: 'grief', label: 'Grief Support' },
];

export const BookCounseling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkAccess } = usePrerequisiteGuard("Book Counseling");
  const [availability, setAvailability] = useState<PastorAvailability[]>([]);
  const [mySessions, setMySessions] = useState<MySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState('general');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAvailability();
    if (user) {
      fetchMySessions();
    }
  }, [user]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('pastor_availability')
      .select('*')
      .eq('is_active', true);

    if (error) {
      toast({ title: "Error", description: "Failed to load availability", variant: "destructive" });
    } else {
      setAvailability(data || []);
    }
    setLoading(false);
  };

  const fetchMySessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('counseling_sessions')
      .select('id, session_date, start_time, end_time, session_type, status')
      .eq('member_id', user.id)
      .gte('session_date', format(new Date(), 'yyyy-MM-dd'))
      .order('session_date');

    if (data) {
      setMySessions(data);
    }
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate slots for next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dayName = dayNames[date.getDay()];

      const dayAvailability = availability.filter(a => a.day_of_week === dayName);
      
      dayAvailability.forEach(avail => {
        const startHour = parseInt(avail.start_time.split(':')[0]);
        const endHour = parseInt(avail.end_time.split(':')[0]);
        const duration = avail.session_duration;

        for (let hour = startHour; hour < endHour; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;
          
          slots.push({
            date: format(date, 'yyyy-MM-dd'),
            startTime,
            endTime,
            pastorId: avail.pastor_id,
            availabilityId: avail.id
          });
        }
      });
    }

    return slots;
  };

  const handleBookSession = async () => {
    if (!user || !selectedSlot) return;
    if (!checkAccess()) return;

    setBooking(true);

    const { error } = await supabase
      .from('counseling_sessions')
      .insert({
        member_id: user.id,
        pastor_id: selectedSlot.pastorId,
        session_date: selectedSlot.date,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        session_type: sessionType,
        member_notes: notes,
        status: 'scheduled'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to book session", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your counseling session has been booked" });
      setSelectedSlot(null);
      setNotes('');
      fetchMySessions();
    }
    setBooking(false);
  };

  const timeSlots = generateTimeSlots();

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Book a Counseling Session</h2>
        <p className="text-muted-foreground mt-1">Schedule a confidential session with one of our pastors</p>
      </div>

      {/* My Upcoming Sessions */}
      {mySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mySessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{format(parseISO(session.session_date), 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.start_time} - {session.end_time} • {SESSION_TYPES.find(t => t.value === session.session_type)?.label}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.status === 'scheduled' ? 'default' : session.status === 'completed' ? 'secondary' : 'destructive'}>
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Slots */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Time Slots</CardTitle>
              <CardDescription>Select a date and time for your session</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(slotsByDate).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No availability found. Please check back later.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(slotsByDate).slice(0, 7).map(([date, slots]) => (
                    <div key={date}>
                      <h4 className="font-medium mb-2">{format(parseISO(date), 'EEEE, MMMM d')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, idx) => {
                          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime;
                          return (
                            <Button
                              key={idx}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {slot.startTime}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSlot ? (
                <>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(selectedSlot.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea 
                      placeholder="Brief description of what you'd like to discuss..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleBookSession}
                    disabled={booking}
                  >
                    {booking ? "Booking..." : "Book Session"}
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a time slot to book your session
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
