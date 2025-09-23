import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote, Play } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  testimonial_text: string;
  image_url: string | null;
  video_url: string | null;
  is_featured: boolean;
}

interface TestimonialsProps {
  showOnlyFeatured?: boolean;
  maxItems?: number;
  showTitle?: boolean;
}

export const Testimonials = ({ 
  showOnlyFeatured = false, 
  maxItems,
  showTitle = true 
}: TestimonialsProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (showOnlyFeatured) {
        query = query.eq('is_featured', true);
      }

      if (maxItems) {
        query = query.limit(maxItems);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = (videoUrl: string) => {
    // Convert YouTube URLs to embeddable format
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Open video in new window/tab
    window.open(embedUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        {showTitle && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary mr-2" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {showOnlyFeatured ? "What People Say" : "Testimonials"}
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from our church family about their experiences and God's faithfulness
            </p>
          </div>
        )}

        <div className={`grid gap-8 ${
          testimonials.length === 1 ? 'max-w-2xl mx-auto' :
          testimonials.length === 2 ? 'md:grid-cols-2' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Image or Avatar */}
                  <div className="flex-shrink-0">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      {testimonial.is_featured && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    {testimonial.position && (
                      <p className="text-sm text-muted-foreground mb-3">{testimonial.position}</p>
                    )}

                    {/* Quote Icon */}
                    <Quote className="h-6 w-6 text-primary/30 mb-2" />
                    
                    {/* Testimonial Text */}
                    <blockquote className="text-muted-foreground leading-relaxed mb-4">
                      "{testimonial.testimonial_text}"
                    </blockquote>

                    {/* Video Button */}
                    {testimonial.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoPlay(testimonial.video_url!)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video Testimonial
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showOnlyFeatured && testimonials.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" onClick={() => window.location.href = '/testimonials'}>
              View All Testimonials
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};