import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { MpesaPayment } from "./MpesaPayment";
import { CardPayment } from "./CardPayment";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle2, Loader2 } from "lucide-react";
import { PaymentMethod, formatAmount, validateEmail } from "@/lib/paystack";

interface GivingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContributionType?: string;
}

export const GivingForm = ({ open, onOpenChange, defaultContributionType }: GivingFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form data
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [amount, setAmount] = useState<string>("");
  const [contributionType, setContributionType] = useState(defaultContributionType || "Tithe");
  const [customContributionType, setCustomContributionType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  
  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  // Load user data and saved payment methods
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        
        // Load profile data
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

        // Load saved payment methods for recurring option
        supabase
          .from('saved_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .then(({ data }) => {
            if (data && data.length > 0) {
              setSavedPaymentMethods(data);
              setSelectedPaymentMethodId(data[0].id); // Set default
            }
          });
      }
    });
  });

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinueToPayment = async () => {
    // Validate amount
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is KES 10",
        variant: "destructive"
      });
      return;
    }

    if (numAmount > 1000000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum amount is KES 1,000,000",
        variant: "destructive"
      });
      return;
    }

    // Validate custom contribution type
    if (contributionType === "others" && !customContributionType.trim()) {
      toast({
        title: "Missing Information",
        description: "Please specify the contribution type",
        variant: "destructive"
      });
      return;
    }

    // Validate guest details
    if (!user) {
      if (!name || !email) {
        toast({
          title: "Missing Information",
          description: "Please provide your name and email",
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
    }

    // Recurring giving validation
    if (isRecurring) {
      if (!user) {
        toast({
          title: "Login Required",
          description: "You must be logged in to set up recurring giving",
          variant: "destructive"
        });
        return;
      }

      if (savedPaymentMethods.length === 0) {
        toast({
          title: "Payment Method Required",
          description: "Please save a payment method first to enable recurring giving",
          variant: "destructive"
        });
        return;
      }

      // Create recurring contribution record
      await createRecurringContribution();
      return;
    }

    setStep('payment');
  };

  const createRecurringContribution = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get member_id
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Calculate next charge date (first day of next month)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);

      const { error } = await supabase
        .from('recurring_contributions')
        .insert({
          user_id: user.id,
          member_id: member?.id,
          contribution_type: contributionType === "others" ? customContributionType : contributionType,
          amount: parseFloat(amount),
          frequency: 'monthly',
          payment_method_id: selectedPaymentMethodId,
          status: 'active',
          next_charge_date: nextMonth.toISOString().split('T')[0]
        });

      if (error) throw error;

      setStep('success');
      toast({
        title: "Recurring Giving Set Up!",
        description: `Your monthly ${contributionType} of ${formatAmount(parseFloat(amount))} has been scheduled`,
      });

      setTimeout(() => {
        onOpenChange(false);
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Error setting up recurring:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up recurring giving",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpesaPayment = async (mpesaPhone: string) => {
    setIsLoading(true);
    setStep('processing');

    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          payment_method: 'mobile_money',
          amount: parseFloat(amount),
          email: email,
          phone: mpesaPhone,
          contribution_type: contributionType === "others" ? customContributionType : contributionType,
          user_id: user?.id,
          save_details: saveDetails,
          name: name
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Start polling for payment status
      const reference = data.data.reference;
      await pollPaymentStatus(reference);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize M-Pesa payment",
        variant: "destructive"
      });
      setStep('payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          payment_method: 'card',
          amount: parseFloat(amount),
          email: email,
          contribution_type: contributionType === "others" ? customContributionType : contributionType,
          user_id: user?.id,
          save_details: saveDetails,
          name: name
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to Paystack checkout
      window.location.href = data.data.authorization_url;

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize card payment",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (reference: string, attempts = 0) => {
    const maxAttempts = 20; // 60 seconds total (3 second intervals)

    if (attempts >= maxAttempts) {
      toast({
        title: "Payment Timeout",
        description: "Payment was not completed. Please try again or contact support if money was deducted.",
        variant: "destructive"
      });
      setIsLoading(false);
      setStep('details');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      if (error) throw error;

      if (data.success && data.data.status === 'completed') {
        setStep('success');
        setTimeout(() => {
          onOpenChange(false);
          if (user) {
            navigate('/dashboard');
          }
        }, 3000);
        return;
      }

      if (data.data.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Payment was declined or abandoned. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        setStep('details');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(reference, attempts + 1), 3000);

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive"
      });
      setStep('payment');
    }
  };

  const resetForm = () => {
    setStep('details');
    setAmount("");
    setContributionType("offering");
    setCustomContributionType("");
    if (!user) {
      setName("");
      setEmail("");
      setPhone("");
    }
    setSaveDetails(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {step === 'success' ? 'Thank You!' : 'Give to the Ministry'}
          </DialogTitle>
          <DialogDescription>
            {step === 'success' 
              ? 'Your contribution has been received successfully'
              : 'Your generous giving enables us to fulfill our mission'}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-6 py-4">
            <div>
              <Label>Contribution Type</Label>
              <Select value={contributionType} onValueChange={(value) => {
                setContributionType(value);
                if (value !== "others") {
                  setCustomContributionType("");
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tithe">Tithe</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="mission">Mission</SelectItem>
                  <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contributionType === "others" && (
              <div>
                <Label htmlFor="custom-type">Specify Contribution Type *</Label>
                <Input
                  id="custom-type"
                  value={customContributionType}
                  onChange={(e) => setCustomContributionType(e.target.value)}
                  placeholder="e.g., Building Project, Youth Ministry"
                />
              </div>
            )}

            <div>
              <Label>Amount (KES)</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={amount === preset.toString() ? "default" : "outline"}
                    onClick={() => handleAmountSelect(preset)}
                    className="w-full"
                  >
                    {preset.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                max="1000000"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum: KES 10 | Maximum: KES 1,000,000
              </p>
            </div>

            {!user && (
              <>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </>
            )}

            <div>
              <Label className="mb-3 block">Payment Method</Label>
              <PaymentMethodSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-details"
                    checked={saveDetails}
                    onCheckedChange={(checked) => setSaveDetails(checked as boolean)}
                  />
                  <label
                    htmlFor="save-details"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save payment details for faster giving next time
                  </label>
                </div>

                {savedPaymentMethods.length > 0 && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                      />
                      <label
                        htmlFor="recurring"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Make this a recurring monthly contribution
                      </label>
                    </div>

                    {isRecurring && (
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                          <SelectTrigger id="payment-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {savedPaymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.phone_number 
                                  ? `M-Pesa: ${method.phone_number}` 
                                  : `${method.card_type} •••• ${method.card_last4}`}
                                {method.is_default && " (Default)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Charges will occur on the 1st of each month
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <Button 
              onClick={handleContinueToPayment} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isRecurring ? 'Set Up Recurring Giving' : 'Continue to Payment'}
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="py-4">
            {paymentMethod === 'mobile_money' ? (
              <MpesaPayment
                amount={parseFloat(amount)}
                onSubmit={handleMpesaPayment}
                isLoading={isLoading}
                defaultPhone={phone}
              />
            ) : (
              <CardPayment
                amount={parseFloat(amount)}
                onSubmit={handleCardPayment}
                isLoading={isLoading}
              />
            )}

            <Button
              variant="ghost"
              onClick={() => setStep('details')}
              className="w-full mt-4"
              disabled={isLoading}
            >
              Back to Details
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for your generous contribution of {formatAmount(parseFloat(amount))}
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};