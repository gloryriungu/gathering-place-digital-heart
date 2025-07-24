
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, HandHeart, MessageCircle, ArrowRight } from "lucide-react";

export const ConnectSection = () => {
  const connectOptions = [
    {
      icon: Users,
      title: "LIFE GROUPS",
      description: "Connect with other believers in intimate small groups for fellowship, prayer, and spiritual growth.",
      action: "JOIN A GROUP"
    },
    {
      icon: HandHeart,
      title: "SERVE TEAMS",
      description: "Use your gifts and talents to serve God and others through various ministry opportunities.",
      action: "START SERVING"
    },
    {
      icon: Heart,
      title: "PRAYER MINISTRY",
      description: "Experience the power of prayer and intercession through our dedicated prayer teams and warriors.",
      action: "JOIN PRAYER"
    },
    {
      icon: MessageCircle,
      title: "DISCIPLESHIP",
      description: "Grow deeper in your faith through mentorship, Bible study, and spiritual formation programs.",
      action: "GET DISCIPLED"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tight">
            GET CONNECTED
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TOT International is more than a church - we're a family. Discover your place in our community and grow in your relationship with God and others.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {connectOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card key={index} className="text-center border-2 border-black hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black text-black">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">{option.description}</p>
                  <Button className="w-full bg-black text-white hover:bg-gray-800 font-bold">
                    {option.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
