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

const MediaDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AuthGuard allowedRoles={["media", "it"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20">
          <MediaDashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="livestream">Live Stream</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="shop">Shop</TabsTrigger>
                <TabsTrigger value="hero">Homepage</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Stream</CardTitle>
                      <CardDescription>Manage live broadcasts and streaming</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Control YouTube live streams, schedule broadcasts, and manage stream settings.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Events</CardTitle>
                      <CardDescription>Create and manage church events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Add new events, upload posters, and manage event announcements.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Shop</CardTitle>
                      <CardDescription>Manage merchandise and products</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Add products, upload images, and manage shop inventory.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Homepage</CardTitle>
                      <CardDescription>Update homepage content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Manage hero section, latest sermons, and homepage banners.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Announcements</CardTitle>
                      <CardDescription>Create church announcements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Post important announcements and notifications for members.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Content performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Track engagement, views, and content performance.
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