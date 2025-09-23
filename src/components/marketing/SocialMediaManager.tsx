import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Plus, Edit, Trash2, ExternalLink, AlertCircle } from "lucide-react";

interface SocialMediaHandle {
  id: string;
  platform: string;
  handle: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const SocialMediaManager = () => {
  const [handles, setHandles] = useState<SocialMediaHandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingHandle, setEditingHandle] = useState<SocialMediaHandle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const emptyHandle: Omit<SocialMediaHandle, 'id' | 'created_at' | 'updated_at'> = {
    platform: "",
    handle: "",
    url: "",
    icon: "",
    is_active: true,
    display_order: 0
  };

  const popularPlatforms = [
    { name: "Facebook", icon: "Facebook", placeholder: "@yourchurch" },
    { name: "Instagram", icon: "Instagram", placeholder: "@yourchurch" },
    { name: "Twitter", icon: "Twitter", placeholder: "@yourchurch" },
    { name: "YouTube", icon: "Youtube", placeholder: "Your Church Channel" },
    { name: "TikTok", icon: "Music", placeholder: "@yourchurch" },
    { name: "LinkedIn", icon: "Linkedin", placeholder: "Your Church" },
  ];

  useEffect(() => {
    fetchSocialMediaHandles();
  }, []);

  const fetchSocialMediaHandles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_media_handles')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHandles(data || []);
    } catch (error) {
      console.error('Error fetching social media handles:', error);
      toast({
        title: "Error",
        description: "Failed to load social media handles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSocialMediaHandle = async (handleData: Omit<SocialMediaHandle, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      let result;
      
      if (editingHandle) {
        // Update existing handle
        result = await supabase
          .from('social_media_handles')
          .update(handleData)
          .eq('id', editingHandle.id);
      } else {
        // Create new handle
        result = await supabase
          .from('social_media_handles')
          .insert([handleData]);
      }

      if (result.error) throw result.error;

      await fetchSocialMediaHandles();
      setIsDialogOpen(false);
      setEditingHandle(null);
      
      toast({
        title: "Success",
        description: editingHandle ? "Social media handle updated successfully" : "Social media handle created successfully",
      });
    } catch (error) {
      console.error('Error saving social media handle:', error);
      toast({
        title: "Error",
        description: "Failed to save social media handle",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSocialMediaHandle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social media handle?')) return;

    try {
      const { error } = await supabase
        .from('social_media_handles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSocialMediaHandles();
      toast({
        title: "Success",
        description: "Social media handle deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting social media handle:', error);
      toast({
        title: "Error",
        description: "Failed to delete social media handle",
        variant: "destructive",
      });
    }
  };

  const SocialMediaForm = ({ handle, onSave, onCancel }: {
    handle: Omit<SocialMediaHandle, 'id' | 'created_at' | 'updated_at'>;
    onSave: (data: Omit<SocialMediaHandle, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(handle);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const selectPlatform = (platform: typeof popularPlatforms[0]) => {
      setFormData(prev => ({
        ...prev,
        platform: platform.name,
        icon: platform.icon,
        handle: platform.placeholder
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Quick Select Platform</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {popularPlatforms.map((platform) => (
              <Button
                key={platform.name}
                type="button"
                variant="outline"
                onClick={() => selectPlatform(platform)}
                className="text-sm"
              >
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="platform">Platform Name *</Label>
          <Input
            id="platform"
            value={formData.platform}
            onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="handle">Handle/Username *</Label>
          <Input
            id="handle"
            value={formData.handle}
            onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
            placeholder="@yourchurch or Your Church Name"
            required
          />
        </div>

        <div>
          <Label htmlFor="url">Profile URL *</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://facebook.com/yourchurch"
            required
          />
        </div>

        <div>
          <Label htmlFor="icon">Icon Name</Label>
          <Input
            id="icon"
            value={formData.icon || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="Facebook, Instagram, Twitter, etc."
          />
        </div>

        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="active">Active (visible on website)</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Handle"}
          </Button>
        </div>
      </form>
    );
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
            <Share2 className="h-6 w-6" />
            Social Media Management
          </h2>
          <p className="text-muted-foreground">
            Manage your church's social media presence and handles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingHandle(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingHandle ? "Edit Social Media Handle" : "Add New Platform"}
              </DialogTitle>
              <DialogDescription>
                Add your church's social media profiles to display on the website
              </DialogDescription>
            </DialogHeader>
            <SocialMediaForm
              handle={editingHandle || emptyHandle}
              onSave={saveSocialMediaHandle}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingHandle(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Active social media handles will be displayed in the website footer and contact sections. Make sure all URLs are current and working.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Social Media Handles ({handles.length})</CardTitle>
          <CardDescription>
            Manage all your church's social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handles.map((handle) => (
                <TableRow key={handle.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{handle.platform}</span>
                      {handle.icon && (
                        <Badge variant="outline" className="text-xs">
                          {handle.icon}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{handle.handle}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="truncate max-w-xs">{handle.url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(handle.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={handle.is_active ? "default" : "secondary"}>
                      {handle.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{handle.display_order}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingHandle(handle);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSocialMediaHandle(handle.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {handles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No social media handles found. Add your first platform to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};