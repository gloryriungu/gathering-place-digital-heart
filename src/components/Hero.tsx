/**
 * Hero Component
 * 
 * Language: TypeScript + React
 * 
 * Purpose:
 * - Full-screen hero section for the homepage
 * - Dynamically loads content from Supabase (hero_content type)
 * - Features video/image background with call-to-action buttons
 * - Displays service times banner at the bottom
 * 
 * Key Features:
 * - Real-time content updates via Supabase subscriptions
 * - Video background with image fallback
 * - Customizable heading, subheading, and CTA buttons
 * - Loading skeleton for smooth UX
 * - Responsive design with mobile optimization
 */

import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface HeroContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    heading?: string;
    subheading?: string;
    cta1_text?: string;
    cta2_text?: string;
    cta_primary?: string;
    cta_secondary?: string;
    video_url?: string;
    image_url?: string;
    background_video?: string;
    background_image?: string;
  };
  image_url?: string;
  video_url?: string;
}

export const Hero = memo(() => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const fetchHeroContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'hero_content')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hero content:', error);
      } else {
        setHeroContent(data as HeroContent);
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroContent();
    
    // Set up real-time subscription with debouncing
    let timeoutId: NodeJS.Timeout;
    const channel = supabase
      .channel('hero-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_content',
          filter: "content_type=eq.hero_content"
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fetchHeroContent, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchHeroContent]);

  if (loading) {
    return (
      <section className="relative min-h-screen bg-primary text-primary-foreground overflow-hidden">
        <div className="relative flex items-center justify-center min-h-screen pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center space-y-6">
            <Skeleton className="h-20 w-full max-w-4xl mx-auto" />
            <Skeleton className="h-16 w-full max-w-6xl mx-auto" />
            <Skeleton className="h-12 w-full max-w-4xl mx-auto" />
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Skeleton className="h-14 w-48" />
              <Skeleton className="h-14 w-48" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback content if no data exists
  const defaultContent = {
    heading: "WELCOME TO TOT INTERNATIONAL",
    subheading: "A ministry committed to raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.",
    cta1_text: "JOIN US THIS SUNDAY",
    cta2_text: "WATCH LIVE",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  };

  const content = heroContent?.content_data || defaultContent;
  const backgroundVideo = (content as any).background_video || (content as any).video_url || defaultContent.video_url;
  const backgroundImage = (content as any).background_image || (content as any).image_url || defaultContent.image_url;

  return <section className="relative min-h-screen bg-primary text-primary-foreground overflow-hidden pt-20">
      {/* Background Image (immediate) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      
      {/* Background Video (lazy loaded) */}
      {!loading && (
        <video 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-plum-deep/90 via-primary/70 to-primary/30"></div>

      {/* Decorative line arcs */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 hidden md:block">
        <div className="h-[640px] w-[640px] rounded-full border border-accent/25" />
        <div className="absolute inset-16 rounded-full border border-accent/20" />
        <div className="absolute inset-32 rounded-full border border-accent/15" />
      </div>

      {/* Content */}
      <div className="relative flex items-center min-h-[calc(100vh-5rem)] py-8 md:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" /> Welcome Home
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {(() => {
                const h = content.heading || defaultContent.heading;
                const words = h.split(" ");
                if (words.length < 3) return h;
                const cut = Math.ceil(words.length / 2);
                return <>{words.slice(0, cut).join(" ")}{" "}<span className="text-accent italic">{words.slice(cut).join(" ")}</span></>;
              })()}
            </h1>
            <p className="text-base md:text-lg mb-6 max-w-xl text-primary-foreground/85 leading-relaxed">
              {content.subheading || defaultContent.subheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 text-base">
                <Link to="/visit-us">
                  <MapPin className="h-5 w-5 mr-2" />
                  {(content as any).cta_primary || content.cta1_text || defaultContent.cta1_text}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 text-base border-2 border-accent bg-transparent text-primary-foreground hover:bg-accent/15 hover:text-primary-foreground">
                <Link to="/watch">
                  <Play className="h-5 w-5 mr-2" />
                  {(content as any).cta_secondary || content.cta2_text || defaultContent.cta2_text}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
});

Hero.displayName = 'Hero';