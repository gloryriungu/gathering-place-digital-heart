
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface EventContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    date?: string;
    time?: string;
    location?: string;
    category?: string;
  };
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_content',
          filter: "content_type=eq.event"
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'event')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents((data || []) as EventContent[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback events if no data exists
  const defaultEvents = [
    {
      id: '1',
      title: "Champions Conference 2024",
      description: "Three days of powerful ministry, worship, and transformation. Join us for this life-changing experience with special guest ministers.",
      content_data: {
        date: "FEB 15-17",
        time: "7:00 PM Daily",
        location: "Main Auditorium",
        category: "CONFERENCE"
      }
    },
    {
      id: '2',
      title: "TOT Youth Explosion",
      description: "An energetic evening of worship, games, and powerful youth ministry designed to ignite passion for Jesus in our young people.",
      content_data: {
        date: "FEB 23",
        time: "6:00 PM",
        location: "Youth Center",
        category: "YOUTH EVENT"
      }
    },
    {
      id: '3',
      title: "Marriage Enrichment Retreat",
      description: "Strengthen your marriage through biblical principles, practical workshops, and intimate fellowship with other couples.",
      content_data: {
        date: "MAR 2-3",
        time: "All Weekend",
        location: "Retreat Center",
        category: "MARRIAGE"
      }
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-16 w-80 mx-auto mb-6" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader className="pb-4">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tight">
            UPCOMING EVENTS
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for these special events designed to build your faith, strengthen relationships, and advance God's kingdom.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {displayEvents.slice(0, 3).map((event, index) => (
            <Card key={event.id || index} className="border-2 border-black hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-black text-white px-3 py-1 rounded font-bold text-sm">
                    {event.content_data?.category || 'EVENT'}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-black">{event.content_data?.date || 'TBD'}</div>
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
                    <span className="font-medium">{event.content_data?.time || 'TBD'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-black" />
                    <span className="font-medium">{event.content_data?.location || 'TBD'}</span>
                  </div>
                </div>

                <Button className="w-full bg-black text-white hover:bg-gray-800 font-bold">
                  REGISTER NOW
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

export default UpcomingEvents;
