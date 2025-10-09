import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Play, Square, Settings, ExternalLink, Calendar } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/utils/youtube";

interface LiveStreamData {
  id: string;
  title: string;
  description: string;
  content_data: {
    youtube_url: string;
    is_live: boolean;
    scheduled_time: string;
    duration: string;
  };
  status: string;
}

export const LiveStreamManager = () => {
  const [liveStream, setLiveStream] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    is_live: false,
    scheduled_time: "",
    duration: "120"
  });

  useEffect(() => {
    fetchLiveStreamData();
  }, []);

  const fetchLiveStreamData = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'live_stream')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setLiveStream(data as any);
        const contentData = data.content_data as any;
        setFormData({
          title: data.title,
          description: data.description || "",
          youtube_url: contentData?.youtube_url || "",
          is_live: contentData?.is_live || false,
          scheduled_time: contentData?.scheduled_time || "",
          duration: contentData?.duration || "120"
        });
      }
    } catch (error) {
      console.error('Error fetching live stream data:', error);
      toast.error('Failed to load live stream settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('You must be logged in to save changes');
        return;
      }

      const contentData = {
        youtube_url: formData.youtube_url,
        is_live: formData.is_live,
        scheduled_time: formData.scheduled_time,
        duration: formData.duration
      };

      if (liveStream) {
        // Update existing
        const { error } = await supabase
          .from('media_content')
          .update({
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            status: 'published'
          })
          .eq('id', liveStream.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('media_content')
          .insert({
            content_type: 'live_stream',
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            status: 'published',
            created_by: user.data.user.id
          });

        if (error) throw error;
      }

      toast.success('Live stream settings saved successfully');
      await fetchLiveStreamData();
    } catch (error) {
      console.error('Error saving live stream data:', error);
      toast.error('Failed to save live stream settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleLiveStatus = async () => {
    if (!liveStream) return;

    try {
      const newStatus = !formData.is_live;
      setFormData(prev => ({ ...prev, is_live: newStatus }));

      const contentData = {
        ...liveStream.content_data,
        is_live: newStatus
      };

      const { error } = await supabase
        .from('media_content')
        .update({
          content_data: contentData
        })
        .eq('id', liveStream.id);

      if (error) throw error;

      toast.success(newStatus ? 'Live stream activated' : 'Live stream deactivated');
    } catch (error) {
      console.error('Error toggling live status:', error);
      toast.error('Failed to update live status');
      // Revert the change
      setFormData(prev => ({ ...prev, is_live: !prev.is_live }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            Live Stream Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              <div>
                <CardTitle>Live Stream Manager</CardTitle>
                <CardDescription>Manage YouTube live streams and broadcasting</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={formData.is_live ? "default" : "secondary"}>
                {formData.is_live ? (
                  <>
                    <Play className="mr-1 h-3 w-3" />
                    LIVE
                  </>
                ) : (
                  <>
                    <Square className="mr-1 h-3 w-3" />
                    OFFLINE
                  </>
                )}
              </Badge>
              <Switch
                checked={formData.is_live}
                onCheckedChange={toggleLiveStatus}
                disabled={!liveStream}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter stream title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter stream description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube Stream URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {formData.youtube_url && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(formData.youtube_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduled_time">Scheduled Time</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="120"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open('https://studio.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw/livestreaming', '_blank')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Open YouTube Studio
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open('https://www.youtube.com/live_dashboard', '_blank')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Stream
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {formData.youtube_url && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Stream Preview</h4>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                {getYouTubeEmbedUrl(formData.youtube_url) ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(formData.youtube_url) || ''}
                    title="Stream Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                ) : (
                  <div className="text-white text-center">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Invalid YouTube URL</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={fetchLiveStreamData}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};