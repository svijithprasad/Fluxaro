import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Dashboard metric card skeleton - matches DashboardCard layout
 */
export const DashboardCardSkeleton = () => (
  <Card className="flex-1 relative">
    <CardHeader>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

/**
 * Chart skeleton - for area charts and graphs
 */
export const ChartSkeleton = () => (
  <Card className="p-4 flex-1">
    <CardHeader>
      <Skeleton className="h-6 w-40 mb-4" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-[200px] w-full" />
      <div className="flex justify-between gap-2">
        <Skeleton className="flex-1 h-4" />
        <Skeleton className="flex-1 h-4" />
        <Skeleton className="flex-1 h-4" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Table skeleton - for data tables with multiple rows
 */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card className="p-4 flex-1">
    <CardHeader>
      <Skeleton className="h-6 w-40 mb-4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="flex-1 h-4" />
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="flex-1 h-4" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Team member/user item skeleton
 */
export const TeamMemberSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

/**
 * Funnel list item skeleton
 */
export const FunnelListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
      </Card>
    ))}
  </div>
);

/**
 * Contact list skeleton
 */
export const ContactListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    ))}
  </div>
);

/**
 * Pipeline/Kanban board skeleton
 */
export const PipelineSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {Array.from({ length: 3 }).map((_, colIndex) => (
      <div key={colIndex} className="min-w-[300px] space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 4 }).map((_, cardIndex) => (
          <Card key={cardIndex} className="p-3">
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </Card>
        ))}
      </div>
    ))}
  </div>
);

/**
 * Media gallery skeleton
 */
export const MediaGallerySkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="aspect-square rounded-lg" />
    ))}
  </div>
);

/**
 * Dashboard metrics row skeleton - for agency/subaccount dashboards
 */
export const DashboardMetricsSkeletons = () => (
  <div className="flex gap-4 flex-col xl:!flex-row mb-6">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>
);

/**
 * Full dashboard loading state with multiple skeleton sections
 */
export const DashboardLoadingSkeleton = () => (
  <div className="space-y-6 p-4">
    {/* Metrics row */}
    <DashboardMetricsSkeletons />

    {/* Charts row */}
    <div className="flex gap-4 flex-col xl:!flex-row">
      <ChartSkeleton />
      <div className="xl:w-[400px] w-full">
        <Card className="p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-full" />
        </Card>
      </div>
    </div>

    {/* Table row */}
    <TableSkeleton rows={3} />
  </div>
);
