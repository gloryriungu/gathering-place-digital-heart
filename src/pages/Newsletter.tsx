import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Calendar, Users, BookOpen } from "lucide-react";

const Newsletter = () => {
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email address" />
              </div>

              <div className="space-y-3">
                <Label>Subscription Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="weekly" defaultChecked />
                    <Label htmlFor="weekly">Weekly Newsletter (Sundays)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="events" defaultChecked />
                    <Label htmlFor="events">Event Announcements</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="prayer" />
                    <Label htmlFor="prayer">Prayer Requests & Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="devotional" />
                    <Label htmlFor="devotional">Daily Devotionals</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Subscribe Now
              </Button>
              
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