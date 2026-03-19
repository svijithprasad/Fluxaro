"use client";
import { PricesList } from "@/lib/types";

type Props = {
  prices: PricesList["data"];
  customerId: string;
  planExists: boolean;
};

const SubscriptionHelper = ({ customerId, planExists, prices }: Props) => {
  // ⚠️ DISABLED: Stripe subscription helper has been removed
  // This component no longer handles subscription upgrades

  return <div><!-- Subscription functionality is disabled --></div>;
};

export default SubscriptionHelper;
