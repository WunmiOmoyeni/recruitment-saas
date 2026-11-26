import type { Metadata } from "next";
import {Suspense} from "react";
import Link from "next/link";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { EmptyState, PageHeader, ui } from "@/components/ui";
import { NewApplicantForm } from "./applicant-form";

export const metadata: Metadata = { title: "Add candidate" };

export default async function NewApplicantPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { organizationId } = await requireRecruitment();
  const { job } = await searchParams;
  const jobs = await tenantDb(organizationId).job.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, status: true },
  });

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
      <Link href="/applicants" className={`text-sm ${ui.link}`}>← Back to applicants</Link>
      <PageHeader
        title="Add a candidate"
        subtitle="For referrals or CVs that arrived outside your careers page. They start in the first pipeline stage."
      />
      {jobs.length === 0 ? (
        <EmptyState title="Create a job first" body="Candidates are always attached to a job." action={<Link href="/jobs/new" className={ui.btnPrimary}>New job</Link>} />
      ) : (
        <NewApplicantForm jobs={jobs} defaultJobId={jobs.some((j) => j.id === job) ? job : undefined} />
      )}
    </div>
    </Suspense>
  );
}
