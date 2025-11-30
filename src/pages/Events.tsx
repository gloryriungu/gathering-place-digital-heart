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

  useEffect(() => {
    fetchEvents();
    
    // Real-time updates
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, 
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('media_content')
      .select('*')
      .eq('content_type', 'event')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (data) setEvents(data);
    setLoading(false);
  };

  const staticEvents = [
    {
      title: "Sunday Service",
      date: "Every Sunday",
      time: "9:00 AM & 11:00 AM",
      location: "Main Auditorium",
      description: "Join us for powerful worship, life-changing messages, and fellowship with the TOT family.",
      category: "Weekly",
      recurring: true
    },
    {
      title: "Champions Conference 2024",
      date: "February 15-17, 2024",
      time: "7:00 PM Daily", 
      location: "Main Auditorium",
      description: "Three days of intensive ministry, worship, and impartation. Special guest ministers from around the world.",
      category: "Conference",
      recurring: false
    },
    {
      title: "TOT Youth Explosion",
      date: "February 23, 2024",
      time: "6:00 PM - 9:00 PM",
      location: "Youth Center",
      description: "An explosive evening of worship, games, and powerful ministry designed for young champions.",
      category: "Youth",
      recurring: false
    },
    {
      title: "Prayer & Fasting Week",
      date: "March 1-7, 2024",
      time: "6:00 AM & 6:00 PM",
      location: "Prayer Hall",
      description: "Seven days of corporate prayer and fasting for breakthrough, revival, and divine direction.",
      category: "Prayer",
      recurring: false
    },
    {
      title: "Marriage Enrichment Retreat",
      date: "March 15-17, 2024",
      time: "Friday - Sunday",
      location: "Retreat Center",
      description: "Strengthen your marriage through biblical principles, workshops, and intimate fellowship.",
      category: "Marriage",
      recurring: false
    },
    {
      title: "Community Outreach",
      date: "March 30, 2024",
      time: "8:00 AM - 4:00 PM",
      location: "Various Locations",
      description: "Reaching out to our community with love, food, medical care, and the Gospel of Jesus Christ.",
      category: "Outreach", 
      recurring: false
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Weekly": return "bg-blue-100 text-blue-800";
      case "Conference": return "bg-purple-100 text-purple-800";
      case "Youth": return "bg-green-100 text-green-800";
      case "Prayer": return "bg-orange-100 text-orange-800";
      case "Marriage": return "bg-pink-100 text-pink-800";
      case "Outreach": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const eventsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Church Events",
    "itemListElement": events.length > 0 
      ? events.slice(0, 5).map((event, index) => ({
          "@type": "Event",
          "position": index + 1,
          "name": event.title,
          "description": event.description,
          "startDate": event.content_data.date,
          "location": {
            "@type": "Place",
            "name": event.content_data.location || "TOT International"
          }
        }))
      : staticEvents.slice(0, 5).map((event, index) => ({
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Church Events"
        description="Connect, grow, and serve together through our life-changing events and ministry gatherings at TOT International."
        canonical="/events"
        keywords="church events, worship services, conferences, youth events, community outreach, ministry gatherings"
        structuredData={eventsSchema}
      />
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">EVENTS</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                Connect, grow, and serve together through our life-changing events and ministry gatherings.
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Upcoming Events</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Don't miss these powerful opportunities to encounter God and connect with the TOT family.
              </p>
            </div>
            
            <div className="grid gap-8">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </Card>
                ))
              ) : events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {event.image_url && (
                        <div className="lg:w-80 flex-shrink-0">
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-black">{event.title}</h3>
                          {event.content_data.category && (
                            <Badge>{event.content_data.category}</Badge>
                          )}
                          {event.content_data.enable_rsvp && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              RSVP Open
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-4 max-w-2xl">{event.description}</p>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {event.content_data.date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{event.content_data.date}</span>
                            </div>
                          )}
                          {event.content_data.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.content_data.time}</span>
                            </div>
                          )}
                          {event.content_data.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.content_data.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 p-6 lg:p-0">
                        {event.content_data.enable_rsvp ? (
                          <Button asChild className="bg-black text-white hover:bg-gray-800">
                            <Link to={`/events/${event.id}/register`}>Register Now</Link>
                          </Button>
                        ) : (
                          <Button variant="outline">Learn More</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                staticEvents.map((event, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-black">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4 max-w-2xl">{event.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                      <Button className="bg-black text-white hover:bg-gray-800 w-full lg:w-auto">
                        {event.recurring ? "Learn More" : "Register Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </section>

        {/* Event Categories */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Ministry Areas</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Discover different ways to grow in your faith and serve in God's kingdom.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Worship Services</h3>
                <p className="text-gray-700">Weekly worship gatherings and special services</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Conferences</h3>
                <p className="text-gray-700">Annual conferences and revival meetings</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Life Groups</h3>
                <p className="text-gray-700">Small group fellowship and discipleship</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Outreach</h3>
                <p className="text-gray-700">Community service and evangelism events</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Events */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Need More Information?</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're here to help you find the perfect event to connect and grow in your faith journey with TOT International.
            </p>
            <Button className="bg-black text-white hover:bg-gray-800 text-lg px-8 py-4">
              Contact Our Events Team
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Events;
