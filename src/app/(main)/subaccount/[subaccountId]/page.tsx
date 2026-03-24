import BlurPage from "@/components/global/blur-page";
import CircleProgress from "@/components/global/circle-progress";
import PipelineValue from "@/components/global/pipeline-value";
import SubaccountFunnelChart from "@/components/global/subaccount-funnel-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { AreaChart, BadgeDelta } from "@tremor/react";
import {
  Contact2,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import React from "react";

type Props = {
  params: { subaccountId: string };
  searchParams: {
    code: string;
  };
};

const SubaccountPageId = async ({ params, searchParams }: Props) => {
  let currency = "INR";
  let sessions;
  let totalClosedSessions;
  let totalPendingSessions;
  let net = 0;
  let potentialIncome = 0;
  let closingRate = 0;

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
  });

  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000;
  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000;

  if (!subaccountDetails) return;

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: params.subaccountId },
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
          customer_details: { email: ticket.Customer?.email }, // for Table compatibility
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

  const funnels = await db.funnel.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
    include: {
      FunnelPages: true,
    },
  });

  const funnelPerformanceMetrics = funnels.map((funnel) => ({
    ...funnel,
    totalFunnelVisits: funnel.FunnelPages.reduce(
      (total, page) => total + page.visits,
      0
    ),
  }));

  return (
    <BlurPage>
      <div className="relative h-full">
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
                Total revenue gathered from all closed deals in your pipelines.
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
              <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
            </Card>
            <PipelineValue subaccountId={params.subaccountId} />

            <Card className="xl:w-fit">
              <CardHeader>
                <CardDescription>Conversions</CardDescription>
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
                        <div className="flex flex-col">
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
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-4 flex-col xl:!flex-row">
            <Card className="relative">
              <CardHeader>
                <CardDescription>Funnel Performance</CardDescription>
              </CardHeader>
              <CardContent className=" text-sm text-muted-foreground flex flex-col gap-12 justify-between ">
                <SubaccountFunnelChart data={funnelPerformanceMetrics} />
                <div className="lg:w-[150px]">
                  Total page visits across all funnels. Hover over to get more
                  details on funnel page performance.
                </div>
              </CardContent>
              <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
            </Card>
            <Card className="p-4 flex-1">
              <CardHeader>
                <CardTitle>Closed Deals Activity</CardTitle>
              </CardHeader>
              <AreaChart
                className="text-sm stroke-primary"
                data={sessions || []}
                index="created"
                categories={["amount_total"]}
                colors={["primary"]}
                yAxisWidth={30}
                showAnimation={true}
              />
            </Card>
          </div>
          <div className="flex gap-4 xl:!flex-row flex-col">
            <Card className="p-4 flex-1 h-[450px] overflow-scroll relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Recent Closed Deals
                  <BadgeDelta
                    className="rounded-xl bg-transparent"
                    deltaType="moderateIncrease"
                    isIncreasePositive={true}
                    size="xs"
                  >
                    +12.3%
                  </BadgeDelta>
                </CardTitle>
                <Table>
                  <TableHeader className="!sticky !top-0">
                    <TableRow>
                      <TableHead className="w-[300px]">Client / Deal</TableHead>
                      <TableHead className="w-[200px]">Status</TableHead>
                      <TableHead>Closed Date</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-medium truncate">
                    {totalClosedSessions && totalClosedSessions.length > 0
                      ? totalClosedSessions.map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {session.name} <br/> 
                              <span className="text-xs text-muted-foreground">{session.customer_details?.email || ""}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-500 dark:text-black">
                                Won
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right">
                              <small>{currency}</small>{" "}
                              <span className="text-emerald-500">
                                {session.amount_total}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      : "No Data"}
                  </TableBody>
                </Table>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default SubaccountPageId;
