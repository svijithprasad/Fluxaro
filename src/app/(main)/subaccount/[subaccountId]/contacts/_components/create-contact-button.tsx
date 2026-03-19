"use client";

import ContactUserForm from "@/components/forms/contact-user-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { Plus } from "lucide-react";
import React from "react";

type Props = {
  subAccountId: string;
};

const CreateContactButton = ({ subAccountId }: Props) => {
  const { setOpen } = useModal();

  const handleCreateContact = () => {
    setOpen(
      <CustomModal
        title="Create Or Update Contact information"
        subheading="Contacts are like customers."
      >
        <ContactUserForm subaccountId={subAccountId} />
      </CustomModal>
    );
  };

  return (
    <Button className="flex gap-2" onClick={handleCreateContact}>
      <Plus size={16} />
      Create Contact
    </Button>
  );
};

export default CreateContactButton;
