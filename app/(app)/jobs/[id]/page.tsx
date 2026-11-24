import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  Avatar,
  Card,
  EMPLOYMENT_LABEL,
  EmptyState,
  JobStatusBadge,
  STAGE_STYLE,
  ScorePill,
  StageBadge,
  formatDate,
  formatSalary,
  ui,
} from "@/components/ui";
import { deleteJob, setJobStatus } from "../actions";

export const metadata: Metadata = { title: "Job" };

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organizationId, role } = await requireRecruitment();
  const canManage = canManageJobs(role);
  const tdb = tenantDb(organizationId);

  const job = await tdb.job.findUnique({ where: { id } });
  if (!job) notFound();

  const [org, stages, applicants] = await Promise.all([
    db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { slug: true } }),
    tdb.pipelineStage.findMany({ orderBy: { position: "asc" } }),
    tdb.applicant.findMany({
      where: { jobId: job.id },
      orderBy: [{ aiScore: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      include: { stage: true },
    }),
  ]);
  const publicUrl = `/apply/${org.slug}/${job.id}`;

  return (
    <div className="space-y-6">
      <Link href="/jobs" className={`text-sm ${ui.link}`}>← All jobs</Link>

      <div className="overflow-hidden rounded-xl bg-navy-900 text-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="mt-2 text-sm text-navy-200">
              {[job.department, job.location, EMPLOYMENT_LABEL[job.employmentType]].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-sm font-medium text-teal-300">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/jobs/${job.id}/edit`} className="rounded-lg border border-navy-600 px-3 py-1.5 text-sm font-medium text-white hover:border-teal-400">
                Edit
              </Link>
              {job.status !== "OPEN" ? (
                <form action={setJobStatus.bind(null, job.id, "OPEN")}>
                  <button className="rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-400">
                    {job.status === "DRAFT" ? "Publish" : "Reopen"}
                  </button>
                </form>
              ) : (
                <form action={setJobStatus.bind(null, job.id, "CLOSED")}>
                  <button className="rounded-lg border border-navy-600 px-3 py-1.5 text-sm font-medium text-white hover:border-teal-400">
                    Close
                  </button>
                </form>
              )}
              <form action={deleteJob.bind(null, job.id)}>
                <ConfirmSubmit
                  message={`Delete "${job.title}" and all ${applicants.length} of its applicants? This cannot be undone.`}
                  className="rounded-lg border border-red-400/50 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </ConfirmSubmit>
              </form>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 border-t border-navy-700 sm:grid-cols-6">
          {stages.map((s) => (
            <div key={s.id} className="border-r border-navy-700 px-4 py-3 last:border-r-0">
              <p className="flex items-center gap-1.5 text-xs text-navy-300">
                <span className={`h-2 w-2 rounded-full ${(STAGE_STYLE[s.kind] ?? STAGE_STYLE.CUSTOM).dot}`} />
                {s.name}
              </p>
              <p className="text-lg font-bold">{applicants.filter((a) => a.stageId === s.id).length}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={`Applicants (${applicants.length})`}
            action={<Link href={`/pipeline?job=${job.id}`} className={`text-xs ${ui.link}`}>Open in pipeline →</Link>}
          >
            {applicants.length === 0 ? (
              <EmptyState
                title="No applicants yet"
                body={job.status === "OPEN" ? "Share the public link to start receiving applications." : "Publish this job so candidates can apply."}
                action={<Link href={`/applicants/new?job=${job.id}`} className={ui.btnSecondary}>Add a candidate manually</Link>}
              />
            ) : (
              <ul className="-my-2 divide-y divide-navy-50">
                {applicants.map((a) => (
                  <li key={a.id}>
                    <Link href={`/applicants/${a.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                      <Avatar name={a.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy-900">{a.name}</p>
                        <p className="truncate text-xs text-navy-400">{a.email} · {formatDate(a.createdAt)}</p>
                      </div>
                      <ScorePill score={a.aiScore} />
                      <StageBadge name={a.stage.name} kind={a.stage.kind} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Description">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{job.description}</div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Public application link">
            {job.status === "OPEN" ? (
              <>
                <p className="text-sm text-navy-600">Candidates can apply at:</p>
                <Link href={publicUrl} target="_blank" className="mt-2 block break-all rounded-lg bg-teal-50 px-3 py-2 font-mono text-xs text-teal-800 ring-1 ring-teal-100 hover:bg-teal-100">
                  {publicUrl} ↗
                </Link>
              </>
            ) : (
              <p className="text-sm text-navy-500">
                This job is <b>{job.status.toLowerCase()}</b>, so it is hidden from your careers page.
              </p>
            )}
          </Card>
          <Card title="Details">
            <dl className="space-y-2 text-sm">
              {[
                ["Department", job.department ?? "—"],
                ["Location", job.location ?? "—"],
                ["Type", EMPLOYMENT_LABEL[job.employmentType]],
                ["Posted", formatDate(job.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-navy-400">{k}</dt>
                  <dd className="text-right font-medium text-navy-800">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
