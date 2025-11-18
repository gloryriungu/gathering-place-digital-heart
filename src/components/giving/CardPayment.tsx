import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Shield } from "lucide-react";

interface CardPaymentProps {
  amount: number;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CardPayment = ({ amount, onSubmit, isLoading }: CardPaymentProps) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground mb-1">Card Payment Process:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click the button below to proceed</li>
              <li>You'll be redirected to our secure payment page</li>
              <li>Enter your card details safely</li>
              <li>Complete the payment authorization</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Amount to Pay:</span>
          <span className="text-2xl font-bold text-foreground">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded">
        <Shield className="h-4 w-4 text-primary" />
        <span>Secured by Paystack - Your card details are never stored on our servers</span>
      </div>

      <Button 
        onClick={onSubmit}
        className="w-full" 
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Secure Payment
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 pt-2">
        <img 
          src="https://paystack.com/assets/img/logos/visa.svg" 
          alt="Visa" 
          className="h-6 opacity-50"
        />
        <img 
          src="https://paystack.com/assets/img/logos/mastercard.svg" 
          alt="Mastercard" 
          className="h-6 opacity-50"
        />
        <span className="text-xs text-muted-foreground">and more...</span>
      </div>
    </div>
  );
};