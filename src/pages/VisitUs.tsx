import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Users, Car, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ServiceTime {
  name: string;
  time: string;
}

interface WhatToExpect {
  title: string;
  description: string;
}

interface VisitUsContent {
  hero_title: string;
  hero_subtitle: string;
  sunday_services: ServiceTime[];
  weekday_services: ServiceTime[];
  address_line1: string;
  address_line2: string;
  address_line3: string;
  phone: string;
  email: string;
  map_latitude: number;
  map_longitude: number;
  map_zoom: number;
  what_to_expect: WhatToExpect[];
  cta_title: string;
  cta_description: string;
}

const defaultContent: VisitUsContent = {
  hero_title: "VISIT TOT INTERNATIONAL",
  hero_subtitle: "We would love to meet you! Join us for an unforgettable worship experience.",
  sunday_services: [
    { name: "First Service", time: "7:00 AM - 9:00 AM" },
    { name: "Second Service", time: "9:30 AM - 11:30 AM" },
    { name: "Third Service", time: "12:00 PM - 2:00 PM" }
  ],
  weekday_services: [
    { name: "Tuesday Prayer", time: "6:00 PM - 8:00 PM" },
    { name: "Thursday Bible Study", time: "6:00 PM - 8:00 PM" },
    { name: "Saturday Youth", time: "4:00 PM - 6:00 PM" }
  ],
  address_line1: "123 Church Street",
  address_line2: "Nairobi, Kenya",
  address_line3: "00100",
  phone: "+254 700 123 456",
  email: "info@totinternational.org",
  map_latitude: -1.2921,
  map_longitude: 36.8219,
  map_zoom: 15,
  what_to_expect: [
    { title: "Warm Welcome", description: "Our friendly ushers will greet you and help you find the perfect seat." },
    { title: "Parking", description: "Free parking is available on-site with dedicated spaces for visitors." },
    { title: "Service Duration", description: "Services typically last 1.5-2 hours with powerful worship and teaching." }
  ],
  cta_title: "Ready to Join Us?",
  cta_description: "Experience the presence of God and connect with our amazing community of believers."
};

const iconMap: Record<string, any> = {
  "Warm Welcome": Users,
  "Parking": Car,
  "Service Duration": Clock
};

const VisitUs = () => {
  const [content, setContent] = useState<VisitUsContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'visit_us')
        .eq('is_published', true);

      if (data && data.length > 0) {
        const contentMap: any = {};
        data.forEach(item => {
          if (['sunday_services', 'weekday_services', 'what_to_expect'].includes(item.section_name)) {
            try {
              contentMap[item.section_name] = JSON.parse(item.content);
            } catch {
              // Keep default
            }
          } else if (['map_latitude', 'map_longitude', 'map_zoom'].includes(item.section_name)) {
            contentMap[item.section_name] = parseFloat(item.content) || defaultContent[item.section_name as keyof VisitUsContent];
          } else {
            contentMap[item.section_name] = item.content;
          }
        });
        
        if (Object.keys(contentMap).length > 0) {
          setContent(prev => ({ ...prev, ...contentMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching visit us content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${content.map_latitude},${content.map_longitude}`;
    window.open(url, '_blank');
  };

  const handleContact = () => {
    window.location.href = `mailto:${content.email}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-20 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2di00aC00djRoNHptMC02di00aC00djRoNHptLTYgNnYtNGgtNHY0aDR6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Find Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              {content.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto">
              {content.hero_subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Service Times */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Service Times</h2>
            <p className="text-muted-foreground">Join us for worship and fellowship</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Sunday Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {content.sunday_services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="font-semibold text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Weekday Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {content.weekday_services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="font-semibold text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Find Us Section with Map */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Find Us</h2>
            <p className="text-muted-foreground">Our church location</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-border">
              <MapContainer
                center={[content.map_latitude, content.map_longitude]}
                zoom={content.map_zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[content.map_latitude, content.map_longitude]}>
                  <Popup>
                    <div className="text-center">
                      <strong>TOT International</strong>
                      <br />
                      {content.address_line1}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Address</h3>
                      <p className="text-muted-foreground">
                        {content.address_line1}<br />
                        {content.address_line2}<br />
                        {content.address_line3}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Phone</h3>
                      <a href={`tel:${content.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {content.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Email</h3>
                      <a href={`mailto:${content.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {content.email}
                      </a>
                    </div>
                  </div>

                  <Button onClick={handleGetDirections} className="w-full" size="lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What to Expect</h2>
            <p className="text-muted-foreground">First time? Here's what you need to know</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {content.what_to_expect.map((item, index) => {
              const IconComponent = iconMap[item.title] || Users;
              return (
                <Card key={index} className="border-0 shadow-lg bg-card hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">{content.cta_title}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/80">
            {content.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetDirections}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleContact}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VisitUs;
