import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { MediaDashboardHeader } from "@/components/media/MediaDashboardHeader";
import { LiveStreamManager } from "@/components/media/LiveStreamManager";
import { EventsManager } from "@/components/media/EventsManager";
import { ShopManager } from "@/components/media/ShopManager";
import { HeroContentManager } from "@/components/media/HeroContentManager";
import { AnnouncementsManager } from "@/components/media/AnnouncementsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, ShoppingBag, Home, Megaphone, BarChart3 } from "lucide-react";

const MediaDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AuthGuard allowedRoles={["media", "it"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="pt-20">
          <MediaDashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-xl p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="livestream" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Live Stream</TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Events</TabsTrigger>
                <TabsTrigger value="shop" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Shop</TabsTrigger>
                <TabsTrigger value="hero" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Homepage</TabsTrigger>
                <TabsTrigger value="announcements" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Management Center</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Choose a section below to manage your church's digital content and media
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => setActiveTab("livestream")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Video className="w-6 h-6 text-red-600" />
                        </div>
                        <Badge variant="secondary" className="bg-red-50 text-red-700">Active</Badge>
                      </div>
                      <CardTitle className="text-xl">Live Stream</CardTitle>
                      <CardDescription>Manage live broadcasts and streaming settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Control YouTube live streams, schedule broadcasts, and manage stream configurations for Sunday services and special events.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => setActiveTab("events")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">Manage</Badge>
                      </div>
                      <CardTitle className="text-xl">Events</CardTitle>
                      <CardDescription>Create and manage church events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Add new events, upload event posters, set dates and locations, and manage event announcements for the community.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => setActiveTab("shop")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-green-100 p-3 rounded-full">
                          <ShoppingBag className="w-6 h-6 text-green-600" />
                        </div>
                        <Badge variant="secondary" className="bg-green-50 text-green-700">Products</Badge>
                      </div>
                      <CardTitle className="text-xl">Shop</CardTitle>
                      <CardDescription>Manage merchandise and products</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Add new products, upload product images, manage inventory, set prices, and update the church merchandise store.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => setActiveTab("hero")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Home className="w-6 h-6 text-purple-600" />
                        </div>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700">Homepage</Badge>
                      </div>
                      <CardTitle className="text-xl">Homepage</CardTitle>
                      <CardDescription>Update homepage hero content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Manage the hero section, update welcome messages, change background videos/images, and customize call-to-action buttons.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => setActiveTab("announcements")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <Megaphone className="w-6 h-6 text-orange-600" />
                        </div>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700">Notify</Badge>
                      </div>
                      <CardTitle className="text-xl">Announcements</CardTitle>
                      <CardDescription>Create important announcements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Post important church announcements, service updates, and notifications to keep the congregation informed.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-indigo-100 p-3 rounded-full">
                          <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">Coming Soon</Badge>
                      </div>
                      <CardTitle className="text-xl">Analytics</CardTitle>
                      <CardDescription>Content performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Track engagement, website views, content performance, and get insights into your digital ministry impact.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="livestream">
                <LiveStreamManager />
              </TabsContent>

              <TabsContent value="events">
                <EventsManager />
              </TabsContent>

              <TabsContent value="shop">
                <ShopManager />
              </TabsContent>

              <TabsContent value="hero">
                <HeroContentManager />
              </TabsContent>

              <TabsContent value="announcements">
                <AnnouncementsManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MediaDashboard;