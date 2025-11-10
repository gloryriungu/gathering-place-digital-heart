import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, Calendar, Users, MessageSquare } from "lucide-react";

interface PastorAvailability {
  id: string;
  pastor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
  max_sessions: number;
  is_active: boolean;
  created_at: string;
}

interface CounselingSession {
  id: string;
  pastor_id: string;
  member_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
  notes: string | null;
  member_notes: string | null;
  created_at: string;
}

interface PastorAvailabilityProps {
  isPastor?: boolean;
}

export const PastorAvailability = ({ isPastor = false }: PastorAvailabilityProps) => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<PastorAvailability[]>([]);
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [allAvailability, setAllAvailability] = useState<PastorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAvailabilityOpen, setIsAddAvailabilityOpen] = useState(false);
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<PastorAvailability | null>(null);

  useEffect(() => {
    if (isPastor) {
      fetchMyAvailability();
      fetchMySessions();
    } else {
      fetchAllAvailability();
      fetchMySessions();
    }
  }, [isPastor]);

  const fetchMyAvailability = async () => {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('pastor_availability')
        .select('*')
        .eq('pastor_id', user.data.user?.id)
        .order('day_of_week');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_availability')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week');

      if (error) throw error;
      setAllAvailability(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMySessions = async () => {
    try {
      const user = await supabase.auth.getUser();
      let query = supabase.from('counseling_sessions').select('*');
      
      if (isPastor) {
        query = query.eq('pastor_id', user.data.user?.id);
      } else {
        query = query.eq('member_id', user.data.user?.id);
      }
      
      const { data, error } = await query.order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddAvailability = async (formData: FormData) => {
    try {
      const user = await supabase.auth.getUser();
      const { data: availabilityData, error } = await supabase
        .from('pastor_availability')
        .insert({
          pastor_id: user.data.user?.id,
          day_of_week: formData.get('day_of_week') as string,
          start_time: formData.get('start_time') as string,
          end_time: formData.get('end_time') as string,
          session_duration: parseInt(formData.get('session_duration') as string),
          max_sessions: parseInt(formData.get('max_sessions') as string)
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      if (user.data.user?.id) {
        await supabase.from("activity_logs").insert([{
          user_id: user.data.user.id,
          action: "create",
          entity_type: "pastor_availability",
          entity_id: availabilityData.id,
          details: {
            day: formData.get('day_of_week')?.toString(),
            time_range: `${formData.get('start_time')} - ${formData.get('end_time')}`,
            max_sessions: formData.get('max_sessions')?.toString()
          }
        }]);
      }

      toast({
        title: "Success",
        description: "Availability added successfully"
      });

      setIsAddAvailabilityOpen(false);
      fetchMyAvailability();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBookSession = async (formData: FormData) => {
    try {
      const user = await supabase.auth.getUser();
      
      // Check if user has approved join family application
      const { data: familyApp, error: familyError } = await supabase
        .from('join_family_applications')
        .select('id')
        .eq('user_id', user.data.user?.id)
        .eq('status', 'approved')
        .single();

      if (familyError || !familyApp) {
        toast({
          title: "Access Denied",
          description: "You must complete and have an approved Join Family application before booking counseling sessions.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('counseling_sessions')
        .insert({
          pastor_id: selectedAvailability?.pastor_id,
          member_id: user.data.user?.id,
          session_date: formData.get('session_date') as string,
          start_time: formData.get('start_time') as string,
          end_time: formData.get('end_time') as string,
          session_type: formData.get('session_type') as string,
          member_notes: formData.get('member_notes') as string || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Counseling session booked successfully"
      });

      setIsBookSessionOpen(false);
      setSelectedAvailability(null);
      fetchMySessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string, notes?: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      const updates: any = { status };
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('counseling_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      // Log activity
      if (user.data.user) {
        await supabase.from("activity_logs").insert([{
          user_id: user.data.user.id,
          action: status === 'completed' ? 'complete' : status === 'cancelled' ? 'cancel' : 'update',
          entity_type: "counseling_session",
          entity_id: sessionId,
          details: {
            new_status: status,
            notes_added: notes ? true : false
          }
        }]);
      }

      toast({
        title: "Success",
        description: "Session updated successfully"
      });

      fetchMySessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleAvailability = async (availabilityId: string, isActive: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('pastor_availability')
        .update({ is_active: !isActive })
        .eq('id', availabilityId);

      if (error) throw error;

      // Log activity
      if (user.data.user) {
        await supabase.from("activity_logs").insert([{
          user_id: user.data.user.id,
          action: "update",
          entity_type: "pastor_availability",
          entity_id: availabilityId,
          details: {
            status_changed_to: !isActive ? "active" : "inactive"
          }
        }]);
      }

      toast({
        title: "Success",
        description: `Availability ${!isActive ? 'activated' : 'deactivated'}`
      });

      fetchMyAvailability();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const sortedAvailability = (isPastor ? availability : allAvailability).sort(
    (a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isPastor ? "My Availability & Sessions" : "Pastor Counseling"}
          </h2>
          <p className="text-muted-foreground">
            {isPastor 
              ? "Manage your availability and counseling sessions"
              : "Book counseling sessions with available pastors"
            }
          </p>
        </div>
        
        {isPastor && (
          <Dialog open={isAddAvailabilityOpen} onOpenChange={setIsAddAvailabilityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Slot</DialogTitle>
                <DialogDescription>Set your availability for counseling sessions</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddAvailability(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Day of Week</Label>
                  <Select name="day_of_week" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input name="start_time" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input name="end_time" type="time" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_duration">Session Duration (minutes)</Label>
                    <Select name="session_duration" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_sessions">Max Sessions</Label>
                    <Input name="max_sessions" type="number" min="1" max="10" required />
                  </div>
                </div>

                <Button type="submit" className="w-full">Add Availability</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Availability Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isPastor ? "My Availability" : "Pastor Availability"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Max Sessions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAvailability.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="capitalize">{slot.day_of_week}</TableCell>
                  <TableCell>{slot.start_time} - {slot.end_time}</TableCell>
                  <TableCell>{slot.session_duration} min</TableCell>
                  <TableCell>{slot.max_sessions}</TableCell>
                  <TableCell>
                    <Badge variant={slot.is_active ? "default" : "secondary"}>
                      {slot.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isPastor ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAvailability(slot.id, slot.is_active)}
                      >
                        {slot.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    ) : slot.is_active ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAvailability(slot);
                          setIsBookSessionOpen(true);
                        }}
                      >
                        Book Session
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Book Session Dialog */}
      {!isPastor && (
        <Dialog open={isBookSessionOpen} onOpenChange={setIsBookSessionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Counseling Session</DialogTitle>
              <DialogDescription>
                Book a session for {selectedAvailability?.day_of_week} {selectedAvailability?.start_time}-{selectedAvailability?.end_time}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleBookSession(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session_date">Session Date</Label>
                <Input name="session_date" type="date" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input 
                    name="start_time" 
                    type="time" 
                    defaultValue={selectedAvailability?.start_time}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input 
                    name="end_time" 
                    type="time" 
                    defaultValue={selectedAvailability?.end_time}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_type">Session Type</Label>
                <Select name="session_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Counseling</SelectItem>
                    <SelectItem value="marriage">Marriage Counseling</SelectItem>
                    <SelectItem value="family">Family Issues</SelectItem>
                    <SelectItem value="grief">Grief Counseling</SelectItem>
                    <SelectItem value="addiction">Addiction Support</SelectItem>
                    <SelectItem value="spiritual">Spiritual Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_notes">Your Notes (Optional)</Label>
                <Input name="member_notes" placeholder="Brief description of what you'd like to discuss..." />
              </div>

              <Button type="submit" className="w-full">Book Session</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isPastor ? "My Sessions" : "My Counseling Sessions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                {isPastor && <TableHead>Member Notes</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                  <TableCell>{session.start_time} - {session.end_time}</TableCell>
                  <TableCell className="capitalize">{session.session_type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Badge variant={
                      session.status === 'completed' ? 'default' :
                      session.status === 'cancelled' ? 'destructive' :
                      session.status === 'no_show' ? 'destructive' : 'secondary'
                    }>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  {isPastor && (
                    <TableCell>{session.member_notes || '-'}</TableCell>
                  )}
                  <TableCell>
                    {isPastor && session.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateSessionStatus(session.id, 'completed', prompt('Session notes:') || undefined)}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSessionStatus(session.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {!isPastor && session.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSessionStatus(session.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};