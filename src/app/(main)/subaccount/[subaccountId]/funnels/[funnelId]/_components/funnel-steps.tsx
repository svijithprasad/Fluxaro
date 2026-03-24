"use client";
// import CreateFunnelPage from "@/components/forms/funnel-page";
import CustomModal from "@/components/global/custom-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { upsertFunnelPage } from "@/lib/queries";
import { FunnelsForSubAccount } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { FunnelPage } from "@prisma/client";
import { Check, ExternalLink, LucideEdit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DragDropContext,
  DragStart,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import Link from "next/link";
import FunnelPagePlaceholder from "@/components/icons/funnel-page-placeholder";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FunnelStepCard from "./funnel-step-card";
import CreateFunnelPage from "@/components/forms/funnel-page-form";
import { Separator } from "@/components/ui/separator";
// import FunnelStepCard from "./funnel-step-card";

type Props = {
  funnel: FunnelsForSubAccount;
  subaccountId: string;
  pages: FunnelPage[];
  funnelId: string;
  userRole?: string;
};

const FunnelSteps = ({ funnel, funnelId, pages, subaccountId, userRole }: Props) => {
  const [clickedPage, setClickedPage] = useState<FunnelPage | undefined>(
    pages[0]
  );
  const { setOpen } = useModal();
  const router = useRouter();
  const [pagesState, setPagesState] = useState(pages);

  // Sync local state when pages prop updates (after router.refresh())
  useEffect(() => {
    setPagesState(pages);
    if (pages.length > 0 && !clickedPage) {
      setClickedPage(pages[0]);
    }
  }, [pages, clickedPage]);

  const onDragStart = (event: DragStart) => {
    //current chosen page
    const { draggableId } = event;
    const value = pagesState.find((page) => page.id === draggableId);
  };

  const onDragEnd = (dropResult: DropResult) => {
    const { destination, source } = dropResult;

    //no destination or same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }
    //change state
    const newPageOrder = [...pagesState]
      .toSpliced(source.index, 1)
      .toSpliced(destination.index, 0, pagesState[source.index])
      .map((page, idx) => {
        return { ...page, order: idx };
      });

    setPagesState(newPageOrder);
    newPageOrder.forEach(async (page, index) => {
      try {
        await upsertFunnelPage(
          subaccountId,
          {
            id: page.id,
            order: index,
            name: page.name,
          },
          funnelId,
          page.version
        );
      } catch (error: any) {
        console.log(error);
        try {
          const errData = JSON.parse(error.message);
          if (errData.error === "CONFLICT") {
            toast({
              variant: "destructive",
              title: "Conflict Detected",
              description: errData.message,
            });
            // Reload to get fresh state
            window.location.reload();
            return;
          }
        } catch (e) {}
        toast({
          variant: "destructive",
          title: "Failed",
          description: "Could not save page order",
        });
        return;
      }
    });

    toast({
      title: "Success",
      description: "Saved page order",
    });
  };

  return (
    <AlertDialog>
      <div className="flex border-[1px] lg:!flex-row flex-col ">
        <aside className="flex-[0.3] bg-background p-6  flex flex-col justify-between ">
          <ScrollArea className="h-full ">
            <div className="flex gap-4 items-center">
              <Check />
              Funnel Steps
            </div>
            <Separator className="my-4" />
            {pagesState.length ? (
              userRole === "SUBACCOUNT_GUEST" ? (
                <div className="flex flex-col gap-4">
                  {pagesState.map((page, idx) => (
                    <FunnelStepCard
                      funnelPage={page}
                      index={idx}
                      key={page.id}
                      activePage={page.id === clickedPage?.id}
                      onClick={() => setClickedPage(page)}
                    />
                  ))}
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                  <Droppable
                    droppableId="funnels"
                    direction="vertical"
                    key="funnels"
                  >
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {pagesState.map((page, idx) => (
                          <FunnelStepCard
                            funnelPage={page}
                            index={idx}
                            key={page.id}
                            activePage={page.id === clickedPage?.id}
                            onClick={() => setClickedPage(page)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No Pages
              </div>
            )}
          </ScrollArea>
          {userRole !== "SUBACCOUNT_GUEST" && (
            <Button
              className="mt-4 w-full"
              onClick={() => {
                setOpen(
                  <CustomModal
                    title=" Create or Update a Funnel Page"
                    subheading="Funnel Pages allow you to create step by step processes for customers to follow"
                  >
                    <CreateFunnelPage
                      subaccountId={subaccountId}
                      funnelId={funnelId}
                      order={pagesState.length}
                    />
                  </CustomModal>
                );
              }}
            >
              Create New Steps
            </Button>
          )}
        </aside>
        <aside className="flex-[0.7] bg-muted p-4 ">
          {!!pages.length ? (
            <Card className="h-full flex justify-between flex-col">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Page name</p>
                <CardTitle>{clickedPage?.name}</CardTitle>
                <CardDescription className="flex flex-col gap-4">
                  <div className="border-2 rounded-lg sm:w-80 w-full  overflow-clip">
                    <Link
                      href={`/subaccount/${subaccountId}/funnels/${funnelId}/editor/${clickedPage?.id}`}
                      className="relative group"
                    >
                      <div className="cursor-pointer group-hover:opacity-30 w-full">
                        <FunnelPagePlaceholder />
                      </div>
                      <LucideEdit
                        size={50}
                        className="!text-muted-foreground absolute top-1/2 left-1/2 opacity-0 transofrm -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition-all duration-100"
                      />
                    </Link>

                    <Link
                      target="_blank"
                      href={`${process.env.NEXT_PUBLIC_SCHEME}${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${clickedPage?.pathName}`}
                      className="group flex items-center justify-start p-2 gap-2 hover:text-primary transition-colors duration-200"
                    >
                      <ExternalLink size={15} />
                      <div className="w-64 overflow-hidden overflow-ellipsis ">
                        {process.env.NEXT_PUBLIC_SCHEME}
                        {funnel.subDomainName}.{process.env.NEXT_PUBLIC_DOMAIN}/
                        {clickedPage?.pathName}
                      </div>
                    </Link>
                  </div>

                  <CreateFunnelPage
                    subaccountId={subaccountId}
                    defaultData={clickedPage}
                    funnelId={funnelId}
                    order={clickedPage?.order || 0}
                    userRole={userRole}
                  />
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              Create a page to view page settings.
            </div>
          )}
        </aside>
      </div>
    </AlertDialog>
  );
};

export default FunnelSteps;
