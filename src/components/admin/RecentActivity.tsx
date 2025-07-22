
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, DollarSign, MessageSquare } from "lucide-react";

export const RecentActivity = () => {
  const activities = [
    {
      type: "member",
      action: "New member registered",
      details: "Sarah Johnson joined",
      time: "2 hours ago",
      icon: User,
      color: "text-blue-600"
    },
    {
      type: "donation",
      action: "Large donation received",
      details: "$2,500 from Anonymous",
      time: "4 hours ago",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      type: "message",
      action: "Announcement sent",
      details: "Easter service details",
      time: "6 hours ago",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      type: "member",
      action: "Volunteer signed up",
      details: "Mark Davis - Youth Ministry",
      time: "1 day ago",
      icon: User,
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-lg font-black">RECENT ACTIVITY</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-black">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
