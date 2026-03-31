import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Save, RefreshCw, Upload, X } from "lucide-react";

interface WatchPageData {
  id?: string;
  title: string;
  description: string;
  content_data: {
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
  };
  status: string;
}

export const WatchPageManager = () => {
  const [watchData, setWatchData] = useState<WatchPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hero_title: "WATCH ONLINE",
    hero_subtitle: "Experience the presence of God from anywhere in the world. Join our live services and be transformed by God's Word.",
    hero_button_text: "WATCH NOW",
    hero_button_url: "",
    hero_poster_url: "",
    live_service_title: "Worship With Us Live",
    live_service_description: "Every Sunday at 9:00 AM & 11:00 AM EAT - Experience powerful worship, life-changing messages, and the presence of God.",
    service_times: "Sundays: 9:00 AM & 11:00 AM EAT\nWednesday: 7:00 PM Bible Study",
    sermons: [] as Array<{
      title: string;
      date: string;
      duration: string;
      description: string;
      video_url?: string;
    }>
  });
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWatchPageData();
  }, []);

  const fetchWatchPageData = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'watch_page')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const watchContent = data[0] as any;
        setWatchData(watchContent);
        setFormData({
          hero_title: watchContent.content_data.hero_title || formData.hero_title,
          hero_subtitle: watchContent.content_data.hero_subtitle || formData.hero_subtitle,
          hero_button_text: watchContent.content_data.hero_button_text || formData.hero_button_text,
          hero_button_url: watchContent.content_data.hero_button_url || "",
          hero_poster_url: watchContent.content_data.hero_poster_url || "",
          live_service_title: watchContent.content_data.live_service_title || formData.live_service_title,
          live_service_description: watchContent.content_data.live_service_description || formData.live_service_description,
          service_times: watchContent.content_data.service_times || formData.service_times,
          sermons: watchContent.content_data.sermons || []
        });
      }
    } catch (error) {
      console.error('Error fetching watch page data:', error);
      toast.error('Failed to load watch page data');
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
        hero_title: formData.hero_title,
        hero_subtitle: formData.hero_subtitle,
        hero_button_text: formData.hero_button_text,
        hero_button_url: formData.hero_button_url,
        hero_poster_url: formData.hero_poster_url,
        live_service_title: formData.live_service_title,
        live_service_description: formData.live_service_description,
        service_times: formData.service_times,
        sermons: formData.sermons
      };

      if (watchData?.id) {
        // Update existing content
        const { error } = await supabase
          .from('media_content')
          .update({
            content_data: contentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', watchData.id);

        if (error) throw error;
        toast.success('Watch page updated successfully');
      } else {
        // Create new content
        const { error } = await supabase
          .from('media_content')
          .insert({
            content_type: 'watch_page',
            title: 'Watch Page Content',
            description: 'Content for the Watch Online page',
            content_data: contentData,
            status: 'published',
            created_by: user.data.user.id
          });

        if (error) throw error;
        toast.success('Watch page content created successfully');
      }

      await fetchWatchPageData();
    } catch (error) {
      console.error('Error saving watch page:', error);
      toast.error('Failed to save watch page');
    } finally {
      setSaving(false);
    }
  };

  const addSermon = () => {
    setFormData(prev => ({
      ...prev,
      sermons: [{
        title: "",
        date: "",
        duration: "",
        description: "",
        video_url: ""
      }, ...prev.sermons]
    }));
  };

  const updateSermon = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sermons: prev.sermons.map((sermon, i) => 
        i === index ? { ...sermon, [field]: value } : sermon
      )
    }));
  };

  const removeSermon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sermons: prev.sermons.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse bg-gray-200 h-4 w-full rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle>Watch Page Manager</CardTitle>
                <CardDescription>Manage content for the Watch Online page</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWatchPageData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hero Section</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  value={formData.hero_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_title: e.target.value }))}
                  placeholder="Main title for the watch page"
                />
              </div>
              <div>
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  placeholder="Subtitle description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero_button_text">Button Text</Label>
                  <Input
                    id="hero_button_text"
                    value={formData.hero_button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_button_text: e.target.value }))}
                    placeholder="e.g., WATCH NOW"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_button_url">Button URL</Label>
                  <Input
                    id="hero_button_url"
                    value={formData.hero_button_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_button_url: e.target.value }))}
                    placeholder="https://example.com or leave empty"
                  />
                </div>
              </div>
              <div>
                <Label>Background Poster</Label>
                <p className="text-sm text-muted-foreground mb-2">Upload a background image so users know what the link leads to.</p>
                {formData.hero_poster_url ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={formData.hero_poster_url} alt="Hero poster" className="w-full h-48 object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setFormData(prev => ({ ...prev, hero_poster_url: "" }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploadingPoster ? "Uploading..." : "Click to upload a poster image"}
                    </p>
                  </div>
                )}
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingPoster(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const filePath = `watch-hero-${Date.now()}.${fileExt}`;
                      const { error: uploadError } = await supabase.storage
                        .from('hero-media')
                        .upload(filePath, file);
                      if (uploadError) throw uploadError;
                      const { data: urlData } = supabase.storage
                        .from('hero-media')
                        .getPublicUrl(filePath);
                      setFormData(prev => ({ ...prev, hero_poster_url: urlData.publicUrl }));
                      toast.success('Poster uploaded');
                    } catch (err) {
                      console.error(err);
                      toast.error('Failed to upload poster');
                    } finally {
                      setUploadingPoster(false);
                      if (posterInputRef.current) posterInputRef.current.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Service Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Service Section</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="live_service_title">Live Service Title</Label>
                <Input
                  id="live_service_title"
                  value={formData.live_service_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, live_service_title: e.target.value }))}
                  placeholder="Title for live service section"
                />
              </div>
              <div>
                <Label htmlFor="live_service_description">Live Service Description</Label>
                <Textarea
                  id="live_service_description"
                  value={formData.live_service_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, live_service_description: e.target.value }))}
                  placeholder="Description for live service"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="service_times">Service Times</Label>
                <Textarea
                  id="service_times"
                  value={formData.service_times}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_times: e.target.value }))}
                  placeholder="Service times information"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Sermons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Sermons</h3>
              <div className="flex items-center gap-2">
                <Button onClick={addSermon} size="sm">
                  Add Sermon
                </Button>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            
            {formData.sermons.map((sermon, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sermon {formData.sermons.length - index}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeSermon(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={sermon.title}
                        onChange={(e) => updateSermon(index, 'title', e.target.value)}
                        placeholder="Sermon title"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        value={sermon.date}
                        onChange={(e) => updateSermon(index, 'date', e.target.value)}
                        placeholder="e.g., January 21, 2024"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={sermon.duration}
                        onChange={(e) => updateSermon(index, 'duration', e.target.value)}
                        placeholder="e.g., 52 min"
                      />
                    </div>
                    <div>
                      <Label>Video URL</Label>
                      <Input
                        value={sermon.video_url || ''}
                        onChange={(e) => updateSermon(index, 'video_url', e.target.value)}
                        placeholder="YouTube or video URL"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={sermon.description}
                      onChange={(e) => updateSermon(index, 'description', e.target.value)}
                      placeholder="Sermon description"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};