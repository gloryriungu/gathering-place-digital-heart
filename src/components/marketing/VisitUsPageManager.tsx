import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, MapPin, AlertCircle, Plus, Trash2, Clock } from "lucide-react";

interface ServiceTime {
  name: string;
  time: string;
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
  map_latitude: string;
  map_longitude: string;
  map_zoom: string;
  what_to_expect: Array<{ title: string; description: string }>;
  cta_title: string;
  cta_description: string;
}

export const VisitUsPageManager = () => {
  const [content, setContent] = useState<VisitUsContent>({
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
    map_latitude: "-1.2921",
    map_longitude: "36.8219",
    map_zoom: "15",
    what_to_expect: [
      { title: "Warm Welcome", description: "Our friendly ushers will greet you and help you find the perfect seat." },
      { title: "Parking", description: "Free parking is available on-site with dedicated spaces for visitors." },
      { title: "Service Duration", description: "Services typically last 1.5-2 hours with powerful worship and teaching." }
    ],
    cta_title: "Ready to Join Us?",
    cta_description: "Experience the presence of God and connect with our amazing community of believers."
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
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
              contentMap[item.section_name] = [];
            }
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
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const sections = [
        { section_name: 'hero_title', content: content.hero_title, content_type: 'text' },
        { section_name: 'hero_subtitle', content: content.hero_subtitle, content_type: 'text' },
        { section_name: 'sunday_services', content: JSON.stringify(content.sunday_services), content_type: 'json' },
        { section_name: 'weekday_services', content: JSON.stringify(content.weekday_services), content_type: 'json' },
        { section_name: 'address_line1', content: content.address_line1, content_type: 'text' },
        { section_name: 'address_line2', content: content.address_line2, content_type: 'text' },
        { section_name: 'address_line3', content: content.address_line3, content_type: 'text' },
        { section_name: 'phone', content: content.phone, content_type: 'text' },
        { section_name: 'email', content: content.email, content_type: 'text' },
        { section_name: 'map_latitude', content: content.map_latitude, content_type: 'text' },
        { section_name: 'map_longitude', content: content.map_longitude, content_type: 'text' },
        { section_name: 'map_zoom', content: content.map_zoom, content_type: 'text' },
        { section_name: 'what_to_expect', content: JSON.stringify(content.what_to_expect), content_type: 'json' },
        { section_name: 'cta_title', content: content.cta_title, content_type: 'text' },
        { section_name: 'cta_description', content: content.cta_description, content_type: 'text' }
      ];

      for (const section of sections) {
        await supabase
          .from('page_content')
          .upsert({
            page_name: 'visit_us',
            section_name: section.section_name,
            content_type: section.content_type,
            content: section.content,
            is_published: true
          }, {
            onConflict: 'page_name,section_name'
          });
      }

      toast({
        title: "Success",
        description: "Visit Us page content updated successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateServiceTime = (
    type: 'sunday_services' | 'weekday_services',
    index: number,
    field: 'name' | 'time',
    value: string
  ) => {
    const services = [...content[type]];
    services[index] = { ...services[index], [field]: value };
    setContent(prev => ({ ...prev, [type]: services }));
  };

  const addServiceTime = (type: 'sunday_services' | 'weekday_services') => {
    setContent(prev => ({
      ...prev,
      [type]: [...prev[type], { name: "", time: "" }]
    }));
  };

  const removeServiceTime = (type: 'sunday_services' | 'weekday_services', index: number) => {
    setContent(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Visit Us Page Management
          </h2>
          <p className="text-muted-foreground">
            Update service times, location, and visitor information
          </p>
        </div>
        <Button onClick={saveContent} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes made here will be reflected on the public Visit Us page immediately after saving.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main title and subtitle displayed at the top of the page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={content.hero_title}
                onChange={(e) => setContent(prev => ({ ...prev, hero_title: e.target.value }))}
                placeholder="Main title"
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={content.hero_subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                placeholder="Subtitle description"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sunday Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sunday Services
            </CardTitle>
            <CardDescription>Configure Sunday service times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.sunday_services.map((service, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <Input
                  value={service.name}
                  onChange={(e) => updateServiceTime('sunday_services', index, 'name', e.target.value)}
                  placeholder="Service name"
                  className="flex-1"
                />
                <Input
                  value={service.time}
                  onChange={(e) => updateServiceTime('sunday_services', index, 'time', e.target.value)}
                  placeholder="Time range"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeServiceTime('sunday_services', index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => addServiceTime('sunday_services')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sunday Service
            </Button>
          </CardContent>
        </Card>

        {/* Weekday Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekday Services
            </CardTitle>
            <CardDescription>Configure weekday service and event times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.weekday_services.map((service, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <Input
                  value={service.name}
                  onChange={(e) => updateServiceTime('weekday_services', index, 'name', e.target.value)}
                  placeholder="Service name"
                  className="flex-1"
                />
                <Input
                  value={service.time}
                  onChange={(e) => updateServiceTime('weekday_services', index, 'time', e.target.value)}
                  placeholder="Time range"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeServiceTime('weekday_services', index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => addServiceTime('weekday_services')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Weekday Service
            </Button>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Contact</CardTitle>
            <CardDescription>Church address and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={content.address_line1}
                  onChange={(e) => setContent(prev => ({ ...prev, address_line1: e.target.value }))}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={content.address_line2}
                  onChange={(e) => setContent(prev => ({ ...prev, address_line2: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="address_line3">Address Line 3</Label>
                <Input
                  id="address_line3"
                  value={content.address_line3}
                  onChange={(e) => setContent(prev => ({ ...prev, address_line3: e.target.value }))}
                  placeholder="Postal code"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={content.phone}
                  onChange={(e) => setContent(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={content.email}
                  onChange={(e) => setContent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@example.org"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Coordinates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Map Location
            </CardTitle>
            <CardDescription>
              Set the map coordinates for your church location. You can get coordinates from Google Maps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="map_latitude">Latitude</Label>
                <Input
                  id="map_latitude"
                  value={content.map_latitude}
                  onChange={(e) => setContent(prev => ({ ...prev, map_latitude: e.target.value }))}
                  placeholder="-1.2921"
                />
              </div>
              <div>
                <Label htmlFor="map_longitude">Longitude</Label>
                <Input
                  id="map_longitude"
                  value={content.map_longitude}
                  onChange={(e) => setContent(prev => ({ ...prev, map_longitude: e.target.value }))}
                  placeholder="36.8219"
                />
              </div>
              <div>
                <Label htmlFor="map_zoom">Zoom Level (1-18)</Label>
                <Input
                  id="map_zoom"
                  type="number"
                  min="1"
                  max="18"
                  value={content.map_zoom}
                  onChange={(e) => setContent(prev => ({ ...prev, map_zoom: e.target.value }))}
                  placeholder="15"
                />
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To find coordinates: Open Google Maps, right-click on your location, and copy the coordinates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
            <CardDescription>Information for first-time visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.what_to_expect.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <Label>Item {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = content.what_to_expect.filter((_, i) => i !== index);
                      setContent(prev => ({ ...prev, what_to_expect: newItems }));
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor={`expect_title_${index}`}>Title</Label>
                  <Input
                    id={`expect_title_${index}`}
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...content.what_to_expect];
                      newItems[index] = { ...newItems[index], title: e.target.value };
                      setContent(prev => ({ ...prev, what_to_expect: newItems }));
                    }}
                    placeholder="Title"
                  />
                </div>
                <div>
                  <Label htmlFor={`expect_desc_${index}`}>Description</Label>
                  <Textarea
                    id={`expect_desc_${index}`}
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...content.what_to_expect];
                      newItems[index] = { ...newItems[index], description: e.target.value };
                      setContent(prev => ({ ...prev, what_to_expect: newItems }));
                    }}
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setContent(prev => ({
                  ...prev,
                  what_to_expect: [...prev.what_to_expect, { title: "", description: "" }]
                }));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
            <CardDescription>Bottom section encouraging visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cta_title">CTA Title</Label>
              <Input
                id="cta_title"
                value={content.cta_title}
                onChange={(e) => setContent(prev => ({ ...prev, cta_title: e.target.value }))}
                placeholder="Ready to Join Us?"
              />
            </div>
            <div>
              <Label htmlFor="cta_description">CTA Description</Label>
              <Textarea
                id="cta_description"
                value={content.cta_description}
                onChange={(e) => setContent(prev => ({ ...prev, cta_description: e.target.value }))}
                placeholder="Encouraging message"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
