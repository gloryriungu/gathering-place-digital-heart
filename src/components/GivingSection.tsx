
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign, Target, Users, ArrowRight } from "lucide-react";

export const GivingSection = () => {
  const givingImpact = [
    {
      icon: Users,
      title: "COMMUNITY",
      description: "Supporting local families and community programs",
      percentage: "40%"
    },
    {
      icon: Target,
      title: "MISSIONS",
      description: "Funding global missions and church planting",
      percentage: "25%"
    },
    {
      icon: Heart,
      title: "YOUTH & KIDS",
      description: "Investing in the next generation",
      percentage: "20%"
    },
    {
      icon: DollarSign,
      title: "OPERATIONS",
      description: "Maintaining facilities and staff",
      percentage: "15%"
    }
  ];

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            YOUR GENEROSITY<br />MAKES A DIFFERENCE
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how your faithful giving supports our mission to love God, love people, and serve our community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {givingImpact.map((impact, index) => {
            const IconComponent = impact.icon;
            return (
              <Card key={index} className="text-center bg-white border-2 border-black">
                <CardHeader className="pb-4">
                  <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-black mb-2">{impact.percentage}</div>
                  <CardTitle className="text-xl font-black text-black">{impact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">{impact.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-white text-black rounded-lg p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-black mb-6">READY TO GIVE?</h3>
          <p className="text-lg mb-8 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your generous giving helps us continue our mission and expand our impact in the community. 
            Every gift, no matter the size, makes a meaningful difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 font-bold px-8">
              <Heart className="h-5 w-5 mr-2" />
              GIVE ONLINE
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-bold px-8">
              LEARN ABOUT GIVING
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
