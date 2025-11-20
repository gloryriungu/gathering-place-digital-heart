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
import { BarChart3, Users, Star, MessageSquare, Share2, HelpCircle, FileText, Mail, User, Webhook } from "lucide-react";

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

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  useInactivityLogout();

  const managementSections = [
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-5 lg:grid-cols-11">
                <TabsTrigger value="overview">
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger value="about">
                  <span className="hidden sm:inline">About Us</span>
                  <span className="sm:hidden">About</span>
                </TabsTrigger>
                <TabsTrigger value="newsletter">
                  <span className="hidden sm:inline">Newsletter</span>
                  <span className="sm:hidden">News</span>
                </TabsTrigger>
                <TabsTrigger value="filming" className="hidden sm:flex">Filming</TabsTrigger>
                <TabsTrigger value="social" className="hidden sm:flex">Social Media</TabsTrigger>
                <TabsTrigger value="testimonials" className="hidden lg:flex">Testimonials</TabsTrigger>
                <TabsTrigger value="faq" className="hidden lg:flex">FAQ</TabsTrigger>
                <TabsTrigger value="webhooks" className="hidden lg:flex">Webhooks</TabsTrigger>
                <TabsTrigger value="requisitions" className="hidden lg:flex">Requisitions</TabsTrigger>
                <TabsTrigger value="inventory" className="hidden lg:flex">Inventory</TabsTrigger>
                <TabsTrigger value="profile" className="hidden lg:flex">Profile</TabsTrigger>
              </TabsList>
              
              {/* Mobile dropdown for hidden tabs */}
              <div className="sm:hidden w-full">
                <select 
                  value={activeTab} 
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="filming">Filming</option>
                  <option value="social">Social Media</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="faq">FAQ</option>
                  <option value="webhooks">Webhook Logs</option>
                  <option value="requisitions">Requisitions</option>
                  <option value="inventory">Inventory</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
            </div>

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