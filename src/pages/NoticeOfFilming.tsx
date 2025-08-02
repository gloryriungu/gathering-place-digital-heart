import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Users, Shield, Eye, AlertTriangle } from "lucide-react";

const NoticeOfFilming = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Camera className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Notice of Filming
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Important information about recording and live streaming during our services and events
          </p>
        </div>
      </section>

      {/* Main Notice */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Notice:</strong> By entering our church premises, you acknowledge and consent to being recorded, photographed, or livestreamed during services and events.
            </AlertDescription>
          </Alert>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>What We Record</CardTitle>
                <CardDescription>
                  Understanding our filming and broadcasting practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Regular Services</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Sunday morning worship services (all three services)</li>
                    <li>• Special events and holiday services</li>
                    <li>• Guest speaker presentations</li>
                    <li>• Baptisms and dedication ceremonies</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Live Streaming</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Services are broadcast live on our website and social media</li>
                    <li>• Recordings are made available for later viewing</li>
                    <li>• Interactive features may include chat and prayer requests</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Photography</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Candid photos during fellowship and events</li>
                    <li>• Group photos for ministry and promotional purposes</li>
                    <li>• Documentation of church activities and milestones</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Your Privacy & Rights</CardTitle>
                <CardDescription>
                  How we protect your privacy and respect your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Privacy Protections</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Camera angles focus primarily on the stage and altar area</li>
                    <li>• Congregation seating is generally not in close-up view</li>
                    <li>• Children's ministry areas have additional protections</li>
                    <li>• Personal information is never disclosed without consent</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Opt-Out Options</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Designated "no filming" seating areas are available</li>
                    <li>• Contact our media team to discuss specific concerns</li>
                    <li>• Request removal of content if you appear prominently</li>
                    <li>• Special accommodations can be made for sensitive situations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Content Usage</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Recordings used for ministry, education, and outreach purposes</li>
                    <li>• Content may be shared on church website and social media</li>
                    <li>• Commercial use is strictly prohibited</li>
                    <li>• Content retention follows our data protection policy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Camera-Free Zones</CardTitle>
                <CardDescription>
                  Areas where filming and photography are restricted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Protected Areas</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Prayer counseling rooms</li>
                      <li>• Nursery and childcare areas</li>
                      <li>• Private meeting rooms</li>
                      <li>• Restroom facilities</li>
                      <li>• Staff offices and work areas</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Special Considerations</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Counseling and support group meetings</li>
                      <li>• Private family events and gatherings</li>
                      <li>• Confidential ministry sessions</li>
                      <li>• Designated quiet reflection spaces</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Questions or concerns about our filming policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about our filming policy, wish to opt out of recording, or have concerns about existing content, please contact us:
                </p>
                
                <div className="space-y-2">
                  <p><strong>Media Ministry Team:</strong> media@tentoftestimony.org</p>
                  <p><strong>Church Office:</strong> (555) 123-4567</p>
                  <p><strong>Privacy Officer:</strong> privacy@tentoftestimony.org</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This notice is effective as of January 1, 2024, and may be updated periodically. 
                    Current policies are always available on our website and at the church information desk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NoticeOfFilming;