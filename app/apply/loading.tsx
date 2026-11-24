import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Skeleton rows={4} />
    </div>
  );
}
