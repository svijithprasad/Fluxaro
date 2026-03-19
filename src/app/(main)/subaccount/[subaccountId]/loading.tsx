import { DashboardLoadingSkeleton } from "@/components/global/skeletons";

export default function Loading() {
  return (
    <div className="h-screen w-full p-4">
      <DashboardLoadingSkeleton />
    </div>
  );
}
