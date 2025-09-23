import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Star, MessageSquare, Share2, HelpCircle, FileText, Mail } from "lucide-react";

// Marketing management components
import { AboutUsManager } from "@/components/marketing/AboutUsManager";
import { NewsletterCRM } from "@/components/marketing/NewsletterCRM";
import { NoticeFilmingManager } from "@/components/marketing/NoticeFilmingManager";
import { SocialMediaManager } from "@/components/marketing/SocialMediaManager";  
import { TestimonialsManager } from "@/components/marketing/TestimonialsManager";
import { FAQManager } from "@/components/marketing/FAQManager";

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const managementSections = [
    {
      id: "about",
      title: "About Us Content",
      description: "Manage church story, beliefs, leadership, and mission content",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      id: "newsletter",
      title: "Newsletter & CRM",
      description: "Manage subscribers, campaigns, and customer relationships",
      icon: Mail,
      color: "text-green-600"
    },
    {
      id: "filming",
      title: "Notice of Filming",
      description: "Update filming policies and privacy notices",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      id: "social",
      title: "Social Media",
      description: "Manage social media handles and platforms",
      icon: Share2,
      color: "text-pink-600"
    },
    {
      id: "testimonials",
      title: "Testimonials",
      description: "Manage member testimonials with photos and videos",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      id: "faq",
      title: "FAQ Content",
      description: "Update frequently asked questions and answers",
      icon: HelpCircle,
      color: "text-indigo-600"
    }
  ];

  return (
    <AuthGuard allowedRoles={["marketing", "it"]}>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Marketing Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage all marketing content, CRM, and public communications
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Marketing Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="filming">Filming</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {managementSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Card
                      key={section.id}
                      className="cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-primary"
                      onClick={() => setActiveTab(section.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-8 w-8 ${section.color}`} />
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {section.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Click to manage →
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="about">
              <AboutUsManager />
            </TabsContent>

            <TabsContent value="newsletter">
              <NewsletterCRM />
            </TabsContent>

            <TabsContent value="filming">
              <NoticeFilmingManager />
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaManager />
            </TabsContent>

            <TabsContent value="testimonials">
              <TestimonialsManager />
            </TabsContent>

            <TabsContent value="faq">
              <FAQManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MarketingDashboard;