import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, CheckCircle, XCircle, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Registration {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  county: string;
  number_of_attendees: number;
  special_requirements: string;
  registration_type: string;
  status: string;
  created_at: string;
  media_content?: {
    title: string;
  };
}

export const EventRegistrationsManager = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
    
    // Real-time subscription
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('media_content')
      .select('id, title')
      .eq('content_type', 'event')
      .order('created_at', { ascending: false });
    
    if (data) setEvents(data);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        media_content:event_id (title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Registration status updated",
      });
      fetchRegistrations();
    }
  };

  const exportToCSV = () => {
    const filtered = getFilteredRegistrations();
    const csvContent = [
      ['Event', 'Name', 'Email', 'Phone', 'County', 'Attendees', 'Status', 'Registered'],
      ...filtered.map(reg => [
        reg.media_content?.title || 'N/A',
        `${reg.first_name} ${reg.last_name}`,
        reg.email,
        reg.phone || 'N/A',
        reg.county || 'N/A',
        reg.number_of_attendees,
        reg.status,
        format(new Date(reg.created_at), 'MMM dd, yyyy'),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getFilteredRegistrations = () => {
    return registrations.filter(reg => {
      const matchesSearch = 
        reg.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = selectedEvent === 'all' || reg.event_id === selectedEvent;
      const matchesStatus = selectedStatus === 'all' || reg.status === selectedStatus;
      
      return matchesSearch && matchesEvent && matchesStatus;
    });
  };

  const getStats = () => {
    const filtered = getFilteredRegistrations();
    return {
      total: filtered.length,
      confirmed: filtered.filter(r => r.status === 'confirmed').length,
      attended: filtered.filter(r => r.status === 'attended').length,
      totalAttendees: filtered.reduce((sum, r) => sum + r.number_of_attendees, 0),
    };
  };

  const stats = getStats();
  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Attended</p>
              <p className="text-2xl font-bold">{stats.attended}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Attendees</p>
              <p className="text-2xl font-bold">{stats.totalAttendees}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        {reg.media_content?.title || 'N/A'}
                      </TableCell>
                      <TableCell>{reg.first_name} {reg.last_name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone || 'N/A'}</TableCell>
                      <TableCell>{reg.number_of_attendees}</TableCell>
                      <TableCell>
                        <Badge variant={
                          reg.status === 'confirmed' ? 'default' :
                          reg.status === 'attended' ? 'secondary' :
                          'destructive'
                        }>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(reg.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {reg.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(reg.id, 'attended')}
                            >
                              Mark Attended
                            </Button>
                          )}
                          {reg.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(reg.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};
