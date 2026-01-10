import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ShoppingBag, Download, BookOpen } from "lucide-react";
import { formatAmount } from "@/lib/paystack";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DigitalPurchase {
  id: string;
  access_token: string;
  product_title: string;
  file_path: string;
}

export default function ShopVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [digitalPurchases, setDigitalPurchases] = useState<DigitalPurchase[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
        // Fetch existing digital purchases
        await fetchDigitalPurchases(order.id);
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
        if (data.data.digital_purchases?.length > 0) {
          setDigitalPurchases(data.data.digital_purchases);
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
    }
  };

  const fetchDigitalPurchases = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('digital_purchases')
        .select('*, media_content:product_id(title)')
        .eq('order_id', orderId);

      if (!error && data) {
        setDigitalPurchases(data.map(p => ({
          id: p.id,
          access_token: p.access_token,
          product_title: (p.media_content as any)?.title || 'Digital Product',
          file_path: ''
        })));
      }
    } catch (error) {
      console.error('Failed to fetch digital purchases:', error);
    }
  };

  const handleDownload = async (purchase: DigitalPurchase) => {
    setDownloadingId(purchase.id);
    try {
      // Use fetch directly to get blob response
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deliver-digital-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'download_file',
            accessToken: purchase.access_token
          })
        }
      );

      // Check if response is JSON (error) or blob (file)
      const contentType = response.headers.get('Content-Type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to download');
        return;
      }

      if (!response.ok) {
        toast.error('Failed to download file');
        return;
      }

      // Get filename from header or use product title
      const filename = response.headers.get('X-Filename') || `${purchase.product_title}.pdf`;

      // Create blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${purchase.product_title}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
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

              {/* Digital Downloads Section */}
              {digitalPurchases.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    <h4 className="font-semibold">Your Digital Downloads</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click to download your purchased digital content
                  </p>
                  <div className="space-y-2">
                    {digitalPurchases.map((purchase) => (
                      <Button
                        key={purchase.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handleDownload(purchase)}
                        disabled={downloadingId === purchase.id}
                      >
                        <span className="truncate">{purchase.product_title}</span>
                        {downloadingId === purchase.id ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <Download className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can also access your downloads from your dashboard
                  </p>
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
                  {digitalPurchases.length > 0 ? 'View My Downloads' : 'View Order History'}
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
