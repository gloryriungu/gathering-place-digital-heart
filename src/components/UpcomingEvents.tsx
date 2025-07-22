
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export const UpcomingEvents = () => {
  const events = [
    {
      title: "Christmas Eve Service",
      date: "December 24, 2024",
      time: "6:00 PM",
      location: "Downtown Campus",
      category: "Service",
      description: "Join us for a special Christmas Eve celebration with candlelight and carols."
    },
    {
      title: "Youth Winter Retreat",
      date: "January 12-14, 2025",
      time: "All Weekend",
      location: "Mountain View Camp",
      category: "Youth",
      description: "A weekend getaway for teens focused on faith, friendship, and fun activities."
    },
    {
      title: "Marriage Enrichment Workshop",
      date: "January 18, 2025",
      time: "9:00 AM - 3:00 PM",
      location: "Westside Campus",
      category: "Workshop",
      description: "Strengthen your marriage with practical tools and biblical principles."
    },
    {
      title: "Community Service Day",
      date: "January 25, 2025",
      time: "8:00 AM - 4:00 PM",
      location: "Various Locations",
      category: "Outreach",
      description: "Join us as we serve our community through various volunteer opportunities."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Service": return "bg-primary text-primary-foreground";
      case "Youth": return "bg-green-500 text-white";
      case "Workshop": return "bg-blue-500 text-white";
      case "Outreach": return "bg-orange-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-lg text-muted-foreground">
            Don't miss out on these exciting opportunities to connect and grow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {events.map((event, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">{event.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg">
            <Calendar className="h-4 w-4 mr-2" />
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};
