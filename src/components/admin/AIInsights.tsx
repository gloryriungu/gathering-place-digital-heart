
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export const AIInsights = () => {
  const insights = [
    {
      type: "positive",
      title: "Attendance Growing",
      description: "15% increase in Sunday attendance over last month",
      icon: TrendingUp,
      color: "text-green-600 bg-green-50"
    },
    {
      type: "warning",
      title: "Giving Pattern Change",
      description: "Online donations down 8% - consider digital engagement",
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50"
    },
    {
      type: "negative",
      title: "Volunteer Shortage",
      description: "Youth ministry needs 3 more volunteers for full coverage",
      icon: TrendingDown,
      color: "text-red-600 bg-red-50"
    },
    {
      type: "positive",
      title: "Small Groups Active",
      description: "92% of small groups met this week - highest this year",
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50"
    }
  ];

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-lg font-black">AI INSIGHTS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border ${insight.color.split(' ')[1]}`}>
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${insight.color.split(' ')[0]}`} />
                  <div>
                    <h4 className="font-bold text-sm text-black">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
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
