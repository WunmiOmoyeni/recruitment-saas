import type { Metadata } from "next";
import Link from "next/link";
import {Suspense} from "react";
import {redirect } from "next/navigation";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { PageHeader, ui } from "@/components/ui";
import { createJob } from "../actions";
import { JobForm } from "../job-form";

export const metadata: Metadata = { title: "New job" };

export default async function NewJobPage() {
  const { role } = await requireRecruitment();
  if (!canManageJobs(role)) redirect("/jobs");

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
      <Link href="/jobs" className={`text-sm ${ui.link}`}>← Back to jobs</Link>
      <PageHeader
        title="New job"
        subtitle="Save as a draft first, or set the status to Open to publish it on your careers page straight away."
      />
      <JobForm action={createJob} submitLabel="Create job" />
    </div>
    </Suspense>
  );
}
