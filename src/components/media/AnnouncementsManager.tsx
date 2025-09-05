import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AnnouncementData {
  id: string;
  title: string;
  description: string;
  content_data: any;
  status: string;
  created_at: string;
}

export const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementData | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as 'low' | 'medium' | 'high',
    expires_at: "",
    show_on_homepage: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data as any || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      expires_at: "",
      show_on_homepage: false
    });
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement: AnnouncementData) => {
    setEditingAnnouncement(announcement);
    const contentData = announcement.content_data as any;
    setFormData({
      title: announcement.title,
      description: announcement.description || "",
      priority: contentData?.priority || "medium",
      expires_at: contentData?.expires_at || "",
      show_on_homepage: contentData?.show_on_homepage || false
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please enter an announcement title');
      return;
    }

    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('You must be logged in to save changes');
        return;
      }

      const contentData = {
        priority: formData.priority,
        expires_at: formData.expires_at,
        show_on_homepage: formData.show_on_homepage
      };

      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('media_content')
          .update({
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            status: 'published'
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast.success('Announcement updated successfully');
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('media_content')
          .insert({
            content_type: 'announcement',
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            status: 'published',
            created_by: user.data.user.id
          });

        if (error) throw error;
        toast.success('Announcement created successfully');
      }

      setIsCreateDialogOpen(false);
      resetForm();
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('media_content')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast.success('Announcement deleted successfully');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="mr-2 h-5 w-5" />
            Announcements Manager
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
              <Megaphone className="mr-2 h-5 w-5" />
              <div>
                <CardTitle>Announcements Manager</CardTitle>
                <CardDescription>Create and manage church announcements and notifications</CardDescription>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                  </DialogTitle>
                  <DialogDescription>
                    Create important announcements for church members
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Announcement Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter announcement details"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="expires_at">Expires At</Label>
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show_on_homepage"
                      checked={formData.show_on_homepage}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_on_homepage: e.target.checked }))}
                    />
                    <Label htmlFor="show_on_homepage">Show on Homepage</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Announcement'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No announcements yet</h3>
              <p className="mt-2 text-gray-500">Create your first announcement to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                        <Card key={announcement.id} className={`${(announcement.content_data as any)?.expires_at && isExpired((announcement.content_data as any).expires_at) ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <Badge className={getPriorityColor((announcement.content_data as any)?.priority || 'medium')}>
                            {((announcement.content_data as any)?.priority || 'medium').toUpperCase()}
                          </Badge>
                          {(announcement.content_data as any)?.show_on_homepage && (
                            <Badge variant="outline">Homepage</Badge>
                          )}
                          {(announcement.content_data as any)?.expires_at && isExpired((announcement.content_data as any).expires_at) && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        
                        {announcement.description && (
                          <p className="text-muted-foreground mb-2">{announcement.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created: {new Date(announcement.created_at).toLocaleDateString()}
                          </div>
                          {(announcement.content_data as any)?.expires_at && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires: {new Date((announcement.content_data as any).expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};