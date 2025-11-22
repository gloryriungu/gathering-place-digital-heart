import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { MarketingDashboardHeader } from "@/components/marketing/MarketingDashboardHeader";
import { DepartmentInventory } from "@/components/inventory/DepartmentInventory";
import { RequisitionManager } from "@/components/requisitions/RequisitionManager";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Star, MessageSquare, Share2, HelpCircle, FileText, Mail, User, Webhook, Calendar, Settings } from "lucide-react";

// Marketing management components
import { AboutUsManager } from "@/components/marketing/AboutUsManager";
import { NewsletterCRM } from "@/components/marketing/NewsletterCRM";
import { NoticeFilmingManager } from "@/components/marketing/NoticeFilmingManager";
import { SocialMediaManager } from "@/components/marketing/SocialMediaManager";  
import { TestimonialsManager } from "@/components/marketing/TestimonialsManager";
import { FAQManager } from "@/components/marketing/FAQManager";
import { EventRegistrationsManager } from "@/components/media/EventRegistrationsManager";
import { LeadCaptureManager } from "@/components/marketing/LeadCaptureManager";
import { CampaignBuilder } from "@/components/marketing/CampaignBuilder";
import { SuppressionListManager } from "@/components/marketing/SuppressionListManager";
import { PaystackWebhookLogs } from "@/components/accounts/PaystackWebhookLogs";
import { GivePageManager } from "@/components/marketing/GivePageManager";

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  useInactivityLogout();

  const managementSections = [
    {
      id: "give-page",
      title: "Give Page Content",
      description: "Edit all content sections for the Give page",
      icon: FileText,
      color: "text-emerald-600"
    },
    {
      id: "leads",
      title: "Lead Capture",
      description: "View and manage all captured leads from forms",
      icon: Users,
      color: "text-blue-600"
    },
    {
      id: "campaigns",
      title: "Email Campaigns",
      description: "Create and manage targeted email campaigns with segmentation",
      icon: Mail,
      color: "text-green-600"
    },
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
    <AuthGuard allowedRoles={["marketing", "admin", "it"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20">
          <MarketingDashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 h-auto bg-muted p-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="give-page" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Give Page
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                About Us
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="filming" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Filming
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="requisitions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Requisitions
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
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

            <TabsContent value="leads">
              <LeadCaptureManager />
            </TabsContent>

            <TabsContent value="give-page">
              <GivePageManager />
            </TabsContent>

            <TabsContent value="campaigns">
              <div className="space-y-6">
                <CampaignBuilder />
                <SuppressionListManager />
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

            <TabsContent value="webhooks">
              <PaystackWebhookLogs />
            </TabsContent>

            <TabsContent value="registrations">
              <EventRegistrationsManager />
            </TabsContent>

            <TabsContent value="requisitions">
              <RequisitionManager userRole="marketing" departmentId="marketing" />
            </TabsContent>

            <TabsContent value="inventory">
              <DepartmentInventory 
                departmentId="marketing" 
                departmentName="Marketing" 
              />
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MarketingDashboard;