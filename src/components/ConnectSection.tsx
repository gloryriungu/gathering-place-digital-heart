
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, HandHeart, MessageCircle, ArrowRight } from "lucide-react";

export const ConnectSection = () => {
  const connectOptions = [
    {
      icon: Users,
      title: "SMALL GROUPS",
      description: "Join a small group to build meaningful relationships and grow in faith together.",
      action: "FIND A GROUP"
    },
    {
      icon: HandHeart,
      title: "VOLUNTEER",
      description: "Use your gifts to serve others and make a difference in our community.",
      action: "GET INVOLVED"
    },
    {
      icon: Heart,
      title: "PRAYER",
      description: "Share your prayer needs with our caring prayer team who will lift you up.",
      action: "SUBMIT REQUEST"
    },
    {
      icon: MessageCircle,
      title: "CONNECT",
      description: "Join age-specific groups for fellowship, support, and spiritual growth.",
      action: "LEARN MORE"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tight">
            CONNECT & SERVE
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover ways to get connected, grow in community, and use your gifts to serve others.
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
