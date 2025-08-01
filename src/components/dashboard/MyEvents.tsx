import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, CheckCircle } from "lucide-react";

const mockEvents = [
  {
    id: 1,
    title: "Sunday Morning Service",
    date: "2024-01-07",
    time: "09:00 AM",
    location: "Main Sanctuary",
    type: "service",
    status: "registered",
    attendees: 856
  },
  {
    id: 2,
    title: "Bible Study Group",
    date: "2024-01-10",
    time: "07:00 PM",
    location: "Fellowship Hall",
    type: "study",
    status: "registered",
    attendees: 45
  },
  {
    id: 3,
    title: "Youth Conference 2024",
    date: "2024-01-15",
    time: "10:00 AM",
    location: "Conference Center",
    type: "conference",
    status: "available",
    attendees: 200
  },
  {
    id: 4,
    title: "Community Outreach",
    date: "2024-01-20",
    time: "02:00 PM",
    location: "Downtown Community Center",
    type: "outreach",
    status: "available",
    attendees: 30
  },
];

export const MyEvents = () => {
  const getEventTypeInfo = (type: string) => {
    const types = {
      service: { label: "Service", color: "bg-primary text-primary-foreground" },
      study: { label: "Bible Study", color: "bg-secondary text-secondary-foreground" },
      conference: { label: "Conference", color: "bg-accent text-accent-foreground" },
      outreach: { label: "Outreach", color: "bg-muted text-muted-foreground" },
    };
    return types[type as keyof typeof types] || { label: type, color: "bg-muted text-muted-foreground" };
  };

  const registeredEvents = mockEvents.filter(event => event.status === "registered");
  const availableEvents = mockEvents.filter(event => event.status === "available");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredEvents.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{registeredEvents[0]?.title || "No events"}</div>
            <p className="text-xs text-muted-foreground">
              {registeredEvents[0] ? new Date(registeredEvents[0].date).toLocaleDateString() : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableEvents.length}</div>
            <p className="text-xs text-muted-foreground">To register for</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Registered Events</CardTitle>
            <CardDescription>Events you're signed up for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registeredEvents.map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                return (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Registered
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {event.attendees} expected attendees
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Events</CardTitle>
            <CardDescription>Events you can register for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableEvents.map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                return (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      <Button size="sm" variant="outline">
                        Register
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {event.attendees} expected attendees
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};