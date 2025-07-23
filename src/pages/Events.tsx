import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const Events = () => {
  const upcomingEvents = [
    {
      title: "Sunday Service",
      date: "Every Sunday",
      time: "11:00 AM - 12:30 PM",
      location: "Main Sanctuary",
      description: "Join us for powerful worship, life-changing messages, and fellowship.",
      category: "Weekly",
      recurring: true
    },
    {
      title: "Prophetic Night",
      date: "January 26, 2024",
      time: "7:00 PM - 9:00 PM", 
      location: "Main Sanctuary",
      description: "An evening of prophetic ministry, prayer, and spiritual breakthrough.",
      category: "Special Event",
      recurring: false
    },
    {
      title: "Youth Gathering",
      date: "January 28, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Youth Center",
      description: "Young adults connecting through worship, teaching, and community.",
      category: "Youth",
      recurring: false
    },
    {
      title: "Prayer & Fasting",
      date: "February 1-7, 2024",
      time: "Various Times",
      location: "Multiple Locations",
      description: "7 days of corporate prayer and fasting for breakthrough and direction.",
      category: "Prayer",
      recurring: false
    },
    {
      title: "Marriage Enrichment",
      date: "February 10, 2024",
      time: "10:00 AM - 3:00 PM",
      location: "Fellowship Hall",
      description: "Strengthening marriages through biblical principles and practical tools.",
      category: "Ministry",
      recurring: false
    },
    {
      title: "Community Outreach",
      date: "February 17, 2024",
      time: "9:00 AM - 2:00 PM",
      location: "Downtown Area",
      description: "Serving our community with food, prayer, and practical assistance.",
      category: "Outreach", 
      recurring: false
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Weekly": return "bg-blue-100 text-blue-800";
      case "Special Event": return "bg-purple-100 text-purple-800";
      case "Youth": return "bg-green-100 text-green-800";
      case "Prayer": return "bg-orange-100 text-orange-800";
      case "Ministry": return "bg-pink-100 text-pink-800";
      case "Outreach": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">EVENTS</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                Connect, grow, and serve together through our church events and gatherings.
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
                Don't miss these opportunities to connect with God and our church family.
              </p>
            </div>
            
            <div className="grid gap-8">
              {upcomingEvents.map((event, index) => (
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
              ))}
            </div>
          </div>
        </section>

        {/* Event Categories */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Event Categories</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Find events that match your interests and spiritual journey.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Worship Services</h3>
                <p className="text-gray-700">Regular worship gatherings and special services</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Special Events</h3>
                <p className="text-gray-700">Conferences, revivals, and seasonal celebrations</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center shadow-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-xl font-bold text-black mb-2">Life Groups</h3>
                <p className="text-gray-700">Small group meetings for deeper connection</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Have Questions About Our Events?</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're here to help you find the perfect event to connect and grow in your faith journey.
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