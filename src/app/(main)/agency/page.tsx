import AgencyDetails from "@/components/forms/agency-details";
import Navigation from "@/components/site/navigation";
import { SUBACCOUNT_SLUG } from "@/lib/constants";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan?: string; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();

  console.log("AGENCY ID: ", agencyId);

  // Get Users details
  const user = await getAuthUserDetails();

  if (agencyId) {
    if (user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER") {
      return redirect(SUBACCOUNT_SLUG);
    } else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyID = searchParams.state.split("___")[1];

        if (!stateAgencyID) {
          return <div>NOT AUTHORIZED</div>;
        }

        return redirect(
          `/agency/${stateAgencyID}/${statePath}?code=${searchParams.code}`
        );
      } else return redirect(`/agency/${agencyId}`);
    } else {
      return <div>NOT AUTHORIZED</div>;
    }
  }

  const authUser = await currentUser();

  return (
    <>
      <Navigation />
      <div className="flex justify-center items-center mt-4 bg-muted">
        <div>
          <h1 className="text-4xl my-8">Create An Agency</h1>
          <AgencyDetails />
        </div>
      </div>
    </>
  );
};

export default Page;
