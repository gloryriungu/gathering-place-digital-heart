
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Send, Download, Upload } from "lucide-react";

export const QuickActions = () => {
  const actions = [
    { label: "Add New Member", icon: Plus, variant: "default" as const },
    { label: "Send Announcement", icon: Send, variant: "outline" as const },
    { label: "Export Data", icon: Download, variant: "outline" as const },
    { label: "Import Records", icon: Upload, variant: "outline" as const }
  ];

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-xl font-black">QUICK ACTIONS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 flex-col space-y-2 font-bold"
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
