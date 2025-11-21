import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PageContent {
  id: string;
  section_name: string;
  content: string;
  content_type: string;
  is_published: boolean;
}

export const GivePageManager = () => {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'give')
        .order('section_name');

      if (error) throw error;

      setContents(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load page content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (content: PageContent) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .update({
          content: content.content,
          is_published: content.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully"
      });

      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('page_content')
        .insert({
          page_name: 'give',
          section_name: 'new_section',
          content: 'New content here...',
          content_type: 'text',
          is_published: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New section created"
      });

      loadContent();
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section deleted successfully"
      });

      loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  const updateLocalContent = (id: string, field: keyof PageContent, value: any) => {
    setContents(contents.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sections = {
    hero: contents.filter(c => c.section_name.startsWith('hero_')),
    impact: contents.filter(c => c.section_name.startsWith('impact_')),
    types: contents.filter(c => c.section_name.startsWith('type_')),
    howItWorks: contents.filter(c => c.section_name.startsWith('how_')),
    testimonials: contents.filter(c => c.section_name.startsWith('testimonial_')),
    scripture: contents.filter(c => c.section_name.startsWith('scripture_')),
    faq: contents.filter(c => c.section_name.startsWith('faq_')),
    footer: contents.filter(c => c.section_name.startsWith('footer_')),
  };

  const renderContentCard = (content: PageContent) => (
    <Card key={content.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <Input
              value={content.section_name}
              onChange={(e) => updateLocalContent(content.id, 'section_name', e.target.value)}
              className="font-semibold"
            />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={content.is_published}
              onCheckedChange={(checked) => updateLocalContent(content.id, 'is_published', checked)}
            />
            <Label>Published</Label>
          </div>
        </div>
        <CardDescription>Content Type: {content.content_type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={content.content}
          onChange={(e) => updateLocalContent(content.id, 'content', e.target.value)}
          rows={6}
          className="font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(content)}
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
          <Button
            onClick={() => handleDelete(content.id)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Give Page Content Manager</CardTitle>
            <CardDescription>
              Edit all content sections for the Give page
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hero">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="how">How It Works</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="scripture">Scripture</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-4">
            <h3 className="text-lg font-semibold">Hero Section</h3>
            {sections.hero.length > 0 ? (
              sections.hero.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No hero content found. Add sections with names starting with "hero_"</p>
            )}
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <h3 className="text-lg font-semibold">Impact Allocation</h3>
            {sections.impact.length > 0 ? (
              sections.impact.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No impact content found. Add sections with names starting with "impact_"</p>
            )}
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <h3 className="text-lg font-semibold">Contribution Types</h3>
            {sections.types.length > 0 ? (
              sections.types.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No contribution type content found. Add sections with names starting with "type_"</p>
            )}
          </TabsContent>

          <TabsContent value="how" className="space-y-4">
            <h3 className="text-lg font-semibold">How It Works</h3>
            {sections.howItWorks.length > 0 ? (
              sections.howItWorks.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No how it works content found. Add sections with names starting with "how_"</p>
            )}
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            <h3 className="text-lg font-semibold">Testimonials</h3>
            {sections.testimonials.length > 0 ? (
              sections.testimonials.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No testimonial content found. Add sections with names starting with "testimonial_"</p>
            )}
          </TabsContent>

          <TabsContent value="scripture" className="space-y-4">
            <h3 className="text-lg font-semibold">Scripture Section</h3>
            {sections.scripture.length > 0 ? (
              sections.scripture.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No scripture content found. Add sections with names starting with "scripture_"</p>
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <h3 className="text-lg font-semibold">FAQ Section</h3>
            {sections.faq.length > 0 ? (
              sections.faq.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No FAQ content found. Add sections with names starting with "faq_"</p>
            )}
          </TabsContent>

          <TabsContent value="footer" className="space-y-4">
            <h3 className="text-lg font-semibold">Footer CTA</h3>
            {sections.footer.length > 0 ? (
              sections.footer.map(renderContentCard)
            ) : (
              <p className="text-muted-foreground">No footer content found. Add sections with names starting with "footer_"</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
