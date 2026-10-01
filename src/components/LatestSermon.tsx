/**
 * LatestSermon Component
 *
 * Shows the newest message from the Watch page library as a featured card,
 * followed by the next three most recently uploaded messages.
 *
 * Source of truth: media_content (content_type = 'watch_page') -> content_data.sermons
 * The sermons array is stored oldest-first, so it is reversed for display.
 */

import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Calendar, User, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "react-router-dom";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/utils/youtube";

interface Sermon {
  title: string;
  date?: string;
  duration?: string;
  description?: string;
  video_url?: string;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

const SECTION_TITLE = "LATEST MESSAGE";
const SECTION_DESCRIPTION =
  "Be transformed by God's Word through biblical, practical and life-changing messages that equip you for victorious living.";

const defaultSermons: Sermon[] = [
  {
    title: "Champions of Faith: Living Above Limitations",
    date: "January 21, 2024",
    duration: "52 min",
    description: "Sermon by Pastor Timothy Kitui",
  },
];

const thumbOf = (s: Sermon) => getYouTubeThumbnail(s.video_url) || FALLBACK_THUMB;

export const LatestSermon = memo(() => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSermons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("media_content")
        .select("content_data")
        .eq("content_type", "watch_page")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching watch page sermons:", error);
      } else {
        const list = ((data?.[0]?.content_data as any)?.sermons || []) as Sermon[];
        // Stored oldest-first — reverse so the newest upload comes first
        setSermons([...list].reverse());
      }
    } catch (error) {
      console.error("Error fetching watch page sermons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
    let timeoutId: NodeJS.Timeout;
    const channel = supabase
      .channel("homepage-watch-page-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "media_content", filter: "content_type=eq.watch_page" },
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

  const list = sermons.length > 0 ? sermons : defaultSermons;
  const featured = list[0];
  const others = list.slice(1, 4);
  const embed = featured.video_url ? getYouTubeEmbedUrl(featured.video_url) : null;

  return (
    <section className="relative py-20 md:py-28 bg-lavender overflow-hidden">
      <span aria-hidden className="pointer-events-none select-none absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold text-[8rem] md:text-[14rem] leading-none text-primary/[0.05] whitespace-nowrap">
        SERMONS
      </span>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-3">{SECTION_TITLE}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary">
              Be Transformed by <span className="text-accent italic">the Word</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-xl">{SECTION_DESCRIPTION}</p>
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
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <Link to="/watch" className="absolute inset-0">
                <LazyImage src={thumbOf(featured)} alt={featured.title} className="w-full h-full object-cover" />
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
            <h3 className="text-2xl md:text-4xl font-bold leading-tight">{featured.title}</h3>
            <div className="flex flex-wrap gap-5 text-primary-foreground/75 text-sm">
              {featured.description && (
                <span className="flex items-center"><User className="h-4 w-4 mr-2 text-accent" />{featured.description}</span>
              )}
              {featured.date && (
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-accent" />{featured.date}</span>
              )}
              {featured.duration && (
                <span className="flex items-center"><Clock className="h-4 w-4 mr-2 text-accent" />{featured.duration}</span>
              )}
            </div>
            <Button asChild size="lg" className="self-start">
              <Link to="/watch"><Play className="h-5 w-5 mr-2" />Watch Now</Link>
            </Button>
          </div>
        </div>

        {others.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {others.map((s, i) => (
              <Link key={`${s.title}-${i}`} to="/watch" className="card-lift group rounded-2xl bg-card border border-border overflow-hidden block">
                <div className="relative aspect-video">
                  <LazyImage src={thumbOf(s)} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-plum-deep/30 group-hover:bg-plum-deep/10 transition-colors" />
                  <span className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 ml-0.5" />
                  </span>
                  {s.duration && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-plum-deep/85 text-primary-foreground px-2.5 py-0.5 text-xs font-bold">
                      {s.duration}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-display text-lg font-bold text-primary leading-snug line-clamp-2">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {[s.description, s.date].filter(Boolean).join(" · ")}
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
