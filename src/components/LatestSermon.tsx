/**
 * LatestSermon Component
 * 
 * Language: TypeScript + React
 * 
 * Purpose:
 * - Displays the most recent sermon/message on the homepage
 * - Fetches latest live stream content from Supabase
 * - Embeds YouTube video or shows thumbnail with play button
 * - Provides sermon details (pastor, date, duration)
 * 
 * Key Features:
 * - Real-time sermon updates via Supabase subscriptions
 * - YouTube embed integration with fallback to thumbnail
 * - Lazy-loaded images for performance
 * - Links to Watch page for full message library
 * - Dark theme with white text
 */

import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Calendar, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "react-router-dom";
import { getYouTubeEmbedUrl } from "@/utils/youtube";

interface SermonContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    section_title?: string;
    section_description?: string;
    pastor?: string;
    date?: string;
    duration?: string;
    video_thumbnail?: string;
    youtube_url?: string;
  };
  image_url?: string;
  video_url?: string;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

const defaultContent: SermonContent = {
  id: "default",
  title: "Champions of Faith: Living Above Limitations",
  description:
    "In this powerful message, Pastor Timothy teaches us how to rise above every limitation through faith in God's promises and live as the champions we are called to be in Christ Jesus.",
  content_data: {
    section_title: "LATEST MESSAGE",
    section_description:
      "Be transformed by God's Word through biblical, practical and life-changing messages that equip you for victorious living.",
    pastor: "Pastor Timothy Kitui",
    date: "January 21, 2024",
    duration: "52:30",
    youtube_url: "",
    video_thumbnail: FALLBACK_THUMB,
  },
};

const thumbOf = (s: SermonContent) => s.image_url || s.content_data?.video_thumbnail || FALLBACK_THUMB;

export const LatestSermon = memo(() => {
  const [sermons, setSermons] = useState<SermonContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSermons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("media_content")
        .select("*")
        .eq("content_type", "live_stream")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) console.error("Error fetching sermon content:", error);
      else setSermons((data || []) as SermonContent[]);
    } catch (error) {
      console.error("Error fetching sermon content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
    let timeoutId: NodeJS.Timeout;
    const channel = supabase
      .channel("sermon-content-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "media_content", filter: "content_type=eq.live_stream" },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fetchSermons, 300);
        },
      )
      .subscribe();
    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchSermons]);

  if (loading) {
    return (
      <section className="py-20 bg-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  const content = sermons[0] || defaultContent;
  const others = sermons.slice(1, 4);
  const sectionTitle = content.content_data?.section_title || defaultContent.content_data.section_title!;
  const sectionDescription =
    content.content_data?.section_description || defaultContent.content_data.section_description;
  const videoUrl = content.video_url || content.content_data?.youtube_url;
  const embed = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <section className="relative py-20 md:py-28 bg-lavender overflow-hidden">
      <span aria-hidden className="pointer-events-none select-none absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold text-[8rem] md:text-[14rem] leading-none text-primary/[0.05] whitespace-nowrap">
        SERMONS
      </span>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-3">{sectionTitle}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary">
              Be Transformed by <span className="text-accent italic">the Word</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-xl">{sectionDescription}</p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-auto">
            <Link to="/watch">All Messages <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>

        {/* Featured split card */}
        <div className="card-lift grid lg:grid-cols-2 rounded-2xl overflow-hidden bg-gradient-plum text-primary-foreground">
          <div className="relative aspect-video lg:aspect-auto lg:min-h-[380px] bg-plum-deep group">
            {embed ? (
              <iframe
                src={embed}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <Link to="/watch" className="absolute inset-0">
                <LazyImage src={thumbOf(content)} alt={content.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-plum-deep/40 group-hover:bg-plum-deep/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="h-20 w-20 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 ml-1" />
                  </span>
                </div>
              </Link>
            )}
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center gap-5">
            <span className="self-start rounded-full bg-gradient-amber px-3 py-1 text-[11px] font-bold tracking-wider text-accent-foreground uppercase">
              Featured Message
            </span>
            <h3 className="text-2xl md:text-4xl font-bold leading-tight">{content.title}</h3>
            <div className="flex flex-wrap gap-5 text-primary-foreground/75 text-sm">
              <span className="flex items-center"><User className="h-4 w-4 mr-2 text-accent" />{content.content_data?.pastor || defaultContent.content_data.pastor}</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-accent" />{content.content_data?.date || defaultContent.content_data.date}</span>
            </div>
            <p className="text-primary-foreground/85 leading-relaxed line-clamp-4">{content.description}</p>
            <Button asChild size="lg" className="self-start">
              <Link to="/watch"><Play className="h-5 w-5 mr-2" />Watch Now</Link>
            </Button>
          </div>
        </div>

        {others.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {others.map((s) => (
              <Link key={s.id} to="/watch" className="card-lift group rounded-2xl bg-card border border-border overflow-hidden block">
                <div className="relative aspect-video">
                  <LazyImage src={thumbOf(s)} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-plum-deep/30 group-hover:bg-plum-deep/10 transition-colors" />
                  <span className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 ml-0.5" />
                  </span>
                  {s.content_data?.duration && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-plum-deep/85 text-primary-foreground px-2.5 py-0.5 text-xs font-bold">
                      {s.content_data.duration}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-display text-lg font-bold text-primary leading-snug line-clamp-2">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {[s.content_data?.pastor, s.content_data?.date].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

LatestSermon.displayName = "LatestSermon";
