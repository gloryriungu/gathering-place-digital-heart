import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProductData {
  id: string;
  title: string;
  description: string;
  content_data: any;
  image_url?: string;
  status: string;
  created_at: string;
}

export const ShopManager = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    featured: false,
    image: null as File | null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('content_type', 'product')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data as any || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      featured: false,
      image: null
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product);
    const contentData = product.content_data as any;
    setFormData({
      title: product.title,
      description: product.description || "",
      price: contentData?.price?.toString() || "",
      category: contentData?.category || "",
      stock: contentData?.stock?.toString() || "",
      featured: contentData?.featured || false,
      image: null
    });
    setIsCreateDialogOpen(true);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
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
    if (!formData.title || !formData.price) {
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

      let imageUrl = editingProduct?.image_url;
      
      if (formData.image) {
        const uploadedUrl = await handleImageUpload(formData.image);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const contentData = {
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        featured: formData.featured
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('media_content')
          .update({
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            image_url: imageUrl,
            status: 'published'
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('media_content')
          .insert({
            content_type: 'product',
            title: formData.title,
            description: formData.description,
            content_data: contentData,
            image_url: imageUrl,
            status: 'published',
            created_by: user.data.user.id
          });

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setIsCreateDialogOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('media_content')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Shop Manager
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
              <ShoppingBag className="mr-2 h-5 w-5" />
              <div>
                <CardTitle>Shop Manager</CardTitle>
                <CardDescription>Manage merchandise, books, and church products</CardDescription>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </DialogTitle>
                  <DialogDescription>
                    Add product details and upload an image
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Product Name *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Price (KSh) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Books, Apparel, Music"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>

                    <div>
                      <Label htmlFor="image">Product Image</Label>
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
                      {editingProduct?.image_url && (
                        <div className="mt-2">
                          <img 
                            src={editingProduct.image_url} 
                            alt="Current image" 
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
                    {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
              <p className="mt-2 text-gray-500">Add your first product to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_url && (
                    <div className="aspect-square relative">
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {(product.content_data as any)?.featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                      <Badge variant="secondary">
                        {(product.content_data as any)?.category || 'Product'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-lg">KSh {(product.content_data as any)?.price || 0}</span>
                      </div>
                      <Badge variant="outline">
                        Stock: {(product.content_data as any)?.stock || 0}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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