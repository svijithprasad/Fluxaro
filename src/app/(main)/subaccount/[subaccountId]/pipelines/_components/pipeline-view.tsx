"use client";
import React, { useEffect, useState } from "react";

import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from "@/lib/types";
import { Lane, Ticket } from "@prisma/client";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Flag, Plus } from "lucide-react";
import CustomModal from "@/components/global/custom-modal";
import LaneForm from "@/components/forms/lane-form";
import PipelineLane from "./pipeline-lane";
import { toast } from "@/components/ui/use-toast";

type Props = {
  lanes: LaneDetail[];
  pipelineId: string;
  subaccountId: string;
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
  updateLanesOrder: (lanes: Lane[]) => Promise<void>;
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>;
  userRole?: string;
};

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
  userRole,
}: Props) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([]);

  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  const ticketsFromAllLanes: TicketAndTags[] = [];
  lanes.forEach((lane) => {
    lane.Tickets.forEach((ticket) => {
      ticketsFromAllLanes.push(ticket);
    });
  });

  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes);

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title="Create a Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    );
  };

  const onDragEnd = async (dropResult: DropResult) => {
    console.log("Drop Result:", dropResult);
    const { destination, source, type } = dropResult;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    switch (type) {
      case "lane": {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => {
            return { ...lane, order: idx };
          });
        setAllLanes(newLanes);
        try {
          await updateLanesOrder(newLanes);
        } catch (error: any) {
          try {
            const errData = JSON.parse(error.message);
            if (errData.error === "CONFLICT") {
              toast({
                variant: "destructive",
                title: "Conflict Detected",
                description: errData.message,
              });
              router.refresh();
            }
          } catch (e) {}
        }
        break;
      }
      case "ticket": {
        const newLanes = [...allLanes];
        const originLane = newLanes.find(
          (lane) => lane.id === source.droppableId
        );
        const destinationLane = newLanes.find(
          (lane) => lane.id === destination.droppableId
        );

        if (!originLane || !destinationLane) {
          console.error("Origin or destination lane not found");
          return;
        }

        if (source.droppableId === destination.droppableId) {
          const newOrderedTickets = [...originLane.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map((item, idx) => {
              return { ...item, order: idx };
            });
          originLane.Tickets = newOrderedTickets;
          setAllLanes(newLanes);
          try {
            await updateTicketsOrder(newOrderedTickets);
          } catch (error: any) {
            try {
              const errData = JSON.parse(error.message);
              if (errData.error === "CONFLICT") {
                toast({
                  variant: "destructive",
                  title: "Conflict Detected",
                  description: errData.message,
                });
                router.refresh();
              }
            } catch (e) {}
          }
          router.refresh();
        } else {
          const [currentTicket] = originLane.Tickets.splice(source.index, 1);

          originLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          const movedTicket = {
            ...currentTicket,
            laneId: destination.droppableId,
          };

          destinationLane.Tickets.splice(destination.index, 0, movedTicket);

          destinationLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          setAllLanes(newLanes);

          const ticketsToUpdate = [
            ...destinationLane.Tickets,
            ...originLane.Tickets,
          ];
          try {
            await updateTicketsOrder(ticketsToUpdate);
          } catch (error: any) {
            try {
              const errData = JSON.parse(error.message);
              if (errData.error === "CONFLICT") {
                toast({
                  variant: "destructive",
                  title: "Conflict Detected",
                  description: errData.message,
                });
                router.refresh();
              }
            } catch (e) {}
          }
          router.refresh();
        }
        break;
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          {userRole !== "SUBACCOUNT_GUEST" && (
            <Button className="flex items-center gap-4" onClick={handleAddLane}>
              <Plus size={16} />
              Create Lane
            </Button>
          )}
        </div>

        <Droppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
          key={"lanes"}
          isDropDisabled={userRole === "SUBACCOUNT_GUEST"}
        >
          {(provided, snapshot) => (
            <div
              className={`flex items-start gap-x-2 overflow-x-auto no-scrollbar mt-4 py-2 transition-colors duration-200 rounded-lg ${
                snapshot.isDraggingOver
                  ? "bg-slate-100/80 dark:bg-slate-800/30"
                  : ""
              }`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {allLanes.map((lane, index) => (
                <PipelineLane
                  key={lane.id}
                  allTickets={allTickets}
                  index={index}
                  laneDetails={lane}
                  pipelineId={pipelineId}
                  tickets={lane.Tickets}
                  setAllTickets={setAllTickets}
                  subaccountId={subaccountId}
                  userRole={userRole}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {allLanes.length === 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag
                width={"100%"}
                height={"100%"}
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default PipelineView;
