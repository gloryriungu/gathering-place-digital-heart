
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, HandHeart, MessageCircle } from "lucide-react";

export const ConnectSection = () => {
  const connectOptions = [
    {
      icon: Users,
      title: "Small Groups",
      description: "Join a small group to build meaningful relationships and grow in faith together.",
      action: "Find a Group"
    },
    {
      icon: HandHeart,
      title: "Volunteer",
      description: "Use your gifts to serve others and make a difference in our community.",
      action: "Get Involved"
    },
    {
      icon: Heart,
      title: "Prayer Requests",
      description: "Share your prayer needs with our caring prayer team who will lift you up.",
      action: "Submit Request"
    },
    {
      icon: MessageCircle,
      title: "Connect Groups",
      description: "Join age-specific groups for fellowship, support, and spiritual growth.",
      action: "Learn More"
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect & Serve</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover ways to get connected, grow in community, and use your gifts to serve others
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {connectOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{option.description}</p>
                  <Button className="w-full" variant="outline">
                    {option.action}
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
