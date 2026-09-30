
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowRight, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface EventContent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  content_data: {
    date?: string;
    time?: string;
    location?: string;
    category?: string;
    enable_rsvp?: boolean;
  };
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

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

  const scrollBy = (dir: number) => {
    const el = document.getElementById("events-track");
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-80 mb-10" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      <span aria-hidden className="pointer-events-none select-none absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold text-[8rem] md:text-[14rem] leading-none text-primary/[0.04] whitespace-nowrap">
        EVENTS
      </span>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-3">Upcoming Events</p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary">
              What's <span className="text-accent italic">Coming Up</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-xl">
              Special gatherings to build your faith, strengthen relationships and advance God's kingdom.
            </p>
          </div>
          <div className="flex gap-3">
            <button aria-label="Previous events" onClick={() => scrollBy(-1)} className="h-12 w-12 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button aria-label="Next events" onClick={() => scrollBy(1)} className="h-12 w-12 rounded-full bg-gradient-amber text-accent-foreground flex items-center justify-center hover:scale-105 transition-transform">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div id="events-track" className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {displayEvents.map((event, index) => {
            const isExpanded = expandedEvents.has(event.id || index.toString());
            const shouldTruncate = event.description && event.description.length > 120;
            const displayDescription = !shouldTruncate || isExpanded
              ? event.description
              : event.description.slice(0, 120) + '...';

            return (
              <article key={event.id || index} className="card-lift snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[calc(33.333%-1rem)] rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-gradient-plum overflow-hidden">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} loading="lazy" className="w-full h-full object-contain bg-muted" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-accent/60" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 rounded-full bg-gradient-amber px-3 py-1 text-[11px] font-bold tracking-wider text-accent-foreground uppercase">
                    {event.content_data?.category || 'Event'}
                  </span>
                  <span className="absolute bottom-4 right-4 rounded-xl bg-background/95 px-3 py-2 font-display font-bold text-primary text-lg shadow">
                    {event.content_data?.date || 'TBD'}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-primary leading-snug">{event.title}</h3>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">{displayDescription}</p>
                    {shouldTruncate && (
                      <button onClick={() => toggleExpanded(event.id || index.toString())} className="text-accent font-bold text-sm mt-2 hover:underline">
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-foreground">
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-accent" />{event.content_data?.time || 'TBD'}</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-accent" />{event.content_data?.location || 'TBD'}</div>
                  </div>
                  <div className="mt-auto pt-2">
                    {event.content_data?.enable_rsvp ? (
                      <Button asChild className="w-full">
                        <Link to={`/events/${event.id}/register`}><Users className="h-4 w-4 mr-2" />Register Now</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/events">Learn More<ArrowRight className="h-4 w-4 ml-2" /></Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="px-8">
            <Link to="/events"><Calendar className="h-5 w-5 mr-2" />View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
