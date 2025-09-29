import { useState, useEffect, memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X, Calendar, Clock } from "lucide-react";

interface AnnouncementData {
  id: string;
  title: string;
  description: string;
  content_data: {
    priority: 'low' | 'medium' | 'high';
    expires_at?: string;
    show_on_homepage: boolean;
  };
  created_at: string;
}

export const Announcements = memo(() => {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'announcement')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validAnnouncements = (data || []).filter((announcement: any) => {
        const contentData = announcement.content_data || {};
        
        // Only show announcements marked for homepage
        if (!contentData.show_on_homepage) return false;
        
        // Check if announcement has expired
        if (contentData.expires_at) {
          const expiryDate = new Date(contentData.expires_at);
          if (expiryDate < new Date()) return false;
        }
        
        return true;
      });

      setAnnouncements(validAnnouncements as any);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, [fetchAnnouncements]);

  const handleDismiss = useCallback((announcementId: string) => {
    const newDismissedIds = [...dismissedIds, announcementId];
    setDismissedIds(newDismissedIds);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissedIds));
  }, [dismissedIds]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.includes(announcement.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Important Announcements</h2>
          </div>
          <p className="text-lg text-gray-600">
            Stay updated with the latest news and information from our church community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="relative bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                    <Badge className={getPriorityColor(announcement.content_data.priority)}>
                      {announcement.content_data.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {announcement.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {announcement.description}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </div>
                  
                  {announcement.content_data.expires_at && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Expires {new Date(announcement.content_data.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

Announcements.displayName = 'Announcements';