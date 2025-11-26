import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { formatAmount, validateEmail } from "@/lib/paystack";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShopCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onCheckoutComplete: () => void;
}

export const ShopCheckout = ({ open, onOpenChange, cartItems, onCheckoutComplete }: ShopCheckoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        
        supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
              setPhone(data.phone || "");
            }
          });
      }
    });
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleCheckout = async () => {
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initialize-shop-payment', {
        body: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          items: cartItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal,
          total_amount: total,
          user_id: user?.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.data?.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data?.error || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to process checkout",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Order Summary</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatAmount(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatAmount(total)}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Customer Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to Paystack to complete your payment securely
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
