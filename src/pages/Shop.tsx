import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, Facebook, Instagram, Youtube, Twitter, Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopCheckout } from "@/components/shop/ShopCheckout";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
const Shop = () => {
  const {
    toast
  } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
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
    checkAuth();
    fetchCategories();
    fetchProducts();

    // Get category from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    // Set up real-time subscription
    const channel = supabase.channel('products-changes').on('postgres_changes', {
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
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchWishlist();
    }
  };
  const fetchWishlist = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('wishlist').select('product_id');
      if (error) throw error;
      const wishlistSet = new Set(data?.map(item => item.product_id) || []);
      setWishlistItems(wishlistSet);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };
  const isInWishlist = (productId: string) => {
    return wishlistItems.has(productId);
  };
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
        // Remove from wishlist
        const {
          error
        } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
        if (error) throw error;
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast({
          title: "Removed from wishlist",
          description: "Item removed from your wishlist"
        });
      } else {
        // Add to wishlist
        const {
          error
        } = await supabase.from('wishlist').insert({
          user_id: user.id,
          product_id: productId
        });
        if (error) throw error;
        setWishlistItems(prev => new Set([...prev, productId]));
        toast({
          title: "Added to wishlist",
          description: "Item saved to your wishlist"
        });
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      if (error.code === '23505') {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update wishlist",
          variant: "destructive"
        });
      }
    }
  };
  const fetchCategories = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('shop_categories').select('id, name, slug, icon').eq('is_active', true).order('display_order', {
        ascending: true
      });
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    if (categorySlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categorySlug);
    }
    setSearchParams(searchParams);
  };
  const fetchProducts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('media_content').select('*').eq('content_type', 'product').eq('status', 'published').order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        const formattedProducts = data?.map(item => {
          const contentData = item.content_data as any;
          return {
            id: item.id,
            name: item.title,
            price: contentData?.price || 0,
            description: item.description,
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

  // Fallback products if no data exists
  const defaultProducts: Product[] = [{
    id: "1",
    name: "Faith Over Fear T-Shirt",
    price: 25.99,
    description: "Comfortable cotton t-shirt with inspirational message",
    image: "/placeholder.svg",
    category: "Apparel"
  }, {
    id: "2",
    name: "Daily Devotional Book",
    price: 19.99,
    description: "365 days of spiritual guidance and inspiration",
    image: "/placeholder.svg",
    category: "Books"
  }, {
    id: "3",
    name: "Worship Music CD",
    price: 15.99,
    description: "Latest worship songs from our church",
    image: "/placeholder.svg",
    category: "Music"
  }, {
    id: "4",
    name: "Prayer Journal",
    price: 12.99,
    description: "Beautiful journal for your daily prayers",
    image: "/placeholder.svg",
    category: "Books"
  }, {
    id: "5",
    name: "Church Hoodie",
    price: 39.99,
    description: "Warm and comfortable hoodie with church logo",
    image: "/placeholder.svg",
    category: "Apparel"
  }, {
    id: "6",
    name: "Scripture Coffee Mug",
    price: 14.99,
    description: "Start your day with God's word",
    image: "/placeholder.svg",
    category: "Accessories"
  }];
  const displayProducts = products.length > 0 ? products : defaultProducts;
  // Helper to normalize category name to slug format
  const normalizeCategoryToSlug = (category: string) => {
    return category.toLowerCase()
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const filteredProducts = displayProducts.filter(product => {
    // Filter by category
    const productSlug = normalizeCategoryToSlug(product.category);
    const matchesCategory = selectedCategory === 'all' || productSlug === selectedCategory;

    // Filter by search term
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const getCategoryCount = (categorySlug: string) => {
    if (categorySlug === 'all') return displayProducts.length;
    return displayProducts.filter(product => {
      const slug = normalizeCategoryToSlug(product.category);
      return slug === categorySlug;
    }).length;
  };
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? {
          ...item,
          quantity: item.quantity + 1
        } : item);
      }
      return [...prevCart, {
        ...product,
        quantity: 1
      }];
    });
  };
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => item.id === productId ? {
      ...item,
      quantity: newQuantity
    } : item));
  };
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  const handleCheckoutComplete = () => {
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for your purchase"
    });
  };
  const socialLinks = [{
    icon: Facebook,
    href: "#",
    label: "Facebook"
  }, {
    icon: Instagram,
    href: "#",
    label: "Instagram"
  }, {
    icon: Youtube,
    href: "#",
    label: "YouTube"
  }, {
    icon: Twitter,
    href: "#",
    label: "Twitter"
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">TOT Store</h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                Equip yourself with books, resources, and merchandise that will strengthen your faith journey
              </p>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="py-8 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
          </div>
        </section>

        {/* Search and Category Filter */}
        <section className="py-6 bg-muted/20 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Search products by name or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2">
                <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => handleCategoryChange('all')} className="shrink-0">
                  All Products
                  <Badge variant="secondary" className="ml-2">
                    {getCategoryCount('all')}
                  </Badge>
                </Button>
                {categories.map(category => <Button key={category.id} variant={selectedCategory === category.slug ? 'default' : 'outline'} onClick={() => handleCategoryChange(category.slug)} className="shrink-0">
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {getCategoryCount(category.slug)}
                    </Badge>
                  </Button>)}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Kingdom Resources</h2>
                <p className="text-muted-foreground mt-1">
                  {selectedCategory === 'all' ? `Showing all ${filteredProducts.length} products` : `${filteredProducts.length} ${categories.find(c => c.slug === selectedCategory)?.name || 'products'}`}
                </p>
              </div>
              
              {/* Cart Button */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {getTotalItems() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {getTotalItems()}
                      </Badge>}
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
                    {cart.map(item => <div key={item.id} className="flex items-center space-x-4">
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
                      </div>)}
                  </div>
                  
                  {cart.length > 0 && <>
                      <Separator className="my-6" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total:</span>
                          <span>KSh {getTotalPrice().toFixed(2)}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}>
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>}
                </SheetContent>
              </Sheet>
            </div>

      <ShopCheckout open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} cartItems={cart} onCheckoutComplete={handleCheckoutComplete} />
            
            {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full mb-4" />
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>)}
              </div> : filteredProducts.length === 0 ? <div className="text-center py-16">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No products found</h3>
                <p className="mt-2 text-muted-foreground">
                  There are no products in this category yet
                </p>
                <Button variant="outline" className="mt-4" onClick={() => handleCategoryChange('all')}>
                  View All Products
                </Button>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="p-0 relative">
                      <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                      <Button variant="secondary" size="icon" className="absolute top-2 right-2" onClick={() => toggleWishlist(product.id)}>
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {product.isDigital && (
                        <Badge className="absolute top-2 left-2 bg-primary">
                          Digital Download
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                      <CardDescription className="mb-4">
                        {product.description}
                      </CardDescription>
                      <p className="text-2xl font-bold text-primary">
                        KSh {product.price}
                      </p>
                      {product.isDigital && (
                        <p className="text-xs text-muted-foreground mt-1">Instant download after purchase</p>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full" onClick={() => addToCart(product)} disabled={!product.isDigital && product.stock === 0}>
                        {!product.isDigital && product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardFooter>
                  </Card>)}
              </div>}
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Shop;