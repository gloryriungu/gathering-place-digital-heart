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
import { Play, ArrowRight } from "lucide-react";
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

  return <section className="relative min-h-screen bg-primary text-primary-foreground overflow-hidden">
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
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
            {content.heading || defaultContent.heading}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            {content.subheading || defaultContent.subheading}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-black font-bold px-8 py-4 text-lg shadow-lg hover:bg-white">
              <Link to="/visit-us">
                {content.cta1_text || defaultContent.cta1_text}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" className="border-2 border-white text-white bg-white/10 backdrop-blur-sm font-bold px-8 py-4 text-lg whitespace-nowrap shadow-lg hover:bg-white/20">
              <Link to="/watch">
                <Play className="h-5 w-5 mr-2" />
                {content.cta2_text || defaultContent.cta2_text}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Service Times Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-background text-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-2xl font-bold">NEXT SERVICE</h3>
              <p className="text-lg">Sunday 9:00 AM & 11:00 AM</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-wide font-medium">JOIN US</p>
              <p className="text-xl font-bold">EVERY SUNDAY</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
});

Hero.displayName = 'Hero';