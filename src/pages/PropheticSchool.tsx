import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Users, BookOpen, Star, Play, Lock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  startDate: string;
  endDate: string;
  price: number;
  enrolled: number;
  maxStudents: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "upcoming" | "ongoing" | "completed";
  isEnrolled: boolean;
  lessons: number;
  rating: number;
  preview?: string;
}

const mockCourses: Course[] = [
  {
    id: "intro-prophetic",
    title: "Introduction to Prophetic Ministry",
    description: "Learn the foundational principles of prophetic ministry, including hearing God's voice, understanding biblical prophecy, and operating in the prophetic gifts.",
    instructor: "Prophet Sarah Johnson",
    duration: "6 weeks",
    startDate: "2024-02-15",
    endDate: "2024-03-28",
    price: 99,
    enrolled: 45,
    maxStudents: 60,
    level: "Beginner",
    status: "upcoming",
    isEnrolled: false,
    lessons: 12,
    rating: 4.8,
    preview: "Discover your prophetic calling and learn to discern God's voice..."
  },
  {
    id: "advanced-prophetic",
    title: "Advanced Prophetic Operations",
    description: "Deep dive into advanced prophetic ministry including corporate prophecy, prophetic intercession, and ministry activation.",
    instructor: "Prophet Michael Davis",
    duration: "8 weeks",
    startDate: "2024-03-15",
    endDate: "2024-05-10",
    price: 149,
    enrolled: 23,
    maxStudents: 40,
    level: "Advanced",
    status: "upcoming",
    isEnrolled: false,
    lessons: 16,
    rating: 4.9,
    preview: "Take your prophetic ministry to the next level with advanced techniques..."
  },
  {
    id: "prophetic-worship",
    title: "Prophetic Worship and Intercession",
    description: "Explore the intersection of worship and prophecy, learning to flow in spontaneous worship and prophetic intercession.",
    instructor: "Pastor Rachel Thompson",
    duration: "4 weeks",
    startDate: "2024-01-20",
    endDate: "2024-02-16",
    price: 79,
    enrolled: 34,
    maxStudents: 50,
    level: "Intermediate",
    status: "ongoing",
    isEnrolled: true,
    lessons: 8,
    rating: 4.7,
    preview: "Combine worship and prophecy for powerful ministry..."
  }
];

const PropheticSchool = () => {
  const [isAuthenticated] = useState(false); // Mock - will be connected to real auth later
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses] = useState(mockCourses);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "upcoming": return "default";
      case "ongoing": return "destructive";
      case "completed": return "secondary";
      default: return "default";
    }
  };

  const getLevelColor = (level: Course["level"]) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AuthGuard isAuthenticated={isAuthenticated}>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Prophetic School</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Grow in prophetic ministry through our comprehensive courses designed to equip and activate believers in the prophetic gifts.
            </p>
          </div>

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">Available Courses</TabsTrigger>
              <TabsTrigger value="enrolled">My Courses</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* Available Courses */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={getStatusColor(course.status)}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{course.duration} • {course.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{course.rating} ({course.enrolled} students)</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="text-2xl font-bold">${course.price}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.enrolled}/{course.maxStudents} enrolled
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Preview Course
                        </Button>
                        <Button 
                          className="w-full" 
                          disabled={course.enrolled >= course.maxStudents}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {course.isEnrolled ? "Continue Learning" : "Enroll Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Courses */}
            <TabsContent value="enrolled" className="space-y-6">
              <div className="grid gap-6">
                {courses.filter(course => course.isEnrolled).map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{course.title}</CardTitle>
                          <CardDescription>Instructor: {course.instructor}</CardDescription>
                        </div>
                        <Badge variant={getStatusColor(course.status)}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>65% complete</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex gap-4">
                          <Button>Continue Learning</Button>
                          <Button variant="outline">Download Resources</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {courses.filter(course => course.isEnrolled).length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
                      <p className="text-muted-foreground">
                        You haven't enrolled in any courses yet. Browse available courses to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Admin Panel */}
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <CardTitle>Course Management</CardTitle>
                  </div>
                  <CardDescription>
                    Manage courses, enrollments, and student progress (Admin access required)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="h-20 flex-col">
                      <BookOpen className="h-6 w-6 mb-2" />
                      Create New Course
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Manage Enrollments
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      Schedule Classes
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <DollarSign className="h-6 w-6 mb-2" />
                      Pricing & Payments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Course Preview Modal */}
          {selectedCourse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedCourse.title}</CardTitle>
                      <CardDescription>Preview • {selectedCourse.instructor}</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCourse(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedCourse.preview}</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Course Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Duration: {selectedCourse.duration}</div>
                      <div>Lessons: {selectedCourse.lessons}</div>
                      <div>Level: {selectedCourse.level}</div>
                      <div>Rating: {selectedCourse.rating}/5</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      Enroll for ${selectedCourse.price}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default PropheticSchool;