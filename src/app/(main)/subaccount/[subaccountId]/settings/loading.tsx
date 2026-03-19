import { TeamMemberSkeleton } from "@/components/global/skeletons";

export default function Loading() {
  return (
    <div className="h-screen w-full p-4">
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <TeamMemberSkeleton count={2} />
      </div>
    </div>
  );
}
