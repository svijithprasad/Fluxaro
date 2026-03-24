import BlurPage from "@/components/global/blur-page";
import MediaComponent from "@/components/media";
import { getAuthUserDetails, getMedia } from "@/lib/queries";
import React from "react";

type Props = {
  params: { subaccountId: string };
};

const MediaPage = async ({ params }: Props) => {
  const data = await getMedia(params.subaccountId);
  const user = await getAuthUserDetails();

  return (
    <BlurPage>
      <MediaComponent data={data} subAccountId={params.subaccountId} userRole={user?.role} />
    </BlurPage>
  );
};

export default MediaPage;
