import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, Phone, Mail, MapPin, Clock, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";
import CounselingBookingForm from "@/components/counseling/CounselingBookingForm";
import UpcomingSessions from "@/components/counseling/UpcomingSessions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
interface PageContent {
  hero?: {
    title: string;
    subtitle: string;
    image?: string;
  };
  about?: {
    title: string;
    description: string;
  };
  services?: {
    title: string;
    description: string;
  };
  quote?: {
    text: string;
    author: string;
  };
  cta?: {
    title: string;
    description: string;
    buttonText: string;
  };
}
const CounselingMentalHealth = () => {
  const {
    isAuthenticated,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const {
    checkAccess
  } = usePrerequisiteGuard("counseling booking");

  // Show auth required card if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">Counseling & Mental Health</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe in caring for the whole person - mind, body, and spirit.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                To book a counseling session, you need to be signed in. 
                This ensures your sessions are confidential and allows us to track your appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => navigate("/auth")}>
                Sign In to Continue
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? You can create one when you sign in.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>;
  }
  useEffect(() => {
    fetchPageContent();
  }, []);
  const fetchPageContent = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('page_content').select('*').eq('page_name', 'counseling').eq('is_published', true);
      if (error) throw error;
      const contentObj: PageContent = {};
      data?.forEach(item => {
        const parsedContent = JSON.parse(item.content);
        contentObj[item.section_name as keyof PageContent] = parsedContent;
      });
      setContent(contentObj);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleBookingClick = async () => {
    const hasAccess = await checkAccess();
    if (hasAccess) {
      setBookingDialogOpen(true);
    }
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {content.hero?.title || "Counseling & Mental Health"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {content.hero?.subtitle || "We believe in caring for the whole person - mind, body, and spirit. Our counseling ministry provides professional support and biblical guidance for life's challenges."}
          </p>
          
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mr-4" onClick={handleBookingClick}>
                <Calendar className="mr-2 h-5 w-5" />
                {content.cta?.buttonText || "Schedule Appointment"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Book Counseling Session</DialogTitle>
                <DialogDescription>
                  Select a date, time, and pastor to schedule your counseling appointment
                </DialogDescription>
              </DialogHeader>
              <CounselingBookingForm onSuccess={() => setBookingDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="lg" onClick={() => {
          document.getElementById('services-section')?.scrollIntoView({
            behavior: 'smooth'
          });
        }}>
            Learn More
          </Button>
        </div>
      </section>

      {/* Upcoming Sessions Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <UpcomingSessions />
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            {content.services?.title || "Our Services"}
          </h2>
          {content.services?.description && <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {content.services.description}
            </p>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Individual Counseling</CardTitle>
                <CardDescription>
                  One-on-one sessions addressing anxiety, depression, grief, and personal challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Licensed professional counselors</li>
                  <li>• Biblical counseling approach</li>
                  <li>• Confidential and safe environment</li>
                  <li>• Sliding scale fees available</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Marriage & Family</CardTitle>
                <CardDescription>
                  Strengthening relationships and building healthy family dynamics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Pre-marital counseling</li>
                  <li>• Marriage enrichment</li>
                  <li>• Family therapy sessions</li>
                  <li>• Parenting support groups</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Support Groups</CardTitle>
                <CardDescription>
                  Community-based healing through shared experiences and mutual support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Grief recovery groups</li>
                  <li>• Addiction recovery support</li>
                  <li>• Single parents network</li>
                  <li>• Mental health awareness</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact & Appointments */}
      <section className="py-16 px-4 bg-muted/50">
        
      </section>

      <Footer />
    </div>;
};
export default CounselingMentalHealth;