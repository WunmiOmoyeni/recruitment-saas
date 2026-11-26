import type { Metadata } from "next";
import { Suspense } from "react"; 
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { PageHeader, ui } from "@/components/ui";
import { updateJob } from "../../actions";
import { JobForm } from "../../job-form";

export const metadata: Metadata = { title: "Edit job" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId, role } = await requireRecruitment();
  if (!canManageJobs(role)) redirect(`/jobs/${id}`);

  // scoped to this company: another company's job id returns null here
  const job = await tenantDb(organizationId).job.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
            </div>
          }
        >
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/jobs/${job.id}`} className={`text-sm ${ui.link}`}>← Back to job</Link>
      <PageHeader title="Edit job" subtitle={job.title} />
      <JobForm
        action={updateJob.bind(null, job.id)}
        job={job}
        submitLabel="Save changes"
        cancelHref={`/jobs/${job.id}`}
      />
    </div>
    </Suspense>
  );
}
