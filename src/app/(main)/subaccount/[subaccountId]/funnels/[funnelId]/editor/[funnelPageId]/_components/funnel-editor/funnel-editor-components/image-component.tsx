"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import { parseCssToReactStyles } from "@/lib/css-parser";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React from "react";
import Image from "next/image";

type Props = {
  element: EditorElement;
};

const ImageComponent = (props: Props) => {
  const { dispatch, state } = useEditor();

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const rawStyles = props.element.styles;
  const customCssOverrides = !Array.isArray(props.element.content)
    ? parseCssToReactStyles(props.element.content.customCss || "")
    : {};
  const styles = { ...rawStyles, ...customCssOverrides };

  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, "image")}
      onClick={handleOnClick}
      className={clsx(
        "p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,
          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {!Array.isArray(props.element.content) && (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={props.element.content.src || ""}
            alt="builder image"
            width={typeof props.element.styles.width === "number" ? props.element.styles.width : 560}
            height={typeof props.element.styles.height === "number" ? props.element.styles.height : 315}
            className="object-contain"
          />
        </div>
      )}

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default ImageComponent;
