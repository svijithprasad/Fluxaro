import { EditorBtns } from "@/lib/constants";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {};

const CheckoutPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };
  return (
    <div
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "paymentForm");
      }}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center flex-col gap-1"
    >
      <CreditCard size={24} className="text-muted-foreground" />
    </div>
  );
};

export default CheckoutPlaceholder;
