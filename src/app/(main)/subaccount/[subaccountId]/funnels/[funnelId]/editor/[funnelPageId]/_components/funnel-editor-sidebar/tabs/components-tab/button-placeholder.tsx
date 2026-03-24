import { EditorBtns } from "@/lib/constants";
import { MousePointerClick } from "lucide-react";
import React from "react";

type Props = {};

const ButtonPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "button");
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <MousePointerClick size={40} className="text-muted-foreground" />
    </div>
  );
};

export default ButtonPlaceholder;
