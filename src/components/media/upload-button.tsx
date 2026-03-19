"use client";
import { useModal } from "@/providers/modal-provider";
import React from "react";
import { Button } from "../ui/button";
import { UploadCloud } from "lucide-react";
import CustomModal from "../global/custom-modal";
import UploadMediaForm from "../forms/upload-media-form";

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setClose, setOpen } = useModal();
  return (
    <Button
      className="flex gap-4"
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subheading="Upload a file to your media bucket"
          >
            <UploadMediaForm subAccountId={subaccountId} />
          </CustomModal>
        );
      }}
    >
      <UploadCloud size={16} />
      Upload
    </Button>
  );
};

export default MediaUploadButton;
