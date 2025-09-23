import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, FileText, AlertCircle } from "lucide-react";

interface AboutContent {
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_content: string;
  vision_text: string;
  mission_text: string;
  beliefs: Array<{ title: string; content: string }>;
  leadership: Array<{ name: string; position: string; image_url?: string }>;
}

export const AboutUsManager = () => {
  const [content, setContent] = useState<AboutContent>({
    hero_title: "ABOUT TOT INTERNATIONAL",
    hero_subtitle: "A ministry committed to raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.",
    story_title: "Our Story",
    story_content: "TOT International was founded with a divine vision to raise champions for Christ who will transform nations through the power of God's Word...",
    vision_text: "To raise champions for Christ who will transform nations through the power of God's Word and the demonstration of His love.",
    mission_text: "To provide sound biblical teaching, authentic worship, and transformational encounters with God that equip believers for victorious living and effective ministry.",
    beliefs: [
      { title: "The Authority of Scripture", content: "We believe the Bible is the inspired, infallible, and authoritative Word of God..." },
      { title: "Salvation by Grace", content: "We believe salvation is a gift from God through faith in Jesus Christ..." },
      { title: "The Power of the Holy Spirit", content: "We believe in the baptism of the Holy Spirit and the operation of spiritual gifts..." }
    ],
    leadership: [
      { name: "Pastor Timothy Kitui", position: "Senior Pastor & Founder" },
      { name: "Associate Pastor", position: "Teaching & Discipleship" },
      { name: "Worship Pastor", position: "Music & Creative Arts" }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'about')
        .eq('is_published', true);

      if (data && data.length > 0) {
        // Reconstruct content from database entries
        const contentMap: any = {};
        data.forEach(item => {
          contentMap[item.section_name] = item.content;
        });
        
        if (Object.keys(contentMap).length > 0) {
          setContent(prev => ({ ...prev, ...contentMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
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
        { section_name: 'story_title', content: content.story_title, content_type: 'text' },
        { section_name: 'story_content', content: content.story_content, content_type: 'text' },
        { section_name: 'vision_text', content: content.vision_text, content_type: 'text' },
        { section_name: 'mission_text', content: content.mission_text, content_type: 'text' },
        { section_name: 'beliefs', content: JSON.stringify(content.beliefs), content_type: 'json' },
        { section_name: 'leadership', content: JSON.stringify(content.leadership), content_type: 'json' }
      ];

      for (const section of sections) {
        await supabase
          .from('page_content')
          .upsert({
            page_name: 'about',
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
        description: "About Us content updated successfully",
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
            <FileText className="h-6 w-6" />
            About Us Content Management
          </h2>
          <p className="text-muted-foreground">
            Update the church's story, beliefs, leadership, and mission information
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
          Changes made here will be reflected on the public About Us page immediately after saving.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main title and subtitle displayed at the top of the About page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={content.hero_title}
                onChange={(e) => setContent(prev => ({ ...prev, hero_title: e.target.value }))}
                placeholder="Main title for the about page"
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={content.hero_subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                placeholder="Subtitle description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Story Section */}
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
            <CardDescription>Church history and background information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="story_title">Story Section Title</Label>
              <Input
                id="story_title"
                value={content.story_title}
                onChange={(e) => setContent(prev => ({ ...prev, story_title: e.target.value }))}
                placeholder="Title for the story section"
              />
            </div>
            <div>
              <Label htmlFor="story_content">Story Content</Label>
              <Textarea
                id="story_content"
                value={content.story_content}
                onChange={(e) => setContent(prev => ({ ...prev, story_content: e.target.value }))}
                placeholder="Tell your church's story..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vision & Mission */}
        <Card>
          <CardHeader>
            <CardTitle>Vision & Mission</CardTitle>
            <CardDescription>Church vision and mission statements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vision_text">Vision Statement</Label>
              <Textarea
                id="vision_text"
                value={content.vision_text}
                onChange={(e) => setContent(prev => ({ ...prev, vision_text: e.target.value }))}
                placeholder="Your church's vision..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="mission_text">Mission Statement</Label>
              <Textarea
                id="mission_text"
                value={content.mission_text}
                onChange={(e) => setContent(prev => ({ ...prev, mission_text: e.target.value }))}
                placeholder="Your church's mission..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};