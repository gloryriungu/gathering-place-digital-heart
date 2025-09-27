
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, MessageSquare } from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Total Members",
      value: "1,247",
      change: "+12 this week",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Monthly Giving",
      value: "KSh 6,218,160",
      change: "+8.2% from last month",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Weekly Attendance",
      value: "892",
      change: "Average this month",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Active Volunteers",
      value: "156",
      change: "+5 new this month",
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-6 w-6 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-black">{stat.value}</div>
              <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
