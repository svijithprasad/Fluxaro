"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pricingCards } from "@/lib/constants";
import { Check, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { PlanType } from "@/lib/subscription";
import { downgradeSubscription } from "@/lib/queries";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  currentPlan: PlanType;
  agencyId: string;
};

const PricingCards = ({ currentPlan, agencyId }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === currentPlan) return;

    const isDowngrade =
      (currentPlan === "UNLIMITED" && planName !== "UNLIMITED") ||
      (currentPlan === "BASIC" && planName === "FREE");

    if (isDowngrade) {
      setLoading(planName);
      try {
        const result = await downgradeSubscription(agencyId, planName as "FREE" | "BASIC" | "UNLIMITED");
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Successfully downgraded to ${planName} Plan! Refreshing...`);
          setTimeout(() => {
            router.refresh();
          }, 2000);
        }
      } catch (error) {
        toast.error("Downgrade failed. Please try again.");
      } finally {
        setLoading(null);
      }
      return;
    }

    if (planName === "FREE") return;

    setLoading(planName);

    try {
      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          planId: planName, // The actual Razorpay plan_id should be mapped server-side
          planName,
          amount: planName === "BASIC" ? 49900 : 199900, // paise
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to create subscription");
        setLoading(null);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Fluxaro",
        description: `${planName} Plan Subscription`,
        handler: function () {
          toast.success("Subscription activated! Refreshing...");
          setTimeout(() => {
            router.refresh();
          }, 2000);
        },
        theme: {
          color: "#6C63FF",
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-center items-stretch">
      {pricingCards.map((card) => {
        const isCurrentPlan = card.planName === currentPlan;
        const isDowngrade =
          (currentPlan === "UNLIMITED" && card.planName !== "UNLIMITED") ||
          (currentPlan === "BASIC" && card.planName === "FREE");
        const isUpgrade = !isCurrentPlan && !isDowngrade;

        return (
          <Card
            key={card.planName}
            className={`flex flex-col justify-between w-full lg:w-1/3 relative ${
              isCurrentPlan
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            {isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </span>
              </div>
            )}

            <CardHeader className="pt-8">
              <CardTitle className="flex items-center gap-2">
                {card.title}
                {card.planName === "UNLIMITED" && (
                  <Zap className="h-5 w-5 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{card.price}</span>
                {card.duration && (
                  <span className="text-muted-foreground">/{card.duration}</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {card.highlight}
              </p>
              <ul className="space-y-2">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : isUpgrade ? "default" : "secondary"}
                disabled={isCurrentPlan || loading !== null}
                onClick={() => handleSubscribe(card.planName)}
              >
                {loading === card.planName ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan
                  ? "Current Plan"
                  : isDowngrade
                  ? "Downgrade / Cancel"
                  : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default PricingCards;
