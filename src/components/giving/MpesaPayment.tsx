import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2 } from "lucide-react";
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/paystack";

interface MpesaPaymentProps {
  amount: number;
  onSubmit: (phone: string) => void;
  isLoading: boolean;
  defaultPhone?: string;
}

export const MpesaPayment = ({ amount, onSubmit, isLoading, defaultPhone }: MpesaPaymentProps) => {
  const [phone, setPhone] = useState(defaultPhone || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      setError("Please enter a valid Safaricom phone number (e.g., 0712345678)");
      return;
    }

    onSubmit(formattedPhone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground mb-1">M-Pesa Payment Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Enter your Safaricom M-Pesa number</li>
              <li>You'll receive an STK push on your phone</li>
              <li>Enter your M-Pesa PIN to complete payment</li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
        <Input
          id="mpesa-phone"
          type="tel"
          placeholder="0712345678"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          disabled={isLoading}
          className={error ? "border-destructive" : ""}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Enter your Safaricom number (e.g., 0712345678)
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Amount to Pay:</span>
          <span className="text-2xl font-bold text-foreground">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isLoading || !phone}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Smartphone className="mr-2 h-4 w-4" />
            Pay with M-Pesa
          </>
        )}
      </Button>

      {isLoading && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-sm font-medium text-foreground">
            Check your phone for the M-Pesa prompt
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your PIN to complete the transaction
          </p>
        </div>
      )}
    </form>
  );
};