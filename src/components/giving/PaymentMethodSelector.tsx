import { CreditCard, Smartphone } from "lucide-react";
import { PaymentMethod } from "@/lib/paystack";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({ selected, onChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange('mobile_money')}
        className={`p-6 rounded-lg border-2 transition-all ${
          selected === 'mobile_money'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <Smartphone className={`h-8 w-8 mx-auto mb-2 ${
          selected === 'mobile_money' ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <div className="font-semibold text-foreground">M-Pesa</div>
        <div className="text-sm text-muted-foreground">Mobile Money</div>
      </button>

      <button
        type="button"
        onClick={() => onChange('card')}
        className={`p-6 rounded-lg border-2 transition-all ${
          selected === 'card'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <CreditCard className={`h-8 w-8 mx-auto mb-2 ${
          selected === 'card' ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <div className="font-semibold text-foreground">Card</div>
        <div className="text-sm text-muted-foreground">Debit/Credit Card</div>
      </button>
    </div>
  );
};