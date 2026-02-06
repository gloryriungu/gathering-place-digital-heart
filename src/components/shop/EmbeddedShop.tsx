import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, Heart, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopCheckout } from "@/components/shop/ShopCheckout";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CART_STORAGE_KEY = 'shop_cart';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: number;
  featured?: boolean;
  isDigital?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface EmbeddedShopProps {
  onClose: () => void;
}

export const EmbeddedShop = ({ onClose }: EmbeddedShopProps) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchProducts();

    const channel = supabase.channel('embedded-products-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'media_content',
      filter: "content_type=eq.product"
    }, () => {
      fetchProducts();
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchWishlist();
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase.from('wishlist').select('product_id');
      if (error) throw error;
      const wishlistSet = new Set(data?.map(item => item.product_id) || []);
      setWishlistItems(wishlistSet);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.has(productId);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    try {
      if (isInWishlist(productId)) {
        const { error } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
        if (error) throw error;
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast({ title: "Removed from wishlist", description: "Item removed from your wishlist" });
      } else {
        const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        setWishlistItems(prev => new Set([...prev, productId]));
        toast({ title: "Added to wishlist", description: "Item saved to your wishlist" });
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      if (error.code === '23505') {
        toast({ title: "Already in wishlist", description: "This item is already in your wishlist" });
      } else {
        toast({ title: "Error", description: "Failed to update wishlist", variant: "destructive" });
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('shop_categories').select('id, name, slug, icon').eq('is_active', true).order('display_order', { ascending: true });
      if (error) console.error('Error fetching categories:', error);
      else setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('media_content').select('*').eq('content_type', 'product').eq('status', 'published').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        const formattedProducts = data?.map(item => {
          const contentData = item.content_data as any;
          return {
            id: item.id,
            name: item.title,
            price: contentData?.price || 0,
            description: item.description || '',
            image: item.image_url || "/placeholder.svg",
            category: contentData?.category || "General",
            stock: contentData?.stock || 0,
            featured: contentData?.featured || false,
            isDigital: contentData?.is_digital || false
          };
        }) || [];
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCategoryToSlug = (category: string) => {
    return category.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const filteredProducts = products.filter(product => {
    const productSlug = normalizeCategoryToSlug(product.category);
    const matchesCategory = selectedCategory === 'all' || productSlug === selectedCategory;
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (categorySlug: string) => {
    if (categorySlug === 'all') return products.length;
    return products.filter(product => normalizeCategoryToSlug(product.category) === categorySlug).length;
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast({ title: "Added to cart", description: `${product.name} added to your cart` });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckoutComplete = () => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    toast({ title: "Order Placed Successfully!", description: "Thank you for your purchase" });
    onClose();
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Downloads
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-40 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and cart */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Downloads
        </Button>
        
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                {cart.length === 0 ? "Your cart is empty" : `${getTotalItems()} item(s) in cart`}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">KSh {item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {cart.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total:</span>
                    <span>KSh {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleProceedToCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="shrink-0"
              size="sm"
            >
              All
              <Badge variant="secondary" className="ml-2">{getCategoryCount('all')}</Badge>
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.slug)}
                className="shrink-0"
                size="sm"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">{getCategoryCount(category.slug)}</Badge>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isDigital && (
                    <Badge className="absolute top-2 left-2">Digital</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <p className="text-lg font-bold mt-2">KSh {product.price.toLocaleString()}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => addToCart(product)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Floating cart indicator */}
      {getTotalItems() > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" onClick={() => setIsCartOpen(true)} className="shadow-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            {getTotalItems()} items - KSh {getTotalPrice().toFixed(2)}
          </Button>
        </div>
      )}

      {/* Checkout Dialog */}
      <ShopCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartItems={cart}
        onCheckoutComplete={handleCheckoutComplete}
      />
    </div>
  );
};
