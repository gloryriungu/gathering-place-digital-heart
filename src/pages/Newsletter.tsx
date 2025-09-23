import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Calendar, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    preferences: {
      weekly: true,
      events: true,
      prayer: false,
      devotional: false
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          subscription_preferences: formData.preferences
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You've been successfully subscribed to our newsletter.",
        });
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          preferences: {
            weekly: true,
            events: true,
            prayer: false,
            devotional: false
          }
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Mail className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Stay Connected
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscribe to our newsletter and never miss important updates, inspiring messages, and upcoming events from our church family.
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Subscribe to Our Newsletter</CardTitle>
              <CardDescription className="text-center">
                Join thousands of subscribers receiving weekly inspiration and church updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name" 
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address" 
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Subscription Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="weekly" 
                          checked={formData.preferences.weekly}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev, 
                              preferences: { ...prev.preferences, weekly: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="weekly">Weekly Newsletter (Sundays)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="events" 
                          checked={formData.preferences.events}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev, 
                              preferences: { ...prev.preferences, events: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="events">Event Announcements</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="prayer" 
                          checked={formData.preferences.prayer}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev, 
                              preferences: { ...prev.preferences, prayer: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="prayer">Prayer Requests & Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="devotional" 
                          checked={formData.preferences.devotional}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev, 
                              preferences: { ...prev.preferences, devotional: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="devotional">Daily Devotionals</Label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                    {submitting ? "Subscribing..." : "Subscribe Now"}
                  </Button>
                </div>
              </form>
              
              <p className="text-xs text-muted-foreground text-center">
                By subscribing, you agree to our privacy policy. You can unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Receive</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Weekly Updates</CardTitle>
                <CardDescription>
                  Stay informed about upcoming services, events, and important church announcements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Inspirational Content</CardTitle>
                <CardDescription>
                  Receive encouraging messages, Bible verses, and spiritual insights to strengthen your faith
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community News</CardTitle>
                <CardDescription>
                  Learn about ministry opportunities, volunteer needs, and ways to get more involved
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Past Newsletters */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Newsletters</h2>
          <div className="space-y-6">
            {[
              {
                title: "Walking in Faith - December 2024",
                date: "December 15, 2024",
                excerpt: "This month we explore what it means to trust God's plan even when we can't see the full picture..."
              },
              {
                title: "Gratitude & Giving - November 2024",
                date: "November 15, 2024",
                excerpt: "As we enter the season of thanksgiving, let's reflect on God's abundant blessings in our lives..."
              },
              {
                title: "Community & Connection - October 2024",
                date: "October 15, 2024",
                excerpt: "Learn about our new small group initiatives and upcoming community outreach programs..."
              }
            ].map((newsletter, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{newsletter.title}</CardTitle>
                      <CardDescription>{newsletter.date}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{newsletter.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Newsletter;