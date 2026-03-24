import { getAuthUserDetails } from "@/lib/queries";
import { getSubscription } from "@/lib/subscription";
import { AgencySidebarOption, SubAccountSidebarOption } from "@prisma/client";
import { off } from "process";
import React from "react";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;

  if (!user.Agency) return;

  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  if (!details) return;

  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!isWhiteLabeledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  let sidebarOpt: (AgencySidebarOption | SubAccountSidebarOption)[] =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];

  if (type === "agency") {
    const hasBilling = sidebarOpt.find((opt) => opt.name === "Billing");
    if (!hasBilling) {
      sidebarOpt = [
        ...sidebarOpt,
        {
          id: "billing-tab-fallback",
          name: "Billing",
          link: `/agency/${user.Agency.id}/billing`,
          icon: "payment",
          agencyId: user.Agency.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  }

  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  const subscription = await getSubscription(user.Agency.id);
  const planMode = subscription?.plan || "FREE";

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
        planMode={type === "agency" ? planMode : undefined}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
        planMode={type === "agency" ? planMode : undefined}
      />
    </>
  );
};

export default Sidebar;
