import React from "react";

import { Funnel } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthUserDetails } from "@/lib/queries";

import FunnelForm from "@/components/forms/funnel-form";

interface FunnelSettingsProps {
  subaccountId: string;
  defaultData: Funnel;
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  defaultData,
}) => {
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  });

  const user = await getAuthUserDetails();

  if (!subaccountDetails) return null;

  return (
    <div className="flex gap-4 flex-col xl:flex-row">
      <FunnelForm subAccountId={subaccountId} defaultData={defaultData} userRole={user?.role} />
    </div>
  );
};

export default FunnelSettings;
