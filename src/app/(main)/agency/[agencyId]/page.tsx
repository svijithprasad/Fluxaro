import CircleProgress from "@/components/global/circle-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { AreaChart } from "@tremor/react";
import {
  ClipboardIcon,
  Contact2,
  DollarSign,
  Goal,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = async ({
  params,
}: {
  params: { agencyId: string };
  searchParams: { code: string };
}) => {
  let currency = "INR";
  let sessions;
  let totalClosedSessions;
  let totalPendingSessions;
  let net = 0;
  let potentialIncome = 0;
  let closingRate = 0;
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000;
  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
  });

  if (!agencyDetails) return;

  const subaccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
  });

  const pipelines = await db.pipeline.findMany({
    where: { SubAccount: { agencyId: params.agencyId } },
    include: {
      Lane: {
        orderBy: { order: "asc" },
        include: {
          Tickets: {
            include: { Customer: true }
          }
        }
      }
    }
  });

  let allTickets = 0;
  totalClosedSessions = [] as any[];
  totalPendingSessions = [] as any[];

  pipelines.forEach((pipeline) => {
    const lanes = pipeline.Lane;
    if (lanes.length === 0) return;
    
    // The last lane is designated as the "Won/Closed" lane
    const lastLaneId = lanes[lanes.length - 1].id;

    lanes.forEach((lane) => {
      lane.Tickets.forEach((ticket) => {
        allTickets++;
        const value = Number(ticket.value || 0);
        
        const mappedTicket = {
          id: ticket.id,
          name: ticket.name,
          created: new Date(ticket.createdAt).toLocaleDateString(),
          updatedAt: ticket.updatedAt,
          amount_total: value, // for AreaChart compatibility
          status: lane.id === lastLaneId ? "complete" : "open",
          customer_details: { email: ticket.Customer?.email },
        };

        if (lane.id === lastLaneId) {
          totalClosedSessions.push(mappedTicket);
          net += value;
        } else {
          totalPendingSessions.push(mappedTicket);
          potentialIncome += value;
        }
      });
    });
  });

  totalClosedSessions.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  sessions = [...totalClosedSessions, ...totalPendingSessions].sort(
    (a: any, b: any) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  closingRate = allTickets
    ? +((totalClosedSessions.length / allTickets) * 100).toFixed(2)
    : 0;

  return (
    <div className="relative h-full">
      <h1 className="text-4xl">Dashboard</h1>
      <Separator className=" my-6" />
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex gap-4 flex-col xl:!flex-row">
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Income</CardDescription>
              <CardTitle className="text-4xl">
                {net ? `${currency} ${net.toFixed(2)}` : `₹0.00`}
              </CardTitle>
              <small className="text-xs text-muted-foreground">
                For the year {currentYear}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Total revenue gathered from all closed deals in subaccount pipelines.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Potential Income</CardDescription>
              <CardTitle className="text-4xl">
                {potentialIncome
                  ? `${currency} ${potentialIncome.toFixed(2)}`
                  : `₹0.00`}
              </CardTitle>
              <small className="text-xs text-muted-foreground">
                For the year {currentYear}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This is how much you can close.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Active Clients</CardDescription>
              <CardTitle className="text-4xl">{subaccounts.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reflects the number of sub accounts you own and manage.
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardTitle>Agency Goal</CardTitle>
              <CardDescription>
                <p className="mt-2">
                  Reflects the number of sub accounts you want to own and
                  manage.
                </p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Current: {subaccounts.length}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Goal: {agencyDetails.goal}
                  </span>
                </div>
                <Progress
                  value={(subaccounts.length / agencyDetails.goal) * 100}
                />
              </div>
            </CardFooter>
            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>
        <div className="flex gap-4 xl:!flex-row flex-col">
          <Card className="p-4 flex-1">
            <CardHeader>
              <CardTitle>Closed Deals Activity</CardTitle>
            </CardHeader>
            <AreaChart
              className="text-sm stroke-primary"
              data={totalClosedSessions || []}
              index="created"
              categories={["amount_total"]}
              colors={["primary"]}
              yAxisWidth={30}
              showAnimation={true}
            />
          </Card>
          <Card className="xl:w-[400px] w-full">
            <CardHeader>
              <CardTitle>Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <CircleProgress
                value={closingRate}
                description={
                  <>
                    {sessions && (
                      <div className="flex flex-col">
                        Total Deals Created
                        <div className="flex gap-2">
                          <ShoppingCart className="text-rose-700" />
                          {sessions.length}
                        </div>
                      </div>
                    )}
                    {totalClosedSessions && (
                      <div className="felx flex-col">
                        Won Deals
                        <div className="flex gap-2">
                          <ShoppingCart className="text-emerald-700" />
                          {totalClosedSessions.length}
                        </div>
                      </div>
                    )}
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
