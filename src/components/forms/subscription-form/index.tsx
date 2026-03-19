"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  selectedPriceId: string;
};

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  // ⚠️ DISABLED: Stripe payment form has been removed
  // This component no longer handles payment processing

  return (
    <div className="p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Disabled:</strong> Payment processing has been removed. 
          All features are now accessible without payment.
        </AlertDescription>
      </Alert>
    </div>
  );
};
export default SubscriptionForm;
