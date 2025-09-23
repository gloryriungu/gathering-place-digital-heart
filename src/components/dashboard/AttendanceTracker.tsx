import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Users, Calendar, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  member_number?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  member_id: string;
  service_date: string;
  service_type: string;
  checked_in_at: string;
}

interface MemberWithAttendance extends Member {
  isPresent: boolean;
  attendance_id?: string;
}

export const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState("sunday_service");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<MemberWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembersWithAttendance();
  }, [selectedDate, serviceType]);

  const fetchMembersWithAttendance = async () => {
    try {
      setLoading(true);

      // Fetch all active members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*, member_number')
        .eq('status', 'active')
        .order('first_name');

      if (membersError) throw membersError;

      // Fetch attendance records for selected date and service type
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('service_date', selectedDate)
        .eq('service_type', serviceType);

      if (attendanceError) throw attendanceError;

      // Combine members with their attendance status
      const membersWithAttendance: MemberWithAttendance[] = (membersData || []).map(member => {
        const attendanceRecord = attendanceData?.find(record => record.member_id === member.id);
        return {
          ...member,
          isPresent: !!attendanceRecord,
          attendance_id: attendanceRecord?.id
        };
      });

      setMembers(membersWithAttendance);
    } catch (error) {
      console.error('Error fetching members and attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = members.filter(m => m.isPresent).length;
  const totalCount = members.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const toggleAttendance = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      if (member.isPresent && member.attendance_id) {
        // Remove attendance record
        const { error } = await supabase
          .from('attendance_records')
          .delete()
          .eq('id', member.attendance_id);

        if (error) throw error;
      } else {
        // Add attendance record
        const { error } = await supabase
          .from('attendance_records')
          .insert({
            member_id: memberId,
            service_date: selectedDate,
            service_type: serviceType,
            checked_in_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Refresh the data
      fetchMembersWithAttendance();
      
      toast({
        title: "Success",
        description: member.isPresent ? "Member marked absent" : "Member marked present",
      });
    } catch (error) {
      console.error('Error toggling attendance:', error);
      toast({
        title: "Error", 
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const markAllPresent = async () => {
    try {
      const absentMembers = members.filter(m => !m.isPresent);
      
      if (absentMembers.length === 0) {
        toast({
          title: "Info",
          description: "All members are already marked present",
        });
        return;
      }

      const attendanceRecords = absentMembers.map(member => ({
        member_id: member.id,
        service_date: selectedDate,
        service_type: serviceType,
        checked_in_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('attendance_records')
        .insert(attendanceRecords);

      if (error) throw error;

      fetchMembersWithAttendance();
      
      toast({
        title: "Success",
        description: `Marked ${absentMembers.length} members as present`,
      });
    } catch (error) {
      console.error('Error marking all present:', error);
      toast({
        title: "Error",
        description: "Failed to mark all members present",
        variant: "destructive",
      });
    }
  };

  const exportAttendance = () => {
    const data = {
      date: selectedDate,
      serviceType,
      totalMembers: totalCount,
      presentMembers: presentCount,
      attendanceRate: `${attendanceRate}%`,
      members: members.map(m => ({
        name: `${m.first_name} ${m.last_name}`,
        phone: m.phone || '',
        email: m.email || '',
        status: m.isPresent ? 'present' : 'absent'
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}-${serviceType}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance Tracker</h2>
          <p className="text-muted-foreground">Record and manage member attendance</p>
        </div>
        <Button onClick={exportAttendance} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{totalCount - presentCount}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>Configure the service for attendance tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Service Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday_service">Sunday Service</SelectItem>
                  <SelectItem value="wednesday_service">Wednesday Service</SelectItem>
                  <SelectItem value="friday_service">Friday Service</SelectItem>
                  <SelectItem value="special_event">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={markAllPresent} variant="outline" className="w-full">
                Mark All Present
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Attendance</CardTitle>
          <CardDescription>Check off members as they arrive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, member ID, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No members found matching your search" : "No members available"}
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={member.isPresent}
                        onCheckedChange={() => toggleAttendance(member.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.first_name} {member.last_name}</p>
                          {member.member_number && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {member.member_number}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.phone || member.email || 'No contact info'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={member.isPresent ? "default" : "secondary"}
                      className={member.isPresent ? "bg-green-100 text-green-800" : ""}
                    >
                      {member.isPresent ? "Present" : "Absent"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};