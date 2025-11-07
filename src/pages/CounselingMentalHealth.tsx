/**
 * COUNSELING & MENTAL HEALTH SERVICES PAGE
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Type-safe React components
 * - React: Component-based UI framework
 * - Lucide React: Icon library for visual elements
 * 
 * FUNCTIONALITY:
 * Information page about the church's counseling and mental health support services:
 * 
 * SERVICES OFFERED:
 * 1. Individual Counseling:
 *    - One-on-one sessions for anxiety, depression, grief
 *    - Licensed professional counselors
 *    - Biblical counseling approach
 *    - Confidential environment
 *    - Sliding scale fees available
 * 
 * 2. Marriage & Family Counseling:
 *    - Pre-marital counseling
 *    - Marriage enrichment programs
 *    - Family therapy sessions
 *    - Parenting support groups
 * 
 * 3. Support Groups:
 *    - Grief recovery groups
 *    - Addiction recovery support
 *    - Single parents network
 *    - Mental health awareness
 * 
 * CONTACT INFORMATION:
 * - Phone: (555) 123-4567
 * - Email: counseling@tentoftestimony.org
 * - Physical address for in-person appointments
 * 
 * OFFICE HOURS:
 * - Monday-Thursday: 9:00 AM - 7:00 PM
 * - Friday: 9:00 AM - 5:00 PM
 * - Saturday: 10:00 AM - 4:00 PM
 * - Sunday: By appointment only
 * - 24/7 emergency crisis hotline available
 * 
 * KEY FEATURES:
 * - Hero section with overview of whole-person care philosophy
 * - Service cards with detailed descriptions
 * - Appointment scheduling call-to-action buttons
 * - Comprehensive office hours display
 * - Emergency support information
 * 
 * PURPOSE:
 * Promotes mental health services and reduces stigma around counseling by integrating
 * professional mental health care with biblical principles and spiritual support.
 */
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, Phone, Mail, MapPin } from "lucide-react";

const CounselingMentalHealth = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Counseling & Mental Health
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We believe in caring for the whole person - mind, body, and spirit. Our counseling ministry provides professional support and biblical guidance for life's challenges.
          </p>
          <Button size="lg" className="mr-4">
            Schedule Appointment
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Get Started Today</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Schedule an Appointment</CardTitle>
                <CardDescription>
                  Ready to take the first step? Our caring team is here to help.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>counseling@tentoftestimony.org</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>123 Church Street, Springfield, IL 62701</span>
                </div>
                <Button className="w-full mt-4">
                  Book Appointment Online
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
                <CardDescription>
                  Our counseling center is open throughout the week to serve you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Thursday</span>
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>By Appointment</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Emergency support available 24/7 through our crisis hotline.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CounselingMentalHealth;