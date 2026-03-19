import Unauthorized from "@/components/unauthorized";
import { SUBACCOUNT_SLUG } from "@/lib/constants";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";

type Props = {
  searchParams: { state: string; code: string };
};

const SubAccountPage = async ({ searchParams }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorized />;
  }

  const user = await getAuthUserDetails();
  if (!user) return;

  const getFirstSubaccountWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  );

  if (searchParams.state) {
    const statePath = searchParams.state.split("___")[0];
    const stateSubaccountId = searchParams.state.split("___")[1];
    if (!stateSubaccountId) return <Unauthorized />;
    return redirect(
      `${SUBACCOUNT_SLUG}/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
    );
  }

  if (getFirstSubaccountWithAccess) {
    return redirect(
      `${SUBACCOUNT_SLUG}/${getFirstSubaccountWithAccess.subAccountId}`
    );
  }
  return <Unauthorized />;
};

export default SubAccountPage;
