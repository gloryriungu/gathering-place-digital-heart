import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, Download } from "lucide-react";
import { format } from "date-fns";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  county: string;
  number_of_attendees: number;
  special_requirements: string;
  status: string;
  created_at: string;
  custom_fields?: Record<string, any>;
}

interface EventRegistrationsViewerProps {
  eventId: string;
  eventTitle: string;
  registrationDeadline?: string;
  customFields?: any[];
}

export const EventRegistrationsViewer = ({ 
  eventId, 
  eventTitle,
  registrationDeadline,
  customFields = []
}: EventRegistrationsViewerProps) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const deadlinePassed = registrationDeadline && new Date(registrationDeadline) < new Date();

  useEffect(() => {
    fetchRegistrations();
    
    // Real-time subscription
    const channel = supabase
      .channel(`event-${eventId}-registrations`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${eventId}` },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } else {
      setRegistrations(data as any || []);
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
    const headers = ['Name', 'Email', 'Phone', 'County', 'Attendees', 'Status', 'Registered'];
    
    // Add custom field headers
    customFields.forEach((field: any) => {
      headers.push(field.label);
    });

    const csvContent = [
      headers,
      ...registrations.map(reg => {
        const row = [
          `${reg.first_name} ${reg.last_name}`,
          reg.email,
          reg.phone || 'N/A',
          reg.county || 'N/A',
          reg.number_of_attendees,
          reg.status,
          format(new Date(reg.created_at), 'MMM dd, yyyy'),
        ];
        
        // Add custom field values
        customFields.forEach((field: any) => {
          row.push(reg.custom_fields?.[field.id] || 'N/A');
        });
        
        return row;
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '-')}-registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    attended: registrations.filter(r => r.status === 'attended').length,
    totalAttendees: registrations.reduce((sum, r) => sum + r.number_of_attendees, 0),
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
              <p className="text-lg font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div>
            <p className="text-xs text-muted-foreground">Attended</p>
            <p className="text-lg font-bold">{stats.attended}</p>
          </div>
        </Card>
        
        <Card className="p-3">
          <div>
            <p className="text-xs text-muted-foreground">Total People</p>
            <p className="text-lg font-bold">{stats.totalAttendees}</p>
          </div>
        </Card>
      </div>

      {deadlinePassed && (
        <Badge variant="destructive" className="mb-2">
          Registration Deadline Passed
        </Badge>
      )}

      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {customFields.length > 0 && <TableHead>Custom</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={customFields.length > 0 ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    No registrations yet
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                      {reg.first_name} {reg.last_name}
                    </TableCell>
                    <TableCell>{reg.email}</TableCell>
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
                    <TableCell className="text-sm">
                      {format(new Date(reg.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    {customFields.length > 0 && (
                      <TableCell>
                        {reg.custom_fields && Object.keys(reg.custom_fields).length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const customData = customFields
                                .map((field: any) => `${field.label}: ${reg.custom_fields?.[field.id] || 'N/A'}`)
                                .join('\n');
                              alert(`Custom Fields:\n\n${customData}`);
                            }}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    )}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
