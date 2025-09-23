import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, Search, Phone, Mail } from "lucide-react";

const FAQ = () => {
  const [faqCategories, setFaqCategories] = useState<Array<{
    title: string;
    questions: Array<{ q: string; a: string }>;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQContent();
  }, []);

  const fetchFAQContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq_content')
        .select('*')
        .eq('is_published', true)
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Group FAQs by category
      const groupedFAQs = (data || []).reduce((acc, faq) => {
        const existingCategory = acc.find(cat => cat.title === faq.category);
        if (existingCategory) {
          existingCategory.questions.push({
            q: faq.question,
            a: faq.answer
          });
        } else {
          acc.push({
            title: faq.category,
            questions: [{
              q: faq.question,
              a: faq.answer
            }]
          });
        }
        return acc;
      }, [] as Array<{ title: string; questions: Array<{ q: string; a: string }> }>);

      setFaqCategories(groupedFAQs);
    } catch (error) {
      console.error('Error fetching FAQ content:', error);
      // Fallback to default content if database fetch fails
      setFaqCategories([
        {
          title: "Visiting & Services",
          questions: [
            {
              q: "What time are your services?",
              a: "We have three Sunday services: 8:00 AM, 10:30 AM, and 6:00 PM. We also have Tuesday Prayer at 7:00 PM, Thursday Bible Study at 7:00 PM, and Saturday Youth service at 7:00 PM."
            },
        {
          q: "What should I wear to church?",
          a: "Come as you are! We welcome people in casual or formal attire. Our focus is on your heart, not your clothing. You'll see everything from jeans to suits."
        },
        {
          q: "Is there parking available?",
          a: "Yes, we have a large parking lot with plenty of free parking. Handicap accessible spots are available near the main entrance."
        },
        {
          q: "Do you have childcare during services?",
          a: "Yes, we provide nursery care for infants through age 4 during all Sunday services. Our children's ministry also offers age-appropriate programs for kids 5-12."
        }
      ]
    },
    {
      title: "Membership & Getting Involved",
      questions: [
        {
          q: "How do I become a member?",
          a: "Membership begins with attending our 'Join the Family' class, which covers our beliefs, values, and expectations. After completing the class, you can choose to become a member through baptism or transfer of membership."
        },
        {
          q: "What volunteer opportunities are available?",
          a: "We have many ways to serve! From greeting teams and ushers to children's ministry, worship team, and community outreach. Visit our 'Serve With Us' page or speak with a pastor to find your perfect fit."
        },
        {
          q: "Do you have small groups or Bible studies?",
          a: "Yes! We have various small groups that meet throughout the week in homes and at the church. These groups provide deeper fellowship, Bible study, and prayer support."
        }
      ]
    },
    {
      title: "Giving & Finances",
      questions: [
        {
          q: "How can I give to the church?",
          a: "You can give during service through the offering plate, online through our website, by mail, or through our mobile app. We accept cash, checks, and electronic transfers."
        },
        {
          q: "Is my giving tax-deductible?",
          a: "Yes, all donations to our church are tax-deductible. You'll receive a giving statement at the end of each year for tax purposes."
        },
        {
          q: "What does my giving support?",
          a: "Your giving supports our ministries, staff, facility maintenance, community outreach programs, missions, and various church operations that help us serve our congregation and community."
        }
      ]
    },
    {
      title: "Special Services & Events",
      questions: [
        {
          q: "Do you perform weddings?",
          a: "Yes, our pastoral staff performs weddings for members and regular attendees. Pre-marital counseling is required, and we recommend booking at least 6 months in advance."
        },
        {
          q: "What about baptisms?",
          a: "We celebrate baptism by full immersion during regular services, typically once a month. Baptism classes are available to help you understand this important step of faith."
        },
        {
          q: "Do you have baby dedication services?",
          a: "Yes, we hold baby dedication services quarterly where parents publicly commit to raising their children in a Christian home, and the congregation commits to supporting the family."
        }
      ]
    },
    {
      title: "Online Services & Technology",
      questions: [
        {
          q: "Can I watch services online?",
          a: "Yes! All our Sunday services are livestreamed on our website, Facebook, and YouTube. Recordings are also available for later viewing."
        },
        {
          q: "Do you have a church app?",
          a: "Yes, our mobile app includes sermon notes, giving options, event information, and push notifications for important updates. Download it from your app store."
        },
        {
          q: "How can I request prayer?",
          a: "You can submit prayer requests through our website, mobile app, during services, or by calling our prayer line. All requests are kept confidential unless you specify otherwise."
        }
      ]
    }
  ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions about our church, services, and community
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search FAQs..." 
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : faqCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No FAQ content available at this time.
            </div>
          ) : (
            faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-primary">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-2 pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Still Have Questions?</CardTitle>
              <CardDescription>
                We're here to help! Don't hesitate to reach out if you can't find what you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-muted-foreground mb-4">(555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday: 10:00 AM - 2:00 PM
                  </p>
                </div>
                
                <div className="text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-muted-foreground mb-4">info@tentoftestimony.org</p>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <h3 className="font-semibold mb-2">Visit Us In Person</h3>
                <p className="text-muted-foreground">
                  123 Church Street<br />
                  Springfield, IL 62701
                </p>
                <Button className="mt-4">
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;