
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Calendar, User } from "lucide-react";

export const LatestSermon = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Message</h2>
          <p className="text-lg text-muted-foreground">
            Catch up on our most recent sermon or watch live
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  42:15
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                "Walking in Faith: Trusting God's Plan"
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Pastor John Smith
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  December 15, 2024
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                In this powerful message, Pastor John explores how we can trust in God's perfect timing 
                and plan for our lives, even when the path ahead seems uncertain. Drawing from the book 
                of Jeremiah, we learn practical steps to strengthen our faith journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
              <Button size="lg" variant="outline">
                View All Sermons
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
