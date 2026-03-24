"use client";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import {
  BoxSelect,
  Columns2,
  Columns3,
  Image,
  Link,
  MousePointerClick,
  Minus,
  Type,
  Video,
  Mail,
  CreditCard,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  container: <BoxSelect size={14} />,
  "2Col": <Columns2 size={14} />,
  "3Col": <Columns3 size={14} />,
  video: <Video size={14} />,
  image: <Image size={14} />,
  link: <Link size={14} />,
  button: <MousePointerClick size={14} />,
  separator: <Minus size={14} />,
  contactForm: <Mail size={14} />,
  paymentForm: <CreditCard size={14} />,
  __body: <BoxSelect size={14} />,
};

type LayerItemProps = {
  element: EditorElement;
  depth: number;
};

const LayerItem = ({ element, depth }: LayerItemProps) => {
  const { state, dispatch } = useEditor();
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Array.isArray(element.content) && element.content.length > 0;
  const isSelected = state.editor.selectedElement.id === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  return (
    <div>
      <div
        className={clsx(
          "flex items-center gap-1 py-1 px-2 cursor-pointer rounded-sm text-xs hover:bg-muted/80 transition-colors",
          {
            "bg-primary/10 text-primary font-semibold": isSelected,
          }
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0 hover:text-primary"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="flex-shrink-0">
          {typeIcons[element.type || ""] || <BoxSelect size={14} />}
        </span>
        <span className="truncate">{element.name}</span>
      </div>
      {hasChildren && isExpanded && Array.isArray(element.content) && (
        <div>
          {element.content.map((child) => (
            <LayerItem key={child.id} element={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const LayersTab = () => {
  const { state } = useEditor();

  return (
    <div className="p-4">
      <p className="text-sm font-medium mb-3">Element Layers</p>
      <div className="border rounded-md p-1 max-h-[calc(100vh-300px)] overflow-y-auto">
        {state.editor.elements.map((element) => (
          <LayerItem key={element.id} element={element} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default LayersTab;
