import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Image as ImageIcon, Quote } from "lucide-react";

interface PageContent {
  id: string;
  section_name: string;
  content: string;
  is_published: boolean;
}

export const CounselingPageManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Hero Section
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroPublished, setHeroPublished] = useState(true);

  // About Section
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [aboutPublished, setAboutPublished] = useState(true);

  // Services Section
  const [servicesTitle, setServicesTitle] = useState("");
  const [servicesDescription, setServicesDescription] = useState("");
  const [servicesPublished, setServicesPublished] = useState(true);

  // Quote Section
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [quotePublished, setQuotePublished] = useState(true);

  // CTA Section
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [ctaPublished, setCtaPublished] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'counseling');

      if (error) throw error;

      data?.forEach((item: PageContent) => {
        const content = JSON.parse(item.content);
        
        switch (item.section_name) {
          case 'hero':
            setHeroTitle(content.title || "");
            setHeroSubtitle(content.subtitle || "");
            setHeroImage(content.image || "");
            setHeroPublished(item.is_published);
            break;
          case 'about':
            setAboutTitle(content.title || "");
            setAboutDescription(content.description || "");
            setAboutPublished(item.is_published);
            break;
          case 'services':
            setServicesTitle(content.title || "");
            setServicesDescription(content.description || "");
            setServicesPublished(item.is_published);
            break;
          case 'quote':
            setQuoteText(content.text || "");
            setQuoteAuthor(content.author || "");
            setQuotePublished(item.is_published);
            break;
          case 'cta':
            setCtaTitle(content.title || "");
            setCtaDescription(content.description || "");
            setCtaButtonText(content.buttonText || "");
            setCtaPublished(item.is_published);
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (
    sectionName: string,
    content: any,
    isPublished: boolean
  ) => {
    try {
      setSaving(true);

      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_name', 'counseling')
        .eq('section_name', sectionName)
        .maybeSingle();

      const payload = {
        page_name: 'counseling',
        section_name: sectionName,
        content_type: 'json',
        content: JSON.stringify(content),
        is_published: isPublished,
      };

      if (existing) {
        const { error } = await supabase
          .from('page_content')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: "Content Saved",
        description: `${sectionName} section updated successfully`,
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

  const handleSaveHero = () => {
    saveSection('hero', {
      title: heroTitle,
      subtitle: heroSubtitle,
      image: heroImage,
    }, heroPublished);
  };

  const handleSaveAbout = () => {
    saveSection('about', {
      title: aboutTitle,
      description: aboutDescription,
    }, aboutPublished);
  };

  const handleSaveServices = () => {
    saveSection('services', {
      title: servicesTitle,
      description: servicesDescription,
    }, servicesPublished);
  };

  const handleSaveQuote = () => {
    saveSection('quote', {
      text: quoteText,
      author: quoteAuthor,
    }, quotePublished);
  };

  const handleSaveCTA = () => {
    saveSection('cta', {
      title: ctaTitle,
      description: ctaDescription,
      buttonText: ctaButtonText,
    }, ctaPublished);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Counseling Page Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Counseling & Mental Health Page Manager</CardTitle>
        </div>
        <CardDescription>
          Manage all content sections on the Counseling & Mental Health page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="cta">CTA</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hero Section</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="hero-published">Published</Label>
                <Switch
                  id="hero-published"
                  checked={heroPublished}
                  onCheckedChange={setHeroPublished}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Main headline for the hero section"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Subtitle</Label>
                <Textarea
                  placeholder="Supporting text that appears below the title"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label>Hero Image URL</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button onClick={handleSaveHero} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Hero Section
              </Button>
            </div>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">About Section</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="about-published">Published</Label>
                <Switch
                  id="about-published"
                  checked={aboutPublished}
                  onCheckedChange={setAboutPublished}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  placeholder="About our counseling services"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Detailed information about counseling services"
                  value={aboutDescription}
                  onChange={(e) => setAboutDescription(e.target.value)}
                  className="mt-2"
                  rows={6}
                />
              </div>

              <Button onClick={handleSaveAbout} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save About Section
              </Button>
            </div>
          </TabsContent>

          {/* Services Section */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Services Section</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="services-published">Published</Label>
                <Switch
                  id="services-published"
                  checked={servicesPublished}
                  onCheckedChange={setServicesPublished}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  placeholder="Our Counseling Services"
                  value={servicesTitle}
                  onChange={(e) => setServicesTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Overview of available services"
                  value={servicesDescription}
                  onChange={(e) => setServicesDescription(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveServices} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Services Section
              </Button>
            </div>
          </TabsContent>

          {/* Quote Section */}
          <TabsContent value="quote" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Inspirational Quote</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="quote-published">Published</Label>
                <Switch
                  id="quote-published"
                  checked={quotePublished}
                  onCheckedChange={setQuotePublished}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Quote Text</Label>
                <Textarea
                  placeholder="Enter an inspirational or biblical quote"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>Author / Reference</Label>
                <Input
                  placeholder="e.g., Psalm 34:18, Pastor John Smith"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button onClick={handleSaveQuote} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Quote Section
              </Button>
            </div>
          </TabsContent>

          {/* CTA Section */}
          <TabsContent value="cta" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Call-to-Action Section</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="cta-published">Published</Label>
                <Switch
                  id="cta-published"
                  checked={ctaPublished}
                  onCheckedChange={setCtaPublished}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>CTA Title</Label>
                <Input
                  placeholder="Ready to take the next step?"
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Encouraging message to book a session"
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label>Button Text</Label>
                <Input
                  placeholder="Book a Session"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button onClick={handleSaveCTA} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save CTA Section
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
