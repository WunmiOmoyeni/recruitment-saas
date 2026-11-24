import type { Metadata } from "next";
import Link from "next/link";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import {
  EMPLOYMENT_LABEL,
  EmptyState,
  JobStatusBadge,
  PageHeader,
  cx,
  formatDate,
  formatSalary,
  ui,
} from "@/components/ui";
import { setJobStatus } from "./actions";

export const metadata: Metadata = { title: "Jobs" };

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "DRAFT", label: "Drafts" },
  { key: "CLOSED", label: "Closed" },
] as const;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { organizationId, role } = await requireRecruitment();
  const canManage = canManageJobs(role);
  const { status: rawStatus } = await searchParams;
  const status = FILTERS.some((f) => f.key === rawStatus) ? rawStatus! : "ALL";

  const tdb = tenantDb(organizationId);
  const [jobs, counts] = await Promise.all([
    tdb.job.findMany({
      where: status === "ALL" ? {} : { status: status as "OPEN" | "DRAFT" | "CLOSED" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applicants: true } } },
    }),
    tdb.job.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = (k: string) =>
    k === "ALL"
      ? counts.reduce((n, c) => n + c._count._all, 0)
      : counts.find((c) => c.status === k)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle={`${countOf("ALL")} postings · ${countOf("OPEN")} open`}
        actions={canManage && <Link href="/jobs/new" className={ui.btnPrimary}>+ New job</Link>}
      />

      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-navy-100 sm:inline-flex">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "ALL" ? "/jobs" : `/jobs?status=${f.key}`}
            className={cx(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
              status === f.key ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"
            )}
          >
            {f.label}
            <span className={cx("rounded-full px-1.5 text-xs", status === f.key ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-600")}>
              {countOf(f.key)}
            </span>
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title={status === "ALL" ? "No jobs yet" : "Nothing here"}
          body={canManage ? "Create a job, then publish it to your careers page." : "Your admins haven't posted any jobs yet."}
          action={canManage ? <Link href="/jobs/new" className={ui.btnPrimary}>Create a job</Link> : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-xs uppercase tracking-wide text-navy-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Salary</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Applicants</th>
                <th className="px-4 py-3 font-semibold">Posted</th>
                {canManage && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {jobs.map((job) => (
                <tr key={job.id} className="transition hover:bg-teal-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="font-semibold text-navy-900 hover:text-teal-700">
                      {job.title}
                    </Link>
                    <div className="text-xs text-navy-400">
                      {[job.department, job.location].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy-700">{EMPLOYMENT_LABEL[job.employmentType]}</td>
                  <td className="px-4 py-3 text-navy-700">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </td>
                  <td className="px-4 py-3"><JobStatusBadge status={job.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/applicants?job=${job.id}`} className="font-semibold text-teal-700 hover:underline">
                      {job._count.applicants}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(job.createdAt)}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/jobs/${job.id}/edit`} className={ui.btnSmall}>Edit</Link>
                        {job.status !== "OPEN" && (
                          <form action={setJobStatus.bind(null, job.id, "OPEN")}>
                            <button className="inline-flex items-center rounded-md bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700">
                              {job.status === "DRAFT" ? "Publish" : "Reopen"}
                            </button>
                          </form>
                        )}
                        {job.status === "OPEN" && (
                          <form action={setJobStatus.bind(null, job.id, "CLOSED")}>
                            <button className={ui.btnSmall}>Close</button>
                          </form>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
