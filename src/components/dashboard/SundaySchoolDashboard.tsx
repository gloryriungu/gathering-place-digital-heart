import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Baby, 
  Users, 
  UserCheck, 
  DollarSign, 
  Calendar,
  Search,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen
} from "lucide-react";

export const SundaySchoolDashboard = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const ageGroups = [
    { id: "toppers", name: "Toppers", ageRange: "4-5 years", color: "bg-pink-50 border-pink-200", count: 12 },
    { id: "diamond", name: "Diamond", ageRange: "6-10 years", color: "bg-blue-50 border-blue-200", count: 28 },
    { id: "onyx", name: "Onyx", ageRange: "11-12 years", color: "bg-purple-50 border-purple-200", count: 15 },
    { id: "house-of-jesse", name: "House of Jesse", ageRange: "13-17 years", color: "bg-green-50 border-green-200", count: 22 }
  ];

  const mockChildren = [
    { 
      id: 1, 
      name: "Emma Johnson", 
      age: 6, 
      class: "diamond", 
      present: true, 
      emergencyContact: "Jane Smith - 555-0123",
      allergies: "Peanuts",
      lastAttendance: "2024-08-03"
    },
    { 
      id: 2, 
      name: "Michael Brown", 
      age: 4, 
      class: "toppers", 
      present: false, 
      emergencyContact: "Bob Brown - 555-0456",
      allergies: "None",
      lastAttendance: "2024-07-27"
    },
    { 
      id: 3, 
      name: "Sarah Wilson", 
      age: 13, 
      class: "house-of-jesse", 
      present: true, 
      emergencyContact: "Lisa Wilson - 555-0789",
      allergies: "Dairy",
      lastAttendance: "2024-08-03"
    }
  ];

  const todaysTeachers = [
    { name: "Mary Johnson", role: "Head Teacher", class: "Diamond", status: "Present" },
    { name: "David Smith", role: "Assistant Teacher", class: "Toppers", status: "Present" },
    { name: "Lisa Brown", role: "Duty Teacher", class: "House of Jesse", status: "Late" },
    { name: "James Wilson", role: "Assistant Teacher", class: "Onyx", status: "Present" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">77</div>
            <p className="text-xs text-muted-foreground">Registered children</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">75% attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sunday School Offering</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.50</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers on Duty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">All classes covered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="offering">Offering</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Tracker</CardTitle>
                  <CardDescription>Mark children present or absent for today's service</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="attendance-date">Date:</Label>
                  <Input 
                    id="attendance-date"
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input placeholder="Search children..." className="w-64" />
                </div>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Classes</option>
                  {ageGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {mockChildren.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {child.present ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Age {child.age} - {ageGroups.find(g => g.id === child.class)?.name}
                          </p>
                        </div>
                      </div>
                      {child.allergies !== "None" && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Allergies: {child.allergies}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={child.present ? "default" : "outline"}
                        onClick={() => {/* Toggle attendance */}}
                      >
                        {child.present ? "Present" : "Mark Present"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ageGroups.map((group) => (
              <Card key={group.id} className={`${group.color} border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {group.name}
                    <Badge variant="secondary">{group.count} children</Badge>
                  </CardTitle>
                  <CardDescription>{group.ageRange}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Present Today:</span>
                      <span className="font-medium">{Math.floor(group.count * 0.75)}/{group.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Teacher Assigned:</span>
                      <span className="font-medium text-green-600">Yes</span>
                    </div>
                    <Button className="w-full" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Class Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Teacher Schedule</CardTitle>
              <CardDescription>Teachers assigned for {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysTeachers.map((teacher, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.role} - {teacher.class}</p>
                    </div>
                    <Badge 
                      variant={teacher.status === "Present" ? "default" : teacher.status === "Late" ? "secondary" : "destructive"}
                    >
                      {teacher.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offering" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sunday School Offering Collection</CardTitle>
              <CardDescription>Record offerings collected from each class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ageGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">{group.ageRange}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-20 text-right"
                        step="0.01"
                      />
                      <span className="text-sm font-medium">$</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t font-semibold">
                  <span>Total Offering:</span>
                  <span>$45.50</span>
                </div>
                <Button className="w-full">Submit to Accounts Department</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>Generate attendance reports for different periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Weekly Attendance Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Monthly Attendance Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Individual Child Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Reports</CardTitle>
                <CardDescription>Additional reports and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Emergency Contact List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Medical Information Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Offering Summary Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};