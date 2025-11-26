import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ShoppingBag } from "lucide-react";
import { formatAmount } from "@/lib/paystack";

export default function ShopVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('id', reference)
        .single();

      if (orderError) throw orderError;

      setOrderDetails(order);

      // Check if already completed
      if (order.transaction_status === 'completed') {
        setStatus('success');
        return;
      }

      // Verify with Paystack via edge function
      const { data, error } = await supabase.functions.invoke('verify-shop-payment', {
        body: { reference }
      });

      if (error) throw error;

      if (data?.success && data?.data?.status === 'success') {
        setStatus('success');
        setOrderDetails(data.data.order);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Verifying Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Order Confirmed!</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment was successful
                </p>
              </div>

              {orderDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-mono font-semibold">{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold">{formatAmount(orderDetails.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{orderDetails.payment_channel}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={() => navigate('/shop')} className="w-full">
                  Continue Shopping
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full"
                >
                  View Order History
                </Button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Payment Failed</h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't verify your payment. Please try again.
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={() => navigate('/shop')} className="w-full">
                  Return to Shop
                </Button>
                <Button 
                  variant="outline" 
                  onClick={verifyPayment} 
                  className="w-full"
                >
                  Retry Verification
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
