"use client";
import { Alert, AlertDescription } from "@/components/ui/card";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PricesList } from "@/lib/types";
import { AlertCircle } from "lucide-react";

type Props = {
  features: string[];
  buttonCta: string;
  title: string;
  description: string;
  amt: string;
  duration: string;
  highlightTitle: string;
  highlightDescription: string;
  customerId: string;
  prices: PricesList["data"];
  planExists: boolean;
};

const PricingCards = (props: Props) => {
  // ⚠️ DISABLED: Pricing card functionality has been removed
  // Stripe payment management is no longer available

  return (
    <Card className="flex flex-col justify-between lg:w-1/2">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {props.highlightTitle}
              </p>
              <p className="text-sm text-yellow-700">
                {props.highlightDescription}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCards;
