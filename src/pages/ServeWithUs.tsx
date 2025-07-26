import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ClipboardList, 
  Users, 
  Sparkles, 
  Coffee, 
  Music, 
  Volume2, 
  Camera, 
  Crown, 
  FileText, 
  GraduationCap, 
  Heart 
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const ServeWithUs = () => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const departments = [
    {
      id: "security",
      name: "Security",
      icon: Shield,
      description: "Ensure the safety and security of our church family during services and events.",
      requirements: ["Background check required", "Training provided", "Physical fitness"],
      timeCommitment: "Sunday services + special events"
    },
    {
      id: "registration",
      name: "Registration",
      icon: ClipboardList,
      description: "Welcome guests and manage attendance tracking for all church services.",
      requirements: ["Friendly demeanor", "Basic computer skills", "Punctuality"],
      timeCommitment: "1-2 Sundays per month"
    },
    {
      id: "ushers",
      name: "Ushers",
      icon: Users,
      description: "Guide and assist congregation members during services, handle collections.",
      requirements: ["Welcoming personality", "Knowledge of church layout", "Team player"],
      timeCommitment: "2-3 Sundays per month"
    },
    {
      id: "sanctuary-keepers",
      name: "Sanctuary Keepers",
      icon: Sparkles,
      description: "Maintain the cleanliness and organization of our worship spaces.",
      requirements: ["Attention to detail", "Physical ability", "Flexible schedule"],
      timeCommitment: "Weekly cleaning sessions"
    },
    {
      id: "hospitality",
      name: "Hospitality",
      icon: Coffee,
      description: "Provide refreshments and create a welcoming atmosphere for all visitors.",
      requirements: ["Hospitality heart", "Food handling knowledge", "Organization skills"],
      timeCommitment: "Sunday services"
    },
    {
      id: "host-of-glory",
      name: "Host Of Glory (Worship Team)",
      icon: Music,
      description: "Lead the congregation in worship through music and song.",
      requirements: ["Musical talent", "Heart for worship", "Regular practice attendance"],
      timeCommitment: "Weekly rehearsals + Sunday services"
    },
    {
      id: "sound-team",
      name: "Sound Team",
      icon: Volume2,
      description: "Operate audio equipment to ensure clear sound during all services.",
      requirements: ["Technical aptitude", "Training provided", "Attention to detail"],
      timeCommitment: "Sunday services + rehearsals"
    },
    {
      id: "media-team",
      name: "Media Team",
      icon: Camera,
      description: "Handle video production, live streaming, and visual presentations.",
      requirements: ["Technical skills", "Creative mindset", "Equipment knowledge"],
      timeCommitment: "Sunday services + special events"
    },
    {
      id: "protocol",
      name: "Protocol",
      icon: Crown,
      description: "Assist pastoral staff and coordinate platform activities during services.",
      requirements: ["Mature faith", "Organizational skills", "Discretion"],
      timeCommitment: "Sunday services + meetings"
    },
    {
      id: "administration",
      name: "Administration",
      icon: FileText,
      description: "Support church operations with office work, data entry, and communication.",
      requirements: ["Computer skills", "Organizational abilities", "Communication skills"],
      timeCommitment: "Flexible weekday hours"
    },
    {
      id: "sunday-school",
      name: "Sunday School",
      icon: GraduationCap,
      description: "Teach and mentor children, youth, or adults in Bible study classes.",
      requirements: ["Teaching ability", "Bible knowledge", "Background check"],
      timeCommitment: "Sunday mornings + preparation"
    },
    {
      id: "intercession",
      name: "Intercession",
      icon: Heart,
      description: "Pray for the church, community, and special prayer requests.",
      requirements: ["Heart for prayer", "Spiritual maturity", "Confidentiality"],
      timeCommitment: "Prayer meetings + personal prayer time"
    }
  ];

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSubmit = () => {
    console.log("Selected departments:", selectedDepartments);
    // This will be connected to Supabase later
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            SERVE WITH US
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find your place in ministry! Every member is a minister, and we have 
            opportunities for everyone to serve according to their gifts and calling.
          </p>
        </div>

        {/* Selection Instructions */}
        <Card className="max-w-4xl mx-auto mb-8 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Choose Your Ministry Areas</CardTitle>
            <CardDescription>
              Select the departments where you'd like to serve. You can choose multiple areas 
              that interest you, and we'll help you find the best fit.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            const isSelected = selectedDepartments.includes(dept.id);
            
            return (
              <Card 
                key={dept.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'bg-white/95 backdrop-blur-sm hover:bg-white'
                }`}
                onClick={() => handleDepartmentToggle(dept.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                    </div>
                    {isSelected && <Badge>Selected</Badge>}
                  </div>
                  <CardDescription className="text-sm">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {dept.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Time Commitment:</h4>
                      <p className="text-xs text-gray-600">{dept.timeCommitment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Section */}
        {selectedDepartments.length > 0 && (
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Serve?
                </h3>
                <p className="text-gray-600 mb-6">
                  You've selected {selectedDepartments.length} department{selectedDepartments.length > 1 ? 's' : ''}. 
                  We'll contact you with more information about getting started.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {selectedDepartments.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return (
                      <Badge key={deptId} variant="secondary" className="text-sm">
                        {dept?.name}
                      </Badge>
                    );
                  })}
                </div>
                <Button onClick={handleSubmit} size="lg" className="bg-primary hover:bg-primary/90">
                  SUBMIT APPLICATION
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServeWithUs;