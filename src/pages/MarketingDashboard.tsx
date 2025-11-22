import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { MarketingDashboardHeader } from "@/components/marketing/MarketingDashboardHeader";
import { DepartmentInventory } from "@/components/inventory/DepartmentInventory";
import { RequisitionManager } from "@/components/requisitions/RequisitionManager";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Star, MessageSquare, Share2, HelpCircle, FileText, Mail, User, Webhook, Calendar, Settings } from "lucide-react";

// Marketing management components
import { AboutUsManager } from "@/components/marketing/AboutUsManager";
import { NoticeFilmingManager } from "@/components/marketing/NoticeFilmingManager";
import { SocialMediaManager } from "@/components/marketing/SocialMediaManager";  
import { TestimonialsManager } from "@/components/marketing/TestimonialsManager";
import { FAQManager } from "@/components/marketing/FAQManager";
import { EventRegistrationsManager } from "@/components/media/EventRegistrationsManager";
import { SubscriberManagement } from "@/components/marketing/SubscriberManagement";
import { CampaignBuilder } from "@/components/marketing/CampaignBuilder";
import { SuppressionListManager } from "@/components/marketing/SuppressionListManager";
import { PaystackWebhookLogs } from "@/components/accounts/PaystackWebhookLogs";
import { GivePageManager } from "@/components/marketing/GivePageManager";

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  useInactivityLogout();

  const menuItems = [
    { value: "overview", label: "Overview", icon: Calendar },
    { value: "give-page", label: "Give Page", icon: FileText },
    { value: "subscribers", label: "Subscribers", icon: Users },
    { value: "campaigns", label: "Email Campaigns", icon: Mail },
    { value: "about", label: "About Us", icon: FileText },
    { value: "filming", label: "Filming", icon: BarChart3 },
    { value: "social", label: "Social Media", icon: Share2 },
    { value: "testimonials", label: "Testimonials", icon: Star },
    { value: "faq", label: "FAQ", icon: HelpCircle },
    { value: "webhooks", label: "Webhooks", icon: Webhook },
    { value: "requisitions", label: "Requisitions", icon: FileText },
    { value: "inventory", label: "Inventory", icon: Settings },
    { value: "profile", label: "Profile", icon: User },
  ];

  const managementSections = [
    {
      id: "give-page",
      title: "Give Page Content",
      description: "Edit all content sections for the Give page",
      icon: FileText,
      color: "text-emerald-600"
    },
    {
      id: "subscribers",
      title: "Subscriber Management",
      description: "Unified analytics, management, and campaigns for all subscribers",
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
      <Navigation />
      <SidebarProvider>
        <div className="min-h-screen bg-background w-full flex pt-16">
          <Sidebar className="border-r bg-card shadow-sm">
            <SidebarContent className="overflow-y-auto pb-20">
              <div className="p-4 border-b bg-card sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-foreground">Marketing Dashboard</h2>
              </div>

              <SidebarGroup>
                <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.value;
                      return (
                        <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.value)}
                        className={isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'}
                      >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 bg-background">
            <MarketingDashboardHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                  <SidebarTrigger />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="hidden">
                    {menuItems.map((item) => (
                      <TabsTrigger key={item.value} value={item.value} />
                    ))}
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

                  <TabsContent value="subscribers">
                    <SubscriberManagement />
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
        </SidebarProvider>
      </AuthGuard>
    );
  };

export default MarketingDashboard;
