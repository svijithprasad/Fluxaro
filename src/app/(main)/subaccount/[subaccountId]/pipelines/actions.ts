"use server";

import { db } from "@/lib/db";
import { Lane, Ticket } from "@prisma/client";

export const updateLanesOrderAction = async (lanes: Lane[]) => {
  try {
    // Optimistic concurrency check for each lane
    for (const lane of lanes) {
      const current = await db.lane.findUnique({
        where: { id: lane.id },
        select: { version: true },
      });
      if (current && current.version !== lane.version) {
        throw new Error(
          JSON.stringify({
            error: "CONFLICT",
            message:
              "Lane order was modified by another user. Please refresh and try again.",
          })
        );
      }
    }

    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: { id: lane.id },
        data: { order: lane.order, version: { increment: 1 } } as any,
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Lane Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Lane 🔴", error.message);
    throw error;
  }
};

export const updateTicketsOrderAction = async (tickets: Ticket[]) => {
  try {
    // Optimistic concurrency check for each ticket
    for (const ticket of tickets) {
      const current = await db.ticket.findUnique({
        where: { id: ticket.id },
        select: { version: true },
      });
      if (current && current.version !== ticket.version) {
        throw new Error(
          JSON.stringify({
            error: "CONFLICT",
            message:
              "Ticket order was modified by another user. Please refresh and try again.",
          })
        );
      }
    }

    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: { id: ticket.id },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
          version: { increment: 1 },
        } as any,
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Tickets Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Ticket 🔴", error.message);
    throw error;
  }
};
