"use client";
import CreateLaneForm from "@/components/forms/lane-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteLane, saveActivityLogsNotification } from "@/lib/queries";
import { LaneDetail, TicketWithTags } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/modal-provider";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Edit, MoreVertical, PlusCircleIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import CustomModal from "@/components/global/custom-modal";
import TicketForm from "@/components/forms/ticket-form";
import PipelineTicket from "./pipeline-ticket";

interface PipelaneLaneProps {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
  allTickets: TicketWithTags;
  tickets: TicketWithTags;
  pipelineId: string;
  laneDetails: LaneDetail;
  subaccountId: string;
  index: number;
  userRole?: string;
}

const PipelineLane: React.FC<PipelaneLaneProps> = ({
  setAllTickets,
  tickets,
  pipelineId,
  laneDetails,
  subaccountId,
  allTickets,
  index,
  userRole,
}) => {
  const { setOpen } = useModal();
  const router = useRouter();

  const amt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
  });

  const laneAmt = useMemo(() => {
    return tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );
  }, [tickets]);

  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`;

  const addNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets([...allTickets, ticket]);
  };

  const handleCreateTicket = () => {
    setOpen(
      <CustomModal
        title="Create A Ticket"
        subheading="Tickets are a great way to keep track of tasks"
      >
        <TicketForm
          key={new Date().getTime()}
          getNewTicket={addNewTicket}
          laneId={laneDetails.id}
          subaccountId={subaccountId}
        />
      </CustomModal>
    );
  };

  const handleEditLane = () => {
    setOpen(
      <CustomModal title="Edit Lane Details" subheading="">
        <CreateLaneForm pipelineId={pipelineId} defaultData={laneDetails} />
      </CustomModal>
    );
  };

  const handleDeleteLane = async () => {
    try {
      const response = await deleteLane(laneDetails.id);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a lane | ${response?.name}`,
        subaccountId,
      });
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Draggable
      draggableId={laneDetails.id.toString()}
      index={index}
      key={laneDetails.id}
      isDragDisabled={userRole === "SUBACCOUNT_GUEST"}
    >
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={cn(
            "h-full flex-shrink-0 transition-transform duration-200",
            snapshot.isDragging && "rotate-[2deg] scale-[1.02] shadow-xl"
          )}
        >
          <AlertDialog>
            <DropdownMenu>
              <div className="bg-slate-200/30 dark:bg-background/20 h-[700px] w-[300px] px-4 relative rounded-lg overflow-visible flex-shrink-0">
                {/* Lane Header - Drag Handle */}
                <div
                  {...provided.dragHandleProps}
                  className="h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60 absolute top-0 left-0 right-0 z-10 rounded-t-lg cursor-grab active:cursor-grabbing transition-all hover:bg-slate-200/80 dark:hover:bg-background/60"
                >
                  <div className="h-full flex items-center p-4 justify-between border-b-[1px]">
                    <div className="flex items-center w-full gap-2">
                      <div
                        className={cn("w-4 h-4 rounded-full")}
                        style={{ background: randomColor }}
                      />
                      <span className="font-bold text-sm">
                        {laneDetails.name}
                      </span>
                    </div>
                    <div className="flex items-center flex-row">
                      <Badge className="bg-white text-black">
                        {amt.format(laneAmt)}
                      </Badge>
                      {userRole !== "SUBACCOUNT_GUEST" && (
                        <DropdownMenuTrigger>
                          <MoreVertical className="text-muted-foreground cursor-pointer" />
                        </DropdownMenuTrigger>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ticket Droppable Area */}
                <Droppable
                  droppableId={laneDetails.id.toString()}
                  key={laneDetails.id}
                  type="ticket"
                  isDropDisabled={userRole === "SUBACCOUNT_GUEST"}
                >
                  {(droppableProvided, droppableSnapshot) => (
                    <div
                      {...droppableProvided.droppableProps}
                      ref={droppableProvided.innerRef}
                      className={cn(
                        "max-h-[630px] overflow-y-auto no-scrollbar pt-16 pb-2 min-h-[200px] transition-colors duration-200 rounded-b-lg",
                        droppableSnapshot.isDraggingOver &&
                          "bg-slate-100/50 dark:bg-slate-800/20"
                      )}
                    >
                      {tickets.map((ticket, index) => (
                        <PipelineTicket
                          allTickets={allTickets}
                          setAllTickets={setAllTickets}
                          subAccountId={subaccountId}
                          ticket={ticket}
                          key={ticket.id.toString()}
                          index={index}
                          laneId={laneDetails.id}
                          userRole={userRole}
                        />
                      ))}
                      {droppableProvided.placeholder}
                      {droppableSnapshot.isDraggingOver && tickets.length === 0 && (
                        <div className="mx-2 my-2 h-[100px] rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center animate-pulse">
                          <span className="text-xs text-muted-foreground">
                            Drop here
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Trash size={15} />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={handleEditLane}
                  >
                    <Edit size={15} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={handleCreateTicket}
                  >
                    <PlusCircleIcon size={15} />
                    Create Ticket
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </div>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive"
                    onClick={handleDeleteLane}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </DropdownMenu>
          </AlertDialog>
        </div>
      )}
    </Draggable>
  );
};

export default PipelineLane;
