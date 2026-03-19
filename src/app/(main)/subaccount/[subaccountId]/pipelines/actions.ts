"use server";

import { db } from "@/lib/db";
import { Lane, Ticket } from "@prisma/client";

export const updateLanesOrderAction = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: { id: lane.id },
        data: { order: lane.order },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Lane Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Lane 🔴", error.message);
  }
};

export const updateTicketsOrderAction = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: { id: ticket.id },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Tickets Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Ticket 🔴", error.message);
  }
};
