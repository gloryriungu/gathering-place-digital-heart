import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Monitor, Save, Upload } from "lucide-react";

interface HeroContentData {
  id: string;
  title: string;
  description: string;
  content_data: any;
  status: string;
}

export const HeroContentManager = () => {
  const [heroContent, setHeroContent] = useState<HeroContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    heading: "",
    subheading: "",
    background_video: "",
    background_image: "",
    cta_primary: "JOIN US THIS SUNDAY",
    cta_secondary: "WATCH LIVE",
    backgroundFile: null as File | null,
  });

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from("media_content")
        .select("*")
        .eq("content_type", "hero_content")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setHeroContent(data);
        const contentData = data.content_data as any;
        setFormData({
          heading: contentData?.heading || "",
          subheading: contentData?.subheading || "",
          background_video: contentData?.background_video || "",
          background_image: contentData?.background_image || "",
          cta_primary: contentData?.cta_primary || "JOIN US THIS SUNDAY",
          cta_secondary: contentData?.cta_secondary || "WATCH LIVE",
          backgroundFile: null,
        });
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-bg-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("hero-media").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("hero-media").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("You must be logged in to save changes");
        return;
      }

      let backgroundUrl = formData.background_image;

      if (formData.backgroundFile) {
        const uploadedUrl = await handleFileUpload(formData.backgroundFile);
        if (uploadedUrl) {
          backgroundUrl = uploadedUrl;
        }
      }

      const contentData = {
        heading: formData.heading,
        subheading: formData.subheading,
        background_video: formData.background_video,
        background_image: backgroundUrl,
        cta_primary: formData.cta_primary,
        cta_secondary: formData.cta_secondary,
      };

      if (heroContent) {
        // Update existing
        const { error } = await supabase
          .from("media_content")
          .update({
            title: "Homepage Hero Content",
            description: "Main homepage hero section content",
            content_data: contentData,
            status: "published",
          })
          .eq("id", heroContent.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("media_content").insert({
          content_type: "hero_content",
          title: "Homepage Hero Content",
          description: "Main homepage hero section content",
          content_data: contentData,
          status: "published",
          created_by: user.data.user.id,
        });

        if (error) throw error;
      }

      toast.success("Hero content saved successfully");
      await fetchHeroContent();
    } catch (error) {
      console.error("Error saving hero content:", error);
      toast.error("Failed to save hero content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Homepage Hero Manager
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
          <div className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            <div>
              <CardTitle>Homepage Hero Manager</CardTitle>
              <CardDescription>Manage the main hero section content and media</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="heading">Main Heading</Label>
                <Input
                  id="heading"
                  value={formData.heading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                  placeholder="WELCOME TO TOT INTERNATIONAL"
                />
              </div>

              <div>
                <Label htmlFor="subheading">Subheading</Label>
                <Textarea
                  id="subheading"
                  value={formData.subheading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subheading: e.target.value }))}
                  placeholder="A ministry committed to raising champions for Christ..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cta_primary">Primary Button Text</Label>
                <Input
                  id="cta_primary"
                  value={formData.cta_primary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cta_primary: e.target.value }))}
                  placeholder="JOIN US THIS SUNDAY"
                />
              </div>

              <div>
                <Label htmlFor="cta_secondary">Secondary Button Text</Label>
                <Input
                  id="cta_secondary"
                  value={formData.cta_secondary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cta_secondary: e.target.value }))}
                  placeholder="WATCH LIVE"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="background_video">Background Video URL</Label>
                <Input
                  id="background_video"
                  value={formData.background_video}
                  onChange={(e) => setFormData((prev) => ({ ...prev, background_video: e.target.value }))}
                  placeholder="https://commondatastorage.googleapis.com/..."
                />
              </div>

              <div>
                <Label htmlFor="background_image">Background Image URL</Label>
                <Input
                  id="background_image"
                  value={formData.background_image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, background_image: e.target.value }))}
                  placeholder="Fallback image URL"
                />
              </div>

              <div>
                <Label htmlFor="backgroundFile">Upload New Background</Label>
                <div className="mt-2">
                  <Input
                    id="backgroundFile"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundFile: e.target.files?.[0] || null,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports images and videos. For best performance, use MP4 for videos.
                  </p>
                </div>
              </div>

              {(formData.background_image || formData.background_video) && (
                <div>
                  <Label>Current Background Preview</Label>
                  <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden">
                    {formData.background_video ? (
                      <video
                        src={formData.background_video}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                      />
                    ) : formData.background_image ? (
                      <img
                        src={formData.background_image}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-gray-50">
            <h4 className="font-semibold mb-4">Live Preview</h4>
            <div className="relative aspect-video bg-gradient-to-b from-purple-600/60 via-purple-600/40 to-purple-600/80 rounded-lg overflow-hidden text-white">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <h1 className="text-2xl md:text-4xl font-black mb-2">
                    {formData.heading || "WELCOME TO TOT INTERNATIONAL"}
                  </h1>
                  <p className="text-sm md:text-lg mb-4 text-purple-100">
                    {formData.subheading || "A ministry committed to raising champions for Christ"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button size="sm" className="bg-white text-black">
                      {formData.cta_primary || "JOIN US THIS SUNDAY"}
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white text-black">
                      {formData.cta_secondary || "WATCH LIVE"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={fetchHeroContent}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? (
                "Saving..."
              ) : uploading ? (
                "Uploading..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
