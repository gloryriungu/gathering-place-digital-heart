import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Music, BookOpen, Heart, Baby, 
  Gamepad2, Utensils, Settings, Eye, EyeOff 
} from "lucide-react";
import { useState } from "react";

export const DepartmentVisibilityPanel = () => {
  const [departments, setDepartments] = useState([
    {
      id: "worship",
      name: "Worship & Music",
      description: "Lead worship services and special music events",
      icon: Music,
      isVisible: true,
      memberCount: 24
    },
    {
      id: "children",
      name: "Children's Ministry",
      description: "Teach and care for children during services",
      icon: Baby,
      isVisible: true,
      memberCount: 18
    },
    {
      id: "youth",
      name: "Youth Ministry",
      description: "Mentor and guide teenagers in their faith journey",
      icon: Users,
      isVisible: false,
      memberCount: 12
    },
    {
      id: "hospitality", 
      name: "Hospitality & Welcome",
      description: "Greet visitors and serve refreshments",
      icon: Utensils,
      isVisible: true,
      memberCount: 15
    },
    {
      id: "counseling",
      name: "Counseling & Care",
      description: "Provide pastoral care and counseling support",
      icon: Heart,
      isVisible: true,
      memberCount: 8
    },
    {
      id: "education",
      name: "Education & Teaching",
      description: "Lead Bible studies and educational programs",
      icon: BookOpen,
      isVisible: true,
      memberCount: 22
    },
    {
      id: "technology",
      name: "Audio/Visual Tech",
      description: "Manage sound, lighting, and streaming technology",
      icon: Settings,
      isVisible: false,
      memberCount: 6
    },
    {
      id: "outreach",
      name: "Community Outreach", 
      description: "Organize community service and evangelism",
      icon: Users,
      isVisible: true,
      memberCount: 19
    }
  ]);

  const toggleVisibility = (departmentId: string) => {
    setDepartments(prev => 
      prev.map(dept => 
        dept.id === departmentId 
          ? { ...dept, isVisible: !dept.isVisible }
          : dept
      )
    );
  };

  const visibleCount = departments.filter(d => d.isVisible).length;
  const totalCount = departments.length;

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black">DEPARTMENT VISIBILITY</CardTitle>
          <Badge variant="outline" className="font-bold">
            {visibleCount}/{totalCount} VISIBLE
          </Badge>
        </div>
        <p className="text-gray-600 text-sm">
          Control which departments appear on the "Serve With Us" page
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.map((department) => {
            const IconComponent = department.icon;
            return (
              <div
                key={department.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  department.isVisible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full bg-white ${
                      department.isVisible ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-black">{department.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {department.memberCount} members
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{department.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {department.isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Switch
                        checked={department.isVisible}
                        onCheckedChange={() => toggleVisibility(department.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button className="w-full font-bold">
            SAVE CHANGES
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};