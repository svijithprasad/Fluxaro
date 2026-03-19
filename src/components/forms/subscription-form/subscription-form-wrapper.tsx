"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  // ⚠️ DISABLED: Stripe subscription functionality has been removed
  // All features are now accessible without payment

  return (
    <div className="p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Disabled:</strong> All subscription features have been removed. 
          All application features are now accessible without payment.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SubscriptionFormWrapper;
