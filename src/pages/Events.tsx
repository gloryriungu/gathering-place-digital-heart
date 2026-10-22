/**
 * EVENTS PAGE - CHURCH EVENTS LISTING & REGISTRATION
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Type-safe event data structures
 * - React: Dynamic event listing with real-time updates
 * - React Hooks: useState and useEffect for data management
 * 
 * FUNCTIONALITY:
 * Comprehensive events page displaying all upcoming church activities and gatherings:
 * 
 * EVENT DATA SOURCES:
 * 1. Dynamic Events (from Supabase):
 *    - Fetched from 'media_content' table where content_type = 'event'
 *    - Only shows published events (status = 'published')
 *    - Real-time updates via Supabase subscriptions
 *    - Sorted by creation date (newest first)
 * 
 * 2. Static/Default Events (fallback):
 *    - Sunday Service (recurring weekly)
 *    - Champions Conference 2024
 *    - TOT Youth Explosion
 *    - Prayer & Fasting Week
 *    - Marriage Enrichment Retreat
 *    - Community Outreach
 * 
 * EVENT INFORMATION DISPLAYED:
 * - Event title and category badge
 * - Detailed description
 * - Date and time
 * - Location/venue
 * - Event image (if available)
 * - RSVP status badge (if registration enabled)
 * - Register Now / Learn More buttons
 * 
 * FEATURES:
 * - Color-coded category badges (Weekly, Conference, Youth, Prayer, Marriage, Outreach)
 * - Click to register for events with RSVP enabled
 * - Links to detailed event registration pages
 * - Responsive grid layout for all screen sizes
 * - Loading skeletons while fetching data
 * 
 * MINISTRY AREAS SECTION:
 * - Worship Services
 * - Conferences
 * - Life Groups
 * - Community Outreach
 * - Provides overview of different event types
 * 
 * SEO OPTIMIZATION:
 * - Structured data (Schema.org) for event listings
 * - Canonical URLs and meta descriptions
 * - Keywords for search optimization
 * - Individual event schemas for better search visibility
 * 
 * REAL-TIME UPDATES:
 * - Subscribes to database changes
 * - Auto-refreshes when events are added/updated/deleted
 * - Ensures users always see current event information
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
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

    // Real-time updates
    const channel = supabase.channel('events-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'media_content'
    }, () => fetchEvents()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    if (loading || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [loading]);
  const fetchEvents = async () => {
    const {
      data
    } = await supabase.from('media_content').select('*').eq('content_type', 'event').eq('status', 'published').order('created_at', {
      ascending: false
    });
    if (data) setEvents(data);
    setLoading(false);
  };
  const staticEvents = [{
    title: "Sunday Service",
    date: "Every Sunday",
    time: "9:00 AM & 11:00 AM",
    location: "Main Auditorium",
    description: "Join us for powerful worship, life-changing messages, and fellowship with the TOT family.",
    category: "Weekly",
    recurring: true
  }, {
    title: "Champions Conference 2024",
    date: "February 15-17, 2024",
    time: "7:00 PM Daily",
    location: "Main Auditorium",
    description: "Three days of intensive ministry, worship, and impartation. Special guest ministers from around the world.",
    category: "Conference",
    recurring: false
  }, {
    title: "TOT Youth Explosion",
    date: "February 23, 2024",
    time: "6:00 PM - 9:00 PM",
    location: "Youth Center",
    description: "An explosive evening of worship, games, and powerful ministry designed for young champions.",
    category: "Youth",
    recurring: false
  }, {
    title: "Prayer & Fasting Week",
    date: "March 1-7, 2024",
    time: "6:00 AM & 6:00 PM",
    location: "Prayer Hall",
    description: "Seven days of corporate prayer and fasting for breakthrough, revival, and divine direction.",
    category: "Prayer",
    recurring: false
  }, {
    title: "Marriage Enrichment Retreat",
    date: "March 15-17, 2024",
    time: "Friday - Sunday",
    location: "Retreat Center",
    description: "Strengthen your marriage through biblical principles, workshops, and intimate fellowship.",
    category: "Marriage",
    recurring: false
  }, {
    title: "Community Outreach",
    date: "March 30, 2024",
    time: "8:00 AM - 4:00 PM",
    location: "Various Locations",
    description: "Reaching out to our community with love, food, medical care, and the Gospel of Jesus Christ.",
    category: "Outreach",
    recurring: false
  }];
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Weekly":
        return "bg-amber/20 text-primary";
      case "Conference":
        return "bg-amber/20 text-primary";
      case "Youth":
        return "bg-amber/20 text-primary";
      case "Prayer":
        return "bg-amber/20 text-primary";
      case "Marriage":
        return "bg-amber/20 text-primary";
      case "Outreach":
        return "bg-amber/20 text-primary";
      default:
        return "bg-lavender text-muted-foreground";
    }
  };
  const eventsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Church Events",
    "itemListElement": events.length > 0 ? events.slice(0, 5).map((event, index) => ({
      "@type": "Event",
      "position": index + 1,
      "name": event.title,
      "description": event.description,
      "startDate": event.content_data.date,
      "location": {
        "@type": "Place",
        "name": event.content_data.location || "TOT International"
      }
    })) : staticEvents.slice(0, 5).map((event, index) => ({
      "@type": "Event",
      "position": index + 1,
      "name": event.title,
      "description": event.description,
      "startDate": event.date,
      "location": {
        "@type": "Place",
        "name": event.location
      }
    }))
  };
  return <div className="min-h-screen bg-background">
      <SEO title="Church Events" description="Connect, grow, and serve together through our life-changing events and ministry gatherings at TOT International." canonical="/events" keywords="church events, worship services, conferences, youth events, community outreach, ministry gatherings" structuredData={eventsSchema} />
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-plum text-cream py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">EVENTS</h1>
              <p className="text-xl md:text-2xl text-cream/80 max-w-4xl mx-auto">
                Connect, grow, and serve together through our life-changing events and ministry gatherings.
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Upcoming Events</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Don't miss these powerful opportunities to encounter God and connect with the TOT family.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading ? [...Array(3)].map((_, i) => <Card key={i} className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </Card>) : events.length > 0 ? events.map(event => {
                    const isExpanded = expandedEvents.has(event.id);
                    const shouldTruncate = event.description && event.description.length > 120;
                    const displayText = !shouldTruncate || isExpanded ? event.description : event.description.slice(0, 120) + '...';
                    return <article key={event.id} id={`event-${event.id}`} className="card-lift scroll-mt-28 rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
                    <div className="relative aspect-[4/3] bg-gradient-plum overflow-hidden">
                      {event.image_url ? <img src={event.image_url} alt={event.title} loading="lazy" className="w-full h-full object-contain bg-muted" /> : <div className="w-full h-full flex items-center justify-center"><Calendar className="h-16 w-16 text-accent/60" /></div>}
                      <span className="absolute top-4 left-4 rounded-full bg-gradient-amber px-3 py-1 text-[11px] font-bold tracking-wider text-accent-foreground uppercase">
                        {event.content_data.category || 'Event'}
                      </span>
                      <span className="absolute bottom-4 right-4 rounded-xl bg-background/95 px-3 py-2 font-display font-bold text-primary text-lg shadow">
                        {event.content_data.date || 'TBD'}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <h3 className="text-xl font-bold text-primary leading-snug">{event.title}</h3>
                      <div>
                        <p className="text-muted-foreground leading-relaxed">{displayText}</p>
                        {shouldTruncate && <button onClick={() => toggleExpanded(event.id)} className="text-accent font-bold text-sm mt-2 hover:underline">
                            {isExpanded ? 'Read Less' : 'Read More'}
                          </button>}
                      </div>
                      <div className="space-y-2 text-sm text-foreground">
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-accent" />{event.content_data.time || 'TBD'}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-accent" />{event.content_data.location || 'TBD'}</div>
                      </div>
                      {event.content_data.enable_rsvp && <div className="mt-auto pt-2">
                          <Button asChild className="w-full">
                            <Link to={`/events/${event.id}/register`}><Users className="h-4 w-4 mr-2" />Register Now</Link>
                          </Button>
                        </div>}
                    </div>
                  </article>;
                  }) : staticEvents.map((event, index) => <div key={index} className="bg-card border border-border rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-primary">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 max-w-2xl">{event.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Button className="bg-gradient-amber text-primary hover:opacity-90 w-full lg:w-auto">
                        {event.recurring ? "Learn More" : "Register Now"}
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </section>


        {/* Contact for Events */}
        <section className="py-20 bg-card">
          
        </section>
      </div>
      <Footer />
    </div>;
};
export default Events;