import { getAuthUserDetails, getFunnels } from "@/lib/queries";
import React from "react";
import { Plus } from "lucide-react";
import FunnelsDataTable from "./data-table";
import { columns } from "./columns";
import FunnelForm from "@/components/forms/funnel-form";
import BlurPage from "@/components/global/blur-page";

const Funnels = async ({ params }: { params: { subaccountId: string } }) => {
  const funnels = await getFunnels(params.subaccountId);
  const user = await getAuthUserDetails();
  if (!funnels) return null;

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          user?.role !== "SUBACCOUNT_GUEST" ? (
            <>
              <Plus size={15} />
              Create Funnel
            </>
          ) : null
        }
        modalChildren={<FunnelForm subAccountId={params.subaccountId} />}
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  );
};

export default Funnels;
