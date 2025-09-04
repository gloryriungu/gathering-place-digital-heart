import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Plus, Edit, Trash2, Upload, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EventData {
  id: string;
  title: string;
  description: string;
  content_data: {
    date: string;
    time: string;
    location: string;
    category: string;
  };
  image_url?: string;
  status: string;
  created_at: string;
}

export const EventsManager = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    image: null as File | null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'event')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data as any || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      image: null
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.content_data.date || "",
      time: event.content_data.time || "",
      location: event.content_data.location || "",
      category: event.content_data.category || "",
      image: null
    });
    setIsCreateDialogOpen(true);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-posters')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-posters')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('You must be logged in to save changes');
        return;
      }

      let imageUrl = editingEvent?.image_url;
      
      if (formData.image) {
        const uploadedUrl = await handleImageUpload(formData.image);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const contentData = {
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('media_content')
          .update({
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            image_url: imageUrl,
            status: 'published'
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { error } = await supabase
          .from('media_content')
          .insert({
            content_type: 'event',
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            image_url: imageUrl,
            status: 'published',
            created_by: user.data.user.id
          });

        if (error) throw error;
        toast.success('Event created successfully');
      }

      setIsCreateDialogOpen(false);
      resetForm();
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('media_content')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Events Manager
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
              <Calendar className="mr-2 h-5 w-5" />
              <div>
                <CardTitle>Events Manager</CardTitle>
                <CardDescription>Create and manage church events and announcements</CardDescription>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                  <DialogDescription>
                    Add event details and upload a poster image
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter event title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter event description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Event Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Event Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter event location"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Conference, Youth, Worship"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Event Poster</Label>
                      <div className="mt-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            image: e.target.files?.[0] || null 
                          }))}
                        />
                      </div>
                      {editingEvent?.image_url && (
                        <div className="mt-2">
                          <img 
                            src={editingEvent.image_url} 
                            alt="Current poster" 
                            className="w-full h-24 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving || uploading}>
                    {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Event'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
              <p className="mt-2 text-gray-500">Create your first event to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  {event.image_url && (
                    <div className="aspect-video relative">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <Badge variant="secondary">
                        {event.content_data.category || 'Event'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>📅 {event.content_data.date}</p>
                      {event.content_data.time && <p>🕐 {event.content_data.time}</p>}
                      {event.content_data.location && <p>📍 {event.content_data.location}</p>}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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