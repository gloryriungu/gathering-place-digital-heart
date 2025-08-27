import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Heart, Baby, Sparkles, Edit3, Eye, EyeOff 
} from "lucide-react";

export const ContentManagementGrid = () => {
  const contentPages = [
    {
      title: "BAPTISM PAGE",
      description: "Manage baptism preparation content, reading materials, and quiz questions",
      icon: FileText,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      status: "Published",
      lastUpdated: "2 days ago"
    },
    {
      title: "COUNSELING & MENTAL HEALTH",
      description: "Edit counseling services, contact information, and appointment details",
      icon: Heart,
      color: "bg-green-50 border-green-200", 
      iconColor: "text-green-600",
      status: "Published",
      lastUpdated: "1 week ago"
    },
    {
      title: "BABY DEDICATIONS",
      description: "Update dedication ceremony information, requirements, and scheduling",
      icon: Baby,
      color: "bg-pink-50 border-pink-200",
      iconColor: "text-pink-600",
      status: "Draft",
      lastUpdated: "3 days ago"
    },
    {
      title: "PROPHETIC SCHOOL",
      description: "Manage course content, enrollment details, and class schedules",
      icon: Sparkles,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600", 
      status: "Published",
      lastUpdated: "5 days ago"
    }
  ];

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-xl font-black">CONTENT MANAGEMENT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {contentPages.map((page, index) => {
            const IconComponent = page.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${page.color} hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-white ${page.iconColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      page.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                    {page.status === 'Published' ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-black mb-2">{page.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{page.description}</p>
                <p className="text-xs text-gray-500 mb-4">Last updated: {page.lastUpdated}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 font-bold">
                    <Edit3 className="h-4 w-4 mr-2" />
                    EDIT CONTENT
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};