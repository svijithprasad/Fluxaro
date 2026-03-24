"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Menu, Trash, X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  element: EditorElement;
};

const NavbarComponent = (props: Props) => {
  const { dispatch, state } = useEditor();
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = !Array.isArray(props.element.content)
    ? props.element.content
    : { brandName: "Brand", navLinks: [] };

  const brandName = content.brandName || "Brand";
  const navLinks = content.navLinks || [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Services", href: "#" },
    { label: "Contact", href: "#" },
  ];

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

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "navbar")}
      onClick={handleOnClick}
      className={clsx(
        "w-full relative transition-all",
        {
          "!border-blue-500": isSelected,
          "!border-solid": isSelected,
          "border-dashed border-[1px] border-slate-300": !isLive,
        }
      )}
    >
      {isSelected && !isLive && (
        <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg z-10">
          {props.element.name}
        </Badge>
      )}

      <nav
        style={props.element.styles}
        className="w-full flex items-center justify-between px-6 py-3"
      >
        {/* Brand */}
        <span
          className="text-xl font-bold"
          contentEditable={!isLive}
          suppressContentEditableWarning
          onBlur={(e) => {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    ...content,
                    brandName: e.currentTarget.innerText,
                  },
                },
              },
            });
          }}
        >
          {brandName}
        </span>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={isLive ? link.href : undefined}
              className="text-sm hover:opacity-80 transition-opacity cursor-pointer"
              contentEditable={!isLive}
              suppressContentEditableWarning
              onBlur={(e) => {
                const newLinks = [...navLinks];
                newLinks[i] = { ...newLinks[i], label: e.currentTarget.innerText };
                dispatch({
                  type: "UPDATE_ELEMENT",
                  payload: {
                    elementDetails: {
                      ...props.element,
                      content: {
                        ...content,
                        navLinks: newLinks,
                      },
                    },
                  },
                });
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden p-1 rounded hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (isLive) setMobileOpen(!mobileOpen);
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {(mobileOpen || !isLive) && (
        <div
          className={clsx(
            "md:hidden flex flex-col px-6 pb-4 gap-3",
            { "border-t border-white/10": true },
            { "opacity-50": !isLive && !mobileOpen }
          )}
          style={props.element.styles}
        >
          {!isLive && (
            <span className="text-[10px] text-muted-foreground italic">
              Mobile menu preview (hidden on desktop in live mode)
            </span>
          )}
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={isLive ? link.href : undefined}
              className="text-sm py-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {isSelected && !isLive && (
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

export default NavbarComponent;
