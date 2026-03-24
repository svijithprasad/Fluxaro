"use client";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { EditorBtns } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import clsx from "clsx";
import { Trash, CreditCard, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

type Props = {
  element: EditorElement;
};

const Checkout = (props: Props) => {
  const { dispatch, state, subaccountId, funnelId, pageDetails } = useEditor();
  const router = useRouter();
  const styles = props.element.styles;

  const paymentButtonId = !Array.isArray(props.element.content)
    ? props.element.content.paymentButtonId
    : "";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Inject the Razorpay Payment Button script securely
    if (formRef.current && paymentButtonId) {
      formRef.current.innerHTML = ""; // Clear existing
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", paymentButtonId as string);
      script.async = true;
      formRef.current.appendChild(script);
    }
  }, [paymentButtonId, state.editor.liveMode]);

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
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
      payload: { elementDetails: props.element },
    });
  };

  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, "contactForm")}
      onClick={handleOnClickBody}
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
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      <div className="border-none transition-all w-full">
        <div className="flex flex-col gap-4 w-full">
          {!paymentButtonId ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 bg-muted/20 rounded-md">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                <strong>Razorpay Checkout</strong>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2 max-w-[250px]">
                {state.editor.liveMode 
                  ? "Checkout is unavailable (missing Payment Button ID)." 
                  : "Click here to select, then paste your Razorpay Payment Button ID in the Settings tab."}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full min-h-[50px]">
              <form ref={formRef}></form>
              {!state.editor.liveMode && (
                <div className="absolute inset-0 bg-transparent z-10" /> 
              )}
            </div>
          )}
        </div>
      </div>

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

export default Checkout;
