import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatAmount } from "@/lib/paystack";
import { useAuth } from "@/components/auth/AuthProvider";

const GiveVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [sessionRefreshed, setSessionRefreshed] = useState(false);

  // Refresh session on mount to restore authentication after Paystack redirect
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session refreshed on GiveVerify:', session ? 'authenticated' : 'not authenticated');
        setSessionRefreshed(true);
      } catch (error) {
        console.error('Error refreshing session:', error);
        setSessionRefreshed(true);
      }
    };
    refreshSession();
  }, []);

  useEffect(() => {
    if (sessionRefreshed) {
      verifyPayment();
    }
  }, [sessionRefreshed]);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      if (error) throw error;

      if (data.success && data.data.status === 'completed') {
        setStatus('success');
        setTransactionData(data.data);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="py-16">
              {status === 'verifying' && (
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment
                  </p>
                </div>
              )}

              {status === 'success' && transactionData && (
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-8">
                    Thank you for your generous contribution
                  </p>

                  <div className="bg-muted rounded-lg p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold">{formatAmount(transactionData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{transactionData.contribution?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-mono text-sm">{transactionData.reference}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    A confirmation email has been sent to your email address
                  </p>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/give')} variant="outline">
                      Give Again
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
                      View History
                    </Button>
                  </div>
                </div>
              )}

              {status === 'failed' && (
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                  <p className="text-muted-foreground mb-8">
                    We couldn't verify your payment. Please try again or contact support.
                  </p>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/give')} variant="outline">
                      Try Again
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      Go Home
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiveVerify;