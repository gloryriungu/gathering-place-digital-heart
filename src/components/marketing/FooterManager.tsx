import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ServiceTime {
  day: string;
  times: string[];
}

interface FooterContent {
  church_name: string;
  church_description: string;
  phone: string;
  email: string;
  location: string;
  service_times: ServiceTime[];
  privacy_policy_url: string;
  terms_url: string;
  contact_url: string;
  copyright_text: string;
}

const DEFAULTS: FooterContent = {
  church_name: "TOT INTERNATIONAL",
  church_description: "Raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.",
  phone: "+254 700 000 000",
  email: "info@tot.co.ke",
  location: "Nairobi, Kenya\nEast Africa",
  service_times: [
    { day: "SUNDAY", times: ["9:00 AM - First Service", "11:00 AM - Second Service"] },
    { day: "WEDNESDAY", times: ["7:00 PM - Bible Study"] },
    { day: "FRIDAY", times: ["7:00 PM - Prayer Night"] },
  ],
  privacy_policy_url: "#",
  terms_url: "#",
  contact_url: "#",
  copyright_text: "© 2025 TOT International. All rights reserved.",
};

export const FooterManager = () => {
  const [content, setContent] = useState<FooterContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("section_name, content")
        .eq("page_name", "footer");

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Partial<FooterContent> = {};
        data.forEach((row) => {
          const key = row.section_name as keyof FooterContent;
          if (key === "service_times") {
            try {
              mapped[key] = JSON.parse(row.content);
            } catch {
              mapped[key] = DEFAULTS.service_times;
            }
          } else if (key in DEFAULTS) {
            (mapped as any)[key] = row.content;
          }
        });
        setContent({ ...DEFAULTS, ...mapped });
      }
    } catch (err) {
      console.error("Error fetching footer content:", err);
      toast.error("Failed to load footer content");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const entries: { section_name: string; content: string; content_type: string }[] = [
        { section_name: "church_name", content: content.church_name, content_type: "text" },
        { section_name: "church_description", content: content.church_description, content_type: "text" },
        { section_name: "phone", content: content.phone, content_type: "text" },
        { section_name: "email", content: content.email, content_type: "text" },
        { section_name: "location", content: content.location, content_type: "text" },
        { section_name: "service_times", content: JSON.stringify(content.service_times), content_type: "json" },
        { section_name: "privacy_policy_url", content: content.privacy_policy_url, content_type: "text" },
        { section_name: "terms_url", content: content.terms_url, content_type: "text" },
        { section_name: "contact_url", content: content.contact_url, content_type: "text" },
        { section_name: "copyright_text", content: content.copyright_text, content_type: "text" },
      ];

      for (const entry of entries) {
        const { error } = await supabase
          .from("page_content")
          .update({ content: entry.content, content_type: entry.content_type })
          .eq("page_name", "footer")
          .eq("section_name", entry.section_name);

        if (error) throw error;
      }

      toast.success("Footer content saved successfully");
    } catch (err) {
      console.error("Error saving footer content:", err);
      toast.error("Failed to save footer content");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof FooterContent, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const addServiceDay = () => {
    setContent((prev) => ({
      ...prev,
      service_times: [...prev.service_times, { day: "", times: [""] }],
    }));
  };

  const removeServiceDay = (index: number) => {
    setContent((prev) => ({
      ...prev,
      service_times: prev.service_times.filter((_, i) => i !== index),
    }));
  };

  const updateServiceDay = (index: number, day: string) => {
    setContent((prev) => {
      const updated = [...prev.service_times];
      updated[index] = { ...updated[index], day };
      return { ...prev, service_times: updated };
    });
  };

  const addServiceTime = (dayIndex: number) => {
    setContent((prev) => {
      const updated = [...prev.service_times];
      updated[dayIndex] = { ...updated[dayIndex], times: [...updated[dayIndex].times, ""] };
      return { ...prev, service_times: updated };
    });
  };

  const removeServiceTime = (dayIndex: number, timeIndex: number) => {
    setContent((prev) => {
      const updated = [...prev.service_times];
      updated[dayIndex] = {
        ...updated[dayIndex],
        times: updated[dayIndex].times.filter((_, i) => i !== timeIndex),
      };
      return { ...prev, service_times: updated };
    });
  };

  const updateServiceTime = (dayIndex: number, timeIndex: number, value: string) => {
    setContent((prev) => {
      const updated = [...prev.service_times];
      const times = [...updated[dayIndex].times];
      times[timeIndex] = value;
      updated[dayIndex] = { ...updated[dayIndex], times };
      return { ...prev, service_times: updated };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Footer Content Manager</h2>
          <p className="text-muted-foreground">Edit the footer content displayed on every page</p>
        </div>
        <Button onClick={saveContent} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Church Info */}
      <Card>
        <CardHeader>
          <CardTitle>Church Information</CardTitle>
          <CardDescription>Name and description displayed in the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="church_name">Church Name</Label>
            <Input id="church_name" value={content.church_name} onChange={(e) => updateField("church_name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="church_description">Description</Label>
            <Textarea id="church_description" value={content.church_description} onChange={(e) => updateField("church_description", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Phone, email, and location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={content.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={content.email} onChange={(e) => updateField("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="location">Location (use \n for line breaks)</Label>
            <Textarea id="location" value={content.location} onChange={(e) => updateField("location", e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Service Times */}
      <Card>
        <CardHeader>
          <CardTitle>Service Times</CardTitle>
          <CardDescription>Manage service days and their schedules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.service_times.map((service, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Day</Label>
                  <Input value={service.day} onChange={(e) => updateServiceDay(dayIndex, e.target.value)} placeholder="e.g. SUNDAY" />
                </div>
                <Button variant="destructive" size="icon" className="mt-6" onClick={() => removeServiceDay(dayIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 pl-4">
                <Label>Times</Label>
                {service.times.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center gap-2">
                    <Input value={time} onChange={(e) => updateServiceTime(dayIndex, timeIndex, e.target.value)} placeholder="e.g. 9:00 AM - First Service" />
                    {service.times.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeServiceTime(dayIndex, timeIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addServiceTime(dayIndex)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Time
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addServiceDay}>
            <Plus className="h-4 w-4 mr-2" /> Add Service Day
          </Button>
        </CardContent>
      </Card>

      {/* Bottom Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Bottom Bar</CardTitle>
          <CardDescription>Copyright text and footer links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="copyright_text">Copyright Text</Label>
            <Input id="copyright_text" value={content.copyright_text} onChange={(e) => updateField("copyright_text", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
            <Input id="privacy_policy_url" value={content.privacy_policy_url} onChange={(e) => updateField("privacy_policy_url", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="terms_url">Terms of Service URL</Label>
            <Input id="terms_url" value={content.terms_url} onChange={(e) => updateField("terms_url", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contact_url">Contact Us URL</Label>
            <Input id="contact_url" value={content.contact_url} onChange={(e) => updateField("contact_url", e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Note: The developer attribution line remains fixed and cannot be edited.</p>
        </CardContent>
      </Card>
    </div>
  );
};
