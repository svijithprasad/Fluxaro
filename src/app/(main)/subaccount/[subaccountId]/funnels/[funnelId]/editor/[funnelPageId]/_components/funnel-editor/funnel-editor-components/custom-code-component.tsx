"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Code, Trash } from "lucide-react";
import React from "react";

type Props = {
  element: EditorElement;
};

const CustomCodeComponent = (props: Props) => {
  const { dispatch, state } = useEditor();

  const content = !Array.isArray(props.element.content)
    ? props.element.content
    : { code: "" };

  const code = content.code || "";

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

  const isSelected = state.editor.selectedElement.id === props.element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;

  // In live/preview mode, render the raw HTML
  if (isLive) {
    return (
      <div
        style={props.element.styles}
        dangerouslySetInnerHTML={{ __html: code }}
      />
    );
  }

  // In editor mode, show the code in a styled preview box
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "customCode")}
      onClick={handleOnClick}
      className={clsx(
        "p-[2px] w-full m-[5px] relative transition-all",
        {
          "!border-blue-500": isSelected,
          "!border-solid": isSelected,
          "border-dashed border-[1px] border-slate-300": true,
        }
      )}
    >
      {isSelected && (
        <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg z-10">
          {props.element.name}
        </Badge>
      )}

      <div
        style={props.element.styles}
        className="w-full bg-muted/50 rounded-md overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b text-xs text-muted-foreground">
          <Code size={14} />
          <span className="font-medium">Custom Code Embed</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    ...content,
                    code: e.target.value,
                  },
                },
              },
            });
          }}
          placeholder="Paste your HTML / CSS / JS here..."
          className="w-full min-h-[120px] p-3 bg-transparent text-xs font-mono resize-y outline-none"
          spellCheck={false}
        />
      </div>

      {isSelected && (
        <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
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

export default CustomCodeComponent;
