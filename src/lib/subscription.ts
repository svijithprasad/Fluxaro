import { db } from "./db";

/** Tier plan names */
export type PlanType = "FREE" | "BASIC" | "UNLIMITED";

/** Tier limits configuration */
export const TIER_LIMITS: Record<
  PlanType,
  {
    subAccounts: number;
    funnelsPerSubAccount: number;
    pipelinesPerSubAccount: number;
    teamMembers: number;
    mediaUploads: number;
    price: number; // in INR
    label: string;
  }
> = {
  FREE: {
    subAccounts: 3,
    funnelsPerSubAccount: 3,
    pipelinesPerSubAccount: 2,
    teamMembers: 2,
    mediaUploads: 50,
    price: 0,
    label: "Free",
  },
  BASIC: {
    subAccounts: 10,
    funnelsPerSubAccount: 20,
    pipelinesPerSubAccount: 10,
    teamMembers: 5,
    mediaUploads: 500,
    price: 499,
    label: "Basic",
  },
  UNLIMITED: {
    subAccounts: Infinity,
    funnelsPerSubAccount: Infinity,
    pipelinesPerSubAccount: Infinity,
    teamMembers: Infinity,
    mediaUploads: Infinity,
    price: 1999,
    label: "Unlimited",
  },
};

/**
 * Get the subscription for an agency. If none exists, returns a default FREE subscription object.
 */
export const getSubscription = async (agencyId: string) => {
  const subscription = await db.subscription.findUnique({
    where: { agencyId },
  });

  if (!subscription) {
    return {
      id: "",
      plan: "FREE" as PlanType,
      active: true,
      price: null,
      razorpaySubscriptionId: null,
      razorpayCustomerId: null,
      currentPeriodEndDate: null,
      agencyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    ...subscription,
    plan: subscription.plan as PlanType,
  };
};

/**
 * Check if the agency has reached the limit for a given resource.
 * Returns { allowed: boolean; current: number; limit: number; plan: PlanType }
 */
export const checkLimit = async (
  agencyId: string,
  resource: "subAccounts" | "funnelsPerSubAccount" | "pipelinesPerSubAccount" | "teamMembers" | "mediaUploads",
  /** For per-subaccount limits, pass the subAccountId */
  subAccountId?: string
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanType;
}> => {
  const subscription = await getSubscription(agencyId);
  const plan = (subscription?.plan || "FREE") as PlanType;
  const limits = TIER_LIMITS[plan];
  const limit = limits[resource as keyof typeof limits] as number;

  // Unlimited plan always allows
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit, plan };
  }

  let current = 0;

  switch (resource) {
    case "subAccounts": {
      current = await db.subAccount.count({ where: { agencyId } });
      break;
    }
    case "funnelsPerSubAccount": {
      if (!subAccountId) throw new Error("subAccountId required for funnel limit check");
      current = await db.funnel.count({ where: { subAccountId } });
      break;
    }
    case "pipelinesPerSubAccount": {
      if (!subAccountId) throw new Error("subAccountId required for pipeline limit check");
      current = await db.pipeline.count({ where: { subAccountId } });
      break;
    }
    case "teamMembers": {
      current = await db.user.count({ where: { agencyId } });
      break;
    }
    case "mediaUploads": {
      // Count total media across all subaccounts of this agency
      const subAccountIds = await db.subAccount.findMany({
        where: { agencyId },
        select: { id: true },
      });
      current = await db.media.count({
        where: { subAccountId: { in: subAccountIds.map((s) => s.id) } },
      });
      break;
    }
  }

  return {
    allowed: current < limit,
    current,
    limit,
    plan,
  };
};
