import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Camera, AlertCircle } from "lucide-react";

interface FilmingNoticeContent {
  hero_title: string;
  hero_subtitle: string;
  main_notice: string;
  recording_practices: Array<{ title: string; items: string[] }>;
  privacy_info: Array<{ title: string; items: string[] }>;
  camera_free_zones: Array<{ title: string; items: string[] }>;
  contact_info: {
    media_email: string;
    office_phone: string;
    privacy_email: string;
  };
}

export const NoticeFilmingManager = () => {
  const [content, setContent] = useState<FilmingNoticeContent>({
    hero_title: "Notice of Filming",
    hero_subtitle: "Important information about recording and live streaming during our services and events",
    main_notice: "By entering our church premises, you acknowledge and consent to being recorded, photographed, or livestreamed during services and events.",
    recording_practices: [
      {
        title: "Regular Services",
        items: [
          "Sunday morning worship services (all three services)",
          "Special events and holiday services",
          "Guest speaker presentations",
          "Baptisms and dedication ceremonies"
        ]
      },
      {
        title: "Live Streaming",
        items: [
          "Services are broadcast live on our website and social media",
          "Recordings are made available for later viewing",
          "Interactive features may include chat and prayer requests"
        ]
      }
    ],
    privacy_info: [
      {
        title: "Privacy Protections",
        items: [
          "Camera angles focus primarily on the stage and altar area",
          "Congregation seating is generally not in close-up view",
          "Children's ministry areas have additional protections",
          "Personal information is never disclosed without consent"
        ]
      }
    ],
    camera_free_zones: [
      {
        title: "Protected Areas",
        items: [
          "Prayer counseling rooms",
          "Nursery and childcare areas",
          "Private meeting rooms",
          "Restroom facilities",
          "Staff offices and work areas"
        ]
      }
    ],
    contact_info: {
      media_email: "media@tentoftestimony.org",
      office_phone: "(555) 123-4567",
      privacy_email: "privacy@tentoftestimony.org"
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFilmingContent();
  }, []);

  const fetchFilmingContent = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'notice_filming')
        .eq('is_published', true);

      if (data && data.length > 0) {
        // Reconstruct content from database entries
        const contentMap: any = {};
        data.forEach(item => {
          if (item.content_type === 'json') {
            contentMap[item.section_name] = JSON.parse(item.content);
          } else {
            contentMap[item.section_name] = item.content;
          }
        });
        
        if (Object.keys(contentMap).length > 0) {
          setContent(prev => ({ ...prev, ...contentMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching filming notice content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      // Save each section as a separate record
      const sections = [
        { section_name: 'hero_title', content: content.hero_title, content_type: 'text' },
        { section_name: 'hero_subtitle', content: content.hero_subtitle, content_type: 'text' },
        { section_name: 'main_notice', content: content.main_notice, content_type: 'text' },
        { section_name: 'recording_practices', content: JSON.stringify(content.recording_practices), content_type: 'json' },
        { section_name: 'privacy_info', content: JSON.stringify(content.privacy_info), content_type: 'json' },
        { section_name: 'camera_free_zones', content: JSON.stringify(content.camera_free_zones), content_type: 'json' },
        { section_name: 'contact_info', content: JSON.stringify(content.contact_info), content_type: 'json' }
      ];

      for (const section of sections) {
        await supabase
          .from('page_content')
          .upsert({
            page_name: 'notice_filming',
            section_name: section.section_name,
            content_type: section.content_type,
            content: section.content,
            is_published: true
          }, {
            onConflict: 'page_name,section_name'
          });
      }

      toast({
        title: "Success",
        description: "Notice of Filming content updated successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Notice of Filming Management
          </h2>
          <p className="text-muted-foreground">
            Update filming policies and privacy notices for church services
          </p>
        </div>
        <Button onClick={saveContent} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes made here will be reflected on the public Notice of Filming page immediately after saving. Ensure all contact information is current.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Page Header</CardTitle>
            <CardDescription>Main title and description for the Notice of Filming page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title">Page Title</Label>
              <Input
                id="hero_title"
                value={content.hero_title}
                onChange={(e) => setContent(prev => ({ ...prev, hero_title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle">Page Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={content.hero_subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Main Notice</CardTitle>
            <CardDescription>Primary consent notice displayed prominently on the page</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.main_notice}
              onChange={(e) => setContent(prev => ({ ...prev, main_notice: e.target.value }))}
              rows={3}
              placeholder="Main consent notice for filming and recording..."
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Contact details for filming and privacy inquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="media_email">Media Team Email</Label>
              <Input
                id="media_email"
                type="email"
                value={content.contact_info.media_email}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, media_email: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="office_phone">Church Office Phone</Label>
              <Input
                id="office_phone"
                value={content.contact_info.office_phone}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, office_phone: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="privacy_email">Privacy Officer Email</Label>
              <Input
                id="privacy_email"
                type="email"
                value={content.contact_info.privacy_email}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, privacy_email: e.target.value }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> The detailed sections about recording practices, privacy protections, and camera-free zones can be customized by editing the page content directly. Contact your IT administrator for advanced customizations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};