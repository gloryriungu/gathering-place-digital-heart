import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Youtube, Twitter, Music2, MessageCircle } from "lucide-react";

interface SocialMediaLink {
  platform: string;
  url: string;
  handle: string;
  icon: any;
}

export const useSocialMedia = () => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_media_handles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const iconMap: Record<string, any> = {
        'Facebook': Facebook,
        'Instagram': Instagram,
        'Youtube': Youtube,
        'YouTube': Youtube,
        'Twitter': Twitter,
        'Spotify': Music2,
        'TikTok': MessageCircle,
      };

      const formattedLinks = (data || []).map((handle) => ({
        platform: handle.platform,
        url: handle.url,
        handle: handle.handle,
        icon: iconMap[handle.icon] || iconMap[handle.platform] || Facebook,
      }));

      setSocialLinks(formattedLinks);
    } catch (error) {
      console.error('Error fetching social media links:', error);
      // Fallback to default links if fetch fails
      setSocialLinks([
        { platform: "Facebook", url: "https://facebook.com/totinternational", handle: "@totinternational", icon: Facebook },
        { platform: "Instagram", url: "https://instagram.com/totinternational", handle: "@totinternational", icon: Instagram },
        { platform: "YouTube", url: "https://youtube.com/totinternational", handle: "TOT International", icon: Youtube },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { socialLinks, loading, refreshSocialMedia: fetchSocialMedia };
};