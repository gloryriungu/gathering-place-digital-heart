import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Calendar
} from "lucide-react";

export const TeacherInterface = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [offeringAmount, setOfferingAmount] = useState("");

  // Mock data for teacher's assigned class
  const teacherInfo = {
    name: "Mary Johnson",
    assignedClass: "Diamond",
    ageRange: "6-10 years",
    date: new Date().toLocaleDateString()
  };

  const classChildren = [
    { 
      id: 1, 
      name: "Emma Johnson", 
      age: 6, 
      present: true, 
      emergencyContact: "Jane Smith - 555-0123",
      allergies: "Peanuts",
      medicalNotes: "Carries EpiPen",
      parentPhone: "555-0123"
    },
    { 
      id: 2, 
      name: "Lucas Davis", 
      age: 7, 
      present: false, 
      emergencyContact: "Mike Davis - 555-0456",
      allergies: "None",
      medicalNotes: "None",
      parentPhone: "555-0456"
    },
    { 
      id: 3, 
      name: "Sofia Martinez", 
      age: 8, 
      present: true, 
      emergencyContact: "Ana Martinez - 555-0789",
      allergies: "Dairy",
      medicalNotes: "Lactose intolerant",
      parentPhone: "555-0789"
    }
  ];

  const presentCount = classChildren.filter(child => child.present).length;

  return (
    <div className="space-y-6">
      {/* Teacher Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Teacher Dashboard - {teacherInfo.assignedClass} Class
            </div>
            <Badge variant="secondary">{teacherInfo.date}</Badge>
          </CardTitle>
          <CardDescription>
            Welcome, {teacherInfo.name}! You're teaching {teacherInfo.assignedClass} class ({teacherInfo.ageRange}) today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{classChildren.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-muted-foreground">Present Today</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round((presentCount / classChildren.length) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Class Attendance
            </CardTitle>
            <CardDescription>Mark students present or absent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classChildren.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {child.present ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">Age {child.age}</p>
                      </div>
                    </div>
                    {child.allergies !== "None" && (
                      <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {child.allergies}
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedChild(child)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks for today's class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Offering Collection */}
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Sunday School Offering</h4>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="offering">Amount collected: $</Label>
                <Input 
                  id="offering"
                  type="number" 
                  placeholder="0.00" 
                  value={offeringAmount}
                  onChange={(e) => setOfferingAmount(e.target.value)}
                  className="w-24"
                  step="0.01"
                />
                <Button size="sm">Record</Button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="p-4 border rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium">Emergency Protocols</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Main Office:</strong> 555-0100</p>
                <p><strong>Nurse Station:</strong> 555-0101</p>
                <p><strong>Security:</strong> 555-0911</p>
              </div>
            </div>

            {/* Class Notes */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Class Notes</h4>
              </div>
              <Textarea 
                placeholder="Add notes about today's class, behavior observations, or important events..."
                className="min-h-20"
              />
              <Button size="sm" className="mt-2">Save Notes</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact Modal */}
      {selectedChild && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                Emergency Information - {selectedChild.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedChild(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Parent/Guardian Phone:</Label>
                <p className="text-lg font-bold">{selectedChild.parentPhone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Emergency Contact:</Label>
                <p className="text-lg font-bold">{selectedChild.emergencyContact}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Medical Information:</Label>
                <p className="font-medium">
                  <span className="text-red-600">Allergies:</span> {selectedChild.allergies}
                </p>
                <p className="font-medium">
                  <span className="text-red-600">Medical Notes:</span> {selectedChild.medicalNotes}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="bg-red-600 hover:bg-red-700">
                  Call Parent/Guardian
                </Button>
                <Button variant="outline">
                  Call Emergency Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};