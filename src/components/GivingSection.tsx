
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign, Target, Users } from "lucide-react";

export const GivingSection = () => {
  const givingImpact = [
    {
      icon: Users,
      title: "Community Outreach",
      description: "Supporting local families in need and community programs",
      percentage: "40%"
    },
    {
      icon: Target,
      title: "Missions",
      description: "Funding global missions and church planting initiatives",
      percentage: "25%"
    },
    {
      icon: Heart,
      title: "Youth & Children",
      description: "Investing in the next generation through programs and camps",
      percentage: "20%"
    },
    {
      icon: DollarSign,
      title: "Operations",
      description: "Maintaining facilities and supporting church staff",
      percentage: "15%"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Generosity Makes a Difference</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how your faithful giving supports our mission to love God, love people, and serve our community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {givingImpact.map((impact, index) => {
            const IconComponent = impact.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{impact.percentage}</div>
                  <CardTitle className="text-lg">{impact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{impact.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">Ready to Give?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Your generous giving helps us continue our mission and expand our impact in the community. 
            Every gift, no matter the size, makes a meaningful difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              <Heart className="h-5 w-5 mr-2" />
              Give Online
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Learn About Giving
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
