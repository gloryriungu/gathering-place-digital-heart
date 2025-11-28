import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  product: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    content_data: {
      price: number;
      category: string;
      stock: number;
    };
  };
}

const Wishlist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your wishlist",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setUser(user);
    fetchWishlist();
  };

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          added_at,
          product:media_content!wishlist_product_id_fkey (
            id,
            title,
            description,
            image_url,
            content_data
          )
        `)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setWishlistItems(data as any || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const goToShop = () => {
    navigate('/shop');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">My Wishlist</h1>
                <p className="text-xl text-primary-foreground/90">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
              <Heart className="h-16 w-16 opacity-50" />
            </div>
          </div>
        </section>

        {/* Wishlist Items */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-16 w-full mb-4" />
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start adding items you love to your wishlist
                </p>
                <Button onClick={goToShop} size="lg">
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="p-0 relative">
                      <img
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.title}
                        className="h-48 w-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{item.product.title}</CardTitle>
                        <Badge variant="secondary">{item.product.content_data?.category || 'Product'}</Badge>
                      </div>
                      <CardDescription className="mb-4">
                        {item.product.description}
                      </CardDescription>
                      <p className="text-2xl font-bold text-primary">
                        KSh {item.product.content_data?.price || 0}
                      </p>
                      {item.product.content_data?.stock === 0 && (
                        <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={goToShop}
                        disabled={item.product.content_data?.stock === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View in Shop
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;