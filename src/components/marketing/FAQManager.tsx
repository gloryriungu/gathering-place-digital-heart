import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

const FAQ_CATEGORIES = [
  "Visiting & Services",
  "Membership & Getting Involved", 
  "Giving & Finances",
  "Special Services & Events",
  "Online Services & Technology",
  "General Information"
];

export const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const emptyFAQ: Omit<FAQItem, 'id' | 'created_at'> = {
    category: "General Information",
    question: "",
    answer: "",
    display_order: 0,
    is_published: true
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq_content')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQ content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFAQ = async (faqData: Omit<FAQItem, 'id' | 'created_at'>) => {
    setSaving(true);
    try {
      let result;
      
      if (editingFAQ) {
        // Update existing FAQ
        result = await supabase
          .from('faq_content')
          .update(faqData)
          .eq('id', editingFAQ.id);
      } else {
        // Create new FAQ
        result = await supabase
          .from('faq_content')
          .insert([faqData]);
      }

      if (result.error) throw result.error;

      await fetchFAQs();
      setIsDialogOpen(false);
      setEditingFAQ(null);
      
      toast({
        title: "Success",
        description: editingFAQ ? "FAQ updated successfully" : "FAQ created successfully",
      });
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faq_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFAQs();
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const FAQForm = ({ faq, onSave, onCancel }: {
    faq: Omit<FAQItem, 'id' | 'created_at'>;
    onSave: (data: Omit<FAQItem, 'id' | 'created_at'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(faq);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {FAQ_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="question">Question *</Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="What is your question?"
            required
          />
        </div>

        <div>
          <Label htmlFor="answer">Answer *</Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Provide a helpful and detailed answer..."
            rows={4}
            required
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
            id="published"
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
          />
          <Label htmlFor="published">Published (visible on website)</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save FAQ"}
          </Button>
        </div>
      </form>
    );
  };

  const filteredFAQs = filterCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === filterCategory);

  const faqsByCategory = FAQ_CATEGORIES.reduce((acc, category) => {
    acc[category] = faqs.filter(faq => faq.category === category && faq.is_published).length;
    return acc;
  }, {} as Record<string, number>);

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
            <HelpCircle className="h-6 w-6" />
            FAQ Content Management
          </h2>
          <p className="text-muted-foreground">
            Manage frequently asked questions displayed on the public FAQ page
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFAQ(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
              <DialogDescription>
                Create helpful answers to common questions about your church
              </DialogDescription>
            </DialogHeader>
            <FAQForm
              faq={editingFAQ || emptyFAQ}
              onSave={saveFAQ}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingFAQ(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Published FAQs will appear on the public FAQ page organized by category. Use clear, helpful language that visitors can easily understand.
        </AlertDescription>
      </Alert>

      {/* Category Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {FAQ_CATEGORIES.map((category) => (
          <Card key={category} className="cursor-pointer hover:shadow-md" onClick={() => setFilterCategory(category)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqsByCategory[category] || 0}</div>
              <p className="text-xs text-muted-foreground">published</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and Table */}
      <div className="flex items-center space-x-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FAQ_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">
          {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ Content</CardTitle>
          <CardDescription>
            Manage all frequently asked questions and answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFAQs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <Badge variant="outline">{faq.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={faq.question}>
                      {faq.question}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={faq.answer}>
                      {faq.answer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faq.is_published ? "default" : "secondary"}>
                      {faq.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{faq.display_order}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFAQ(faq);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFAQ(faq.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFAQs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {filterCategory === "all" 
                      ? "No FAQs found. Create your first FAQ to get started."
                      : `No FAQs found in the "${filterCategory}" category.`
                    }
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