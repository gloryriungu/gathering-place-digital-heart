import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbedUrl } from "@/utils/youtube";

interface WatchPageData {
  hero_title: string;
  hero_subtitle: string;
  live_service_title: string;
  live_service_description: string;
  service_times: string;
  sermons: Array<{
    title: string;
    date: string;
    duration: string;
    description: string;
    video_url?: string;
  }>;
}

const Watch = () => {
  const [watchData, setWatchData] = useState<WatchPageData>({
    hero_title: "WATCH ONLINE",
    hero_subtitle: "Experience the presence of God from anywhere in the world. Join our live services and be transformed by God's Word.",
    live_service_title: "Worship With Us Live",
    live_service_description: "Every Sunday at 9:00 AM & 11:00 AM EAT - Experience powerful worship, life-changing messages, and the presence of God.",
    service_times: "Sundays: 9:00 AM & 11:00 AM EAT\nWednesday: 7:00 PM Bible Study",
    sermons: [
      {
        title: "Champions of Faith",
        date: "January 21, 2024",
        duration: "52 min",
        description: "Discover how to live as a champion of faith, overcoming every obstacle through God's power and promises."
      },
      {
        title: "Destined for Greatness",
        date: "January 14, 2024", 
        duration: "48 min",
        description: "Understanding your divine destiny and walking in the greatness God has planned for your life."
      },
      {
        title: "The Power of Prayer",
        date: "January 7, 2024",
        duration: "45 min", 
        description: "Unlocking the supernatural power of prayer and intercession in your daily walk with God."
      }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string>('');

  useEffect(() => {
    fetchWatchPageData();
    fetchLiveStreamStatus();
  }, []);

  const fetchLiveStreamStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'live_stream')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching live stream status:', error);
        return;
      }

      if (data && data.content_data) {
        const content = data.content_data as any;
        setIsLive(content.is_live || false);
        setLiveStreamUrl(content.youtube_url || '');
      }
    } catch (error) {
      console.error('Error fetching live stream status:', error);
    }
  };

  const fetchWatchPageData = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'watch_page')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching watch page data:', error);
        return;
      }

      if (data && data.length > 0) {
        const content = data[0].content_data as any;
        setWatchData({
          hero_title: content?.hero_title || watchData.hero_title,
          hero_subtitle: content?.hero_subtitle || watchData.hero_subtitle,
          live_service_title: content?.live_service_title || watchData.live_service_title,
          live_service_description: content?.live_service_description || watchData.live_service_description,
          service_times: content?.service_times || watchData.service_times,
          sermons: content?.sermons || watchData.sermons
        });
      }
    } catch (error) {
      console.error('Error fetching watch page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": watchData.live_service_title,
    "description": watchData.live_service_description,
    "uploadDate": new Date().toISOString(),
    "contentUrl": "https://tot123.netlify.app/watch"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Watch Online Services"
        description="Experience the presence of God from anywhere. Join our live worship services and watch powerful sermons from TOT International."
        canonical="/watch"
        keywords="watch online, live streaming church, church sermons, worship service online, live worship"
        structuredData={videoSchema}
      />
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">{watchData.hero_title}</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
                {watchData.hero_subtitle}
              </p>
              <Button 
                className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4"
                onClick={() => {
                  if (isLive && liveStreamUrl) {
                    window.open(liveStreamUrl, '_blank');
                  } else {
                    document.getElementById('live-service-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                {isLive ? 'JOIN LIVE NOW' : 'VIEW SCHEDULE'}
              </Button>
            </div>
          </div>
        </section>

        {/* Live Service */}
        <section id="live-service-section" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{watchData.live_service_title}</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                {watchData.live_service_description}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8">
                {isLive && liveStreamUrl && getYouTubeEmbedUrl(liveStreamUrl) ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(liveStreamUrl) || ''}
                    title="Live Service Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-white">
                    <div>
                      <Play className="h-20 w-20 mx-auto mb-4 opacity-60" />
                      <p className="text-xl">TOT International Live Stream</p>
                      <p className="text-gray-400">Next service: Sunday 9:00 AM EAT</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Service Times</h3>
                  {watchData.service_times.split('\n').map((time, index) => (
                    <p key={index} className="text-gray-700">{time}</p>
                  ))}
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Duration</h3>
                  <p className="text-gray-700">Approximately 2 hours</p>
                  <p className="text-gray-700">Including worship & message</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sermons */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Recent Messages</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Catch up on powerful messages from Pastor Timothy Kitui and other anointed ministers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {watchData.sermons.map((sermon, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    {sermon.video_url && getYouTubeEmbedUrl(sermon.video_url) ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYouTubeEmbedUrl(sermon.video_url) || ''}
                        title={sermon.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <Play className="h-12 w-12 text-white opacity-60" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-2">{sermon.title}</h3>
                    <p className="text-gray-700 mb-4">{sermon.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{sermon.date}</span>
                      <span>{sermon.duration}</span>
                    </div>
                    {sermon.video_url && (
                      <Button 
                        className="w-full bg-black text-white hover:bg-gray-800"
                        onClick={() => window.open(sermon.video_url, '_blank')}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                View All Messages
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Watch;
