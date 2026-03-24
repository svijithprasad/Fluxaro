import React from "react";
import { Separator } from "@/components/ui/separator";
import { getSubscription, TIER_LIMITS, PlanType } from "@/lib/subscription";
import PricingCards from "@/components/subscription/pricing-cards";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard } from "lucide-react";
import { db } from "@/lib/db";

type Props = {
  params: { agencyId: string };
};

const page = async ({ params }: Props) => {
  const subscription = await getSubscription(params.agencyId);
  const currentPlan = subscription.plan as PlanType;
  const limits = TIER_LIMITS[currentPlan];

  // Fetch actual usages
  const subAccounts = await db.subAccount.findMany({
    where: { agencyId: params.agencyId },
    select: { id: true },
  });
  const subAccountIds = subAccounts.map((s) => s.id);
  const subAccountCount = subAccounts.length;

  const teamMembersCount = await db.user.count({
    where: { agencyId: params.agencyId },
  });
  
  const mediaUploadsCount = await db.media.count({
    where: { subAccountId: { in: subAccountIds } },
  });

  const funnelsCount = await db.funnel.count({
    where: { subAccountId: { in: subAccountIds } },
  });

  const pipelinesCount = await db.pipeline.count({
    where: { subAccountId: { in: subAccountIds } },
  });

  // For per-sub limits, the total allowed dynamically scales with active subaccounts
  // If they have 0 subaccounts, we just show limits * 1 as a baseline.
  const activeSubsFactor = Math.max(1, subAccountCount);
  const totalFunnelLimit = limits.funnelsPerSubAccount === Infinity ? Infinity : limits.funnelsPerSubAccount * activeSubsFactor;
  const totalPipelineLimit = limits.pipelinesPerSubAccount === Infinity ? Infinity : limits.pipelinesPerSubAccount * activeSubsFactor;

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className="mb-6" />

      <div className="p-4 space-y-8">
        {/* Current Plan Info */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Current Plan
              </h2>
              <p className="text-muted-foreground">
                Manage your subscription and billing
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant={currentPlan === "FREE" ? "secondary" : "default"}
                className="text-sm px-3 py-1 bg-primary text-white"
              >
                {limits.label} Plan
              </Badge>
              {subscription.currentPeriodEndDate && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                  <CalendarDays className="h-3 w-3" />
                  Renews:{" "}
                  {new Date(subscription.currentPeriodEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Usage Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <UsageStat
              label="Sub Accounts"
              current={subAccountCount}
              limit={limits.subAccounts}
            />
            <UsageStat
              label="Funnels (Total)"
              current={funnelsCount}
              limit={totalFunnelLimit}
            />
            <UsageStat
              label="Pipelines (Total)"
              current={pipelinesCount}
              limit={totalPipelineLimit}
            />
            <UsageStat
              label="Team Members"
              current={teamMembersCount}
              limit={limits.teamMembers}
            />
            <UsageStat
              label="Media Uploads"
              current={mediaUploadsCount}
              limit={limits.mediaUploads}
            />
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Upgrade to unlock more features for your agency
          </p>
          <PricingCards
            currentPlan={currentPlan}
            agencyId={params.agencyId}
          />
        </div>
      </div>
    </>
  );
};

function UsageStat({ label, current, limit }: { label: string; current: number; limit: number }) {
  const percentage = limit === Infinity || limit === 0 ? 0 : (current / limit) * 100;
  
  return (
    <div className="rounded-lg border p-4 text-center flex flex-col justify-between shadow-sm bg-background">
      <p className="text-xs md:text-sm text-muted-foreground font-medium">{label}</p>
      <div className="mt-3 flex items-baseline justify-center gap-1 text-primary">
        <span className="text-2xl font-bold leading-none">{current}</span>
        <span className="text-sm text-muted-foreground font-medium">/ {limit === Infinity ? "∞" : limit}</span>
      </div>
      {limit !== Infinity && (
        <div className="w-full bg-secondary rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 ease-in-out" 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default page;
