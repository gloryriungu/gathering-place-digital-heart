
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

export const UpcomingEvents = () => {
  const events = [
    {
      title: "Christmas Eve Service",
      date: "DEC 24",
      time: "6:00 PM",
      location: "Main Campus",
      category: "SPECIAL SERVICE",
      description: "Join us for a special Christmas Eve celebration with candlelight and carols."
    },
    {
      title: "Youth Winter Retreat",
      date: "JAN 12-14",
      time: "All Weekend",
      location: "Mountain View Camp",
      category: "YOUTH EVENT",
      description: "A weekend getaway for teens focused on faith, friendship, and fun activities."
    },
    {
      title: "Marriage Workshop",
      date: "JAN 18",
      time: "9:00 AM",
      location: "Westside Campus",
      category: "WORKSHOP",
      description: "Strengthen your marriage with practical tools and biblical principles."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tight">
            UPCOMING EVENTS
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't miss out on these exciting opportunities to connect, grow, and serve together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {events.map((event, index) => (
            <Card key={index} className="border-2 border-black hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-black text-white px-3 py-1 rounded font-bold text-sm">
                    {event.category}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-black">{event.date}</div>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-black leading-tight">
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-black" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-black" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                <Button className="w-full bg-black text-white hover:bg-gray-800 font-bold">
                  LEARN MORE
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 font-bold px-8">
            <Calendar className="h-5 w-5 mr-2" />
            VIEW ALL EVENTS
          </Button>
        </div>
      </div>
    </section>
  );
};
