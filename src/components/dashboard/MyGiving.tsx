import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Calendar, Heart } from "lucide-react";

const mockGivingData = [
  { id: 1, date: "2024-01-07", type: "tithe", amount: 500, description: "Sunday Morning Service" },
  { id: 2, date: "2024-01-14", type: "offering", amount: 150, description: "Building Fund" },
  { id: 3, date: "2024-01-21", type: "gift", amount: 200, description: "Missions Offering" },
  { id: 4, date: "2024-01-28", type: "tithe", amount: 500, description: "Sunday Morning Service" },
];

export const MyGiving = () => {
  const totalGiving = mockGivingData.reduce((sum, item) => sum + item.amount, 0);
  const monthlyGoal = 2000;
  const progress = (totalGiving / monthlyGoal) * 100;

  const getGivingTypeInfo = (type: string) => {
    const types = {
      tithe: { label: "Tithe", color: "bg-primary text-primary-foreground" },
      offering: { label: "Offering", color: "bg-secondary text-secondary-foreground" },
      gift: { label: "Special Gift", color: "bg-accent text-accent-foreground" },
    };
    return types[type as keyof typeof types] || { label: type, color: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGiving.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all offerings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyGoal.toLocaleString()}</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giving Streak</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 weeks</div>
            <p className="text-xs text-muted-foreground">Consistent giving</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giving History</CardTitle>
          <CardDescription>Your recent contributions and offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockGivingData.map((giving) => {
              const typeInfo = getGivingTypeInfo(giving.type);
              return (
                <div key={giving.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    <div>
                      <p className="font-medium">{giving.description}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(giving.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${giving.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};