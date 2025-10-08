import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Calendar, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "react-router-dom";

interface SermonContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    pastor?: string;
    date?: string;
    duration?: string;
    video_thumbnail?: string;
  };
  image_url?: string;
  video_url?: string;
}

export const LatestSermon = memo(() => {
  const [sermonContent, setSermonContent] = useState<SermonContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestSermon = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("media_content")
        .select("*")
        .eq("content_type", "live_stream")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching sermon content:", error);
      } else {
        setSermonContent(data as SermonContent);
      }
    } catch (error) {
      console.error("Error fetching sermon content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestSermon();

    // Set up real-time subscription with debouncing
    let timeoutId: NodeJS.Timeout;
    const channel = supabase
      .channel("sermon-content-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "media_content",
          filter: "content_type=eq.live_stream",
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fetchLatestSermon, 300);
        },
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchLatestSermon]);

  if (loading) {
    return (
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Skeleton className="h-16 w-80 mb-6" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
            <div className="relative">
              <Skeleton className="aspect-video rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback content if no data exists
  const defaultContent = {
    title: "Champions of Faith: Living Above Limitations",
    description:
      "In this powerful message, Pastor Timothy teaches us how to rise above every limitation through faith in God's promises and live as the champions we are called to be in Christ Jesus.",
    content_data: {
      pastor: "Pastor Timothy Kitui",
      date: "January 21, 2024",
      duration: "52:30",
      video_thumbnail:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
  };

  const content = sermonContent || defaultContent;
  const thumbnail =
    sermonContent?.image_url || content.content_data?.video_thumbnail || defaultContent.content_data.video_thumbnail;

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">LATEST MESSAGE</h2>
              <p className="text-xl text-gray-300 mb-8">
                Be transformed by God's Word through our biblical, practical, and life-changing messages that equip you
                for victorious living.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold leading-tight">"{content.title}"</h3>

              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {content.content_data?.pastor || defaultContent.content_data.pastor}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">{content.content_data?.date || defaultContent.content_data.date}</span>
                </div>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed">{content.description}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 font-bold">
                  <Link to="/watch">
                    <Play className="h-5 w-5 mr-2" />
                    WATCH NOW
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-black hover:bg-gray-100 font-bold">
                  <Link to="/watch">
                    ALL MESSAGES
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
              <LazyImage src={thumbnail} alt={content.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-black ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-bold">
                {content.content_data?.duration || defaultContent.content_data.duration}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

LatestSermon.displayName = "LatestSermon";
