import React from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  params: { agencyId: string };
};

const page = async ({ params }: Props) => {
  // ⚠️ DISABLED: All payment and billing features have been removed
  // Stripe integration and subscription management are no longer available

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Payment Feature Disabled:</strong> All payment and billing features have been removed from this application. 
            All features are now accessible for free. 
            Contact support if you have any questions.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};

export default page;
