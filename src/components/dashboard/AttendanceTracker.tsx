import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Users, Calendar, Check } from "lucide-react";

const mockMembers = [
  { id: 1, name: "John Smith", phone: "+1234567890", status: "present" },
  { id: 2, name: "Sarah Johnson", phone: "+1234567891", status: "absent" },
  { id: 3, name: "Michael Brown", phone: "+1234567892", status: "present" },
  { id: 4, name: "Emily Davis", phone: "+1234567893", status: "present" },
  { id: 5, name: "David Wilson", phone: "+1234567894", status: "absent" },
  { id: 6, name: "Lisa Anderson", phone: "+1234567895", status: "present" },
];

export const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState("sunday-service");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState(mockMembers);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = members.filter(m => m.status === "present").length;
  const totalCount = members.length;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const toggleAttendance = (memberId: number) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId
        ? { ...member, status: member.status === "present" ? "absent" : "present" }
        : member
    ));
  };

  const markAllPresent = () => {
    setMembers(prev => prev.map(member => ({ ...member, status: "present" })));
  };

  const exportAttendance = () => {
    const data = {
      date: selectedDate,
      serviceType,
      totalMembers: totalCount,
      presentMembers: presentCount,
      attendanceRate: `${attendanceRate}%`,
      members: members.map(m => ({
        name: m.name,
        phone: m.phone,
        status: m.status
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
                  <SelectItem value="sunday-service">Sunday Service</SelectItem>
                  <SelectItem value="wednesday-service">Wednesday Service</SelectItem>
                  <SelectItem value="friday-service">Friday Service</SelectItem>
                  <SelectItem value="special-event">Special Event</SelectItem>
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
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={member.status === "present"}
                    onCheckedChange={() => toggleAttendance(member.id)}
                  />
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <Badge
                  variant={member.status === "present" ? "default" : "secondary"}
                  className={member.status === "present" ? "bg-green-100 text-green-800" : ""}
                >
                  {member.status === "present" ? "Present" : "Absent"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};