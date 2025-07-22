
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, DollarSign, UserCheck, UsersRound, 
  Shield, MessageCircle, BarChart3, ArrowRight 
} from "lucide-react";

export const ModulesGrid = () => {
  const modules = [
    {
      title: "MEMBERSHIP DATABASE",
      description: "Comprehensive member records, family relationships, and attendance history",
      icon: Users,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      title: "FINANCIAL MANAGEMENT",
      description: "Tithe tracking, budget management, and detailed financial reports",
      icon: DollarSign,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      title: "VOLUNTEER MANAGEMENT",
      description: "Schedule volunteers, track service hours, and manage ministry teams",
      icon: UserCheck,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      title: "SMALL GROUP MANAGEMENT",
      description: "Group leader tools, member lists, and meeting notes tracking",
      icon: UsersRound,
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600"
    },
    {
      title: "CHILD CHECK-IN & SECURITY",
      description: "Secure check-in system with security tags and medical information",
      icon: Shield,
      color: "bg-red-50 border-red-200",
      iconColor: "text-red-600"
    },
    {
      title: "COMMUNICATIONS SUITE",
      description: "Targeted emails, SMS, and push notifications to groups or individuals",
      icon: MessageCircle,
      color: "bg-cyan-50 border-cyan-200",
      iconColor: "text-cyan-600"
    },
    {
      title: "AI-POWERED INSIGHTS",
      description: "Data analysis for trends, patterns, and leadership decision support",
      icon: BarChart3,
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-xl font-black">MINISTRY MODULES</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${module.color} hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-white ${module.iconColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-lg font-black text-black mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{module.description}</p>
                <Button size="sm" className="w-full font-bold">
                  OPEN MODULE
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
