"use client";
import Loading from "@/components/global/loading";
import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/queries";
import { GetMediaFiles } from "@/lib/types";
import React, { Suspense, useEffect, useState } from "react";

type Props = {
  subaccountId: string;
};

const MediaBucketTab = (props: Props) => {
  const [data, setdata] = useState<GetMediaFiles>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMedia(props.subaccountId);
      setdata(response);
    };
    fetchData();
  }, [props.subaccountId]);

  return (
    <div className=" overflow-scroll no-scrollbar p-4">
      <Suspense fallback={<Loading />}>
        <MediaComponent data={data} subAccountId={props.subaccountId} />
      </Suspense>
    </div>
  );
};

export default MediaBucketTab;
