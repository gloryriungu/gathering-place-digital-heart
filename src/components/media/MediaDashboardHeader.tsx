import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Users, TrendingUp } from "lucide-react";

export const MediaDashboardHeader = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            MEDIA DEPARTMENT
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            Manage all church content, live streams, events, and digital media
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Video className="w-4 h-4 mr-2" />
              Live Broadcasting
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Calendar className="w-4 h-4 mr-2" />
              Event Management
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Users className="w-4 h-4 mr-2" />
              Content Creation
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              Digital Outreach
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};