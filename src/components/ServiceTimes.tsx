
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

export const ServiceTimes = () => {
  const locations = [
    {
      name: "Downtown Campus",
      address: "123 Main Street, Downtown",
      services: [
        { time: "9:00 AM", type: "Traditional Service" },
        { time: "11:00 AM", type: "Contemporary Service" },
        { time: "6:00 PM", type: "Evening Service" }
      ]
    },
    {
      name: "Westside Campus",
      address: "456 Oak Avenue, Westside",
      services: [
        { time: "9:30 AM", type: "Family Service" },
        { time: "11:30 AM", type: "Contemporary Service" }
      ]
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Service Times & Locations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for worship at one of our convenient locations and service times
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((location, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {location.name}
                </CardTitle>
                <p className="text-muted-foreground">{location.address}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {location.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{service.time}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{service.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
