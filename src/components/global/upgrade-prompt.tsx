"use client";

import { useRouter } from "next/navigation";
import CustomModal from "./custom-modal";
import { Button } from "../ui/button";
import { Zap } from "lucide-react";
import { useModal } from "@/providers/modal-provider";

type Props = {
  resource: string;
  current: number;
  limit: number;
  plan: string;
  agencyId: string;
};

const UpgradePrompt = ({
  resource,
  current,
  limit,
  plan,
  agencyId,
}: Props) => {
  const router = useRouter();
  const { setClose } = useModal();

  return (
    <CustomModal
      title="Upgrade Required"
      subheading="You've reached your usage limit for this plan."
    >
      <div className="flex flex-col items-center justify-center space-y-4 py-6">
        <div className="bg-yellow-100 p-4 rounded-full">
          <Zap className="h-10 w-10 text-yellow-500" />
        </div>
        <p className="text-center text-muted-foreground">
          You&apos;ve reached the maximum limit for <strong>{resource}</strong> on your{" "}
          <strong>{plan}</strong> plan.
        </p>
        <div className="bg-card w-full p-4 rounded-lg flex justify-between items-center border">
          <span className="font-semibold">{resource} Usage:</span>
          <span className="text-xl font-bold">
            {current} / {limit}
          </span>
        </div>
        <div className="flex flex-col gap-3 w-full mt-4">
          <Button
            className="w-full font-bold"
            size="lg"
            onClick={() => {
              setClose();
              router.push(`/agency/${agencyId}/billing`);
            }}
          >
            Upgrade Plan
          </Button>
          <Button variant="outline" className="w-full" onClick={setClose}>
            Cancel
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default UpgradePrompt;
