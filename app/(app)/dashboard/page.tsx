import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  STAGE_STYLE,
  ScorePill,
  StageBadge,
  formatDate,
  ui,
} from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { organizationId, role } = await requireRecruitment();
  const tdb = tenantDb(organizationId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [org, modules, stages, openJobs, totalApplicants, newThisWeek, byStage, recent, topJobs] =
    await Promise.all([
      db.organization.findUniqueOrThrow({ where: { id: organizationId } }),
      tdb.organizationModule.findMany({ where: { enabled: true }, include: { module: true } }),
      tdb.pipelineStage.findMany({ orderBy: { position: "asc" } }),
      tdb.job.count({ where: { status: "OPEN" } }),
      tdb.applicant.count(),
      tdb.applicant.count({ where: { createdAt: { gte: weekAgo } } }),
      tdb.applicant.groupBy({ by: ["stageId"], _count: { _all: true } }),
      tdb.applicant.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { job: { select: { title: true } }, stage: true },
      }),
      tdb.job.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { applicants: true } } },
      }),
    ]);

  const countFor = (stageId: string) => byStage.find((g) => g.stageId === stageId)?._count._all ?? 0;
  const hired = stages.filter((s) => s.kind === "HIRED").reduce((n, s) => n + countFor(s.id), 0);
  const interviewing = stages
    .filter((s) => s.kind === "INTERVIEW" || s.kind === "OFFER")
    .reduce((n, s) => n + countFor(s.id), 0);
  const maxStage = Math.max(1, ...stages.map((s) => countFor(s.id)));
  const careersPath = `/apply/${org.slug}`;

  const stats = [
    { label: "Open jobs", value: openJobs, hint: "Accepting applications" },
    { label: "Total applicants", value: totalApplicants, hint: `${newThisWeek} new this week` },
    { label: "Interview & offer", value: interviewing, hint: "Candidates in late stages" },
    { label: "Hired", value: hired, hint: "All time" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back to ${org.name}`}
        subtitle="Here's what's happening across your hiring today."
        actions={
          <>
            <Link href={careersPath} target="_blank" className={ui.btnSecondary}>
              View careers page ↗
            </Link>
            {canManageJobs(role) && (
              <Link href="/jobs/new" className={ui.btnPrimary}>
                + Post a job
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={
              i === 0
                ? "rounded-xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white shadow-sm"
                : "rounded-xl border border-navy-100 bg-white p-5 shadow-sm"
            }
          >
            <p className={i === 0 ? "text-sm text-navy-200" : "text-sm text-navy-500"}>{s.label}</p>
            <p className={i === 0 ? "mt-2 text-3xl font-bold text-teal-300" : "mt-2 text-3xl font-bold text-navy-900"}>
              {s.value}
            </p>
            <p className={i === 0 ? "mt-1 text-xs text-navy-300" : "mt-1 text-xs text-teal-700"}>{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Pipeline overview" action={<Link href="/pipeline" className={`text-xs ${ui.link}`}>Open board →</Link>} className="lg:col-span-3">
          <ul className="space-y-3">
            {stages.map((s) => {
              const n = countFor(s.id);
              return (
                <li key={s.id} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="truncate text-navy-700">{s.name}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-navy-50">
                    <span
                      className={`block h-full rounded-full ${(STAGE_STYLE[s.kind] ?? STAGE_STYLE.CUSTOM).bar}`}
                      style={{ width: `${(n / maxStage) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-semibold text-navy-900">{n}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Your careers page" className="lg:col-span-2">
          <p className="text-sm text-navy-600">
            Share this link — every open job appears here and candidates can apply directly.
          </p>
          <div className="mt-3 rounded-lg bg-teal-50 px-3 py-2 font-mono text-sm text-teal-800 ring-1 ring-teal-100">
            {careersPath}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Enabled modules</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {modules.map((m) => (
                <span key={m.id} className="rounded-full bg-navy-900 px-3 py-1 text-xs font-medium text-teal-200">
                  {m.module.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent applicants" action={<Link href="/applicants" className={`text-xs ${ui.link}`}>View all →</Link>}>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy-400">No applications yet. Share your careers page to get started.</p>
          ) : (
            <ul className="-my-2 divide-y divide-navy-50">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link href={`/applicants/${a.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                    <Avatar name={a.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{a.name}</p>
                      <p className="truncate text-xs text-navy-400">
                        {a.job.title} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <ScorePill score={a.aiScore} />
                    <StageBadge name={a.stage.name} kind={a.stage.kind} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Open jobs" action={<Link href="/jobs" className={`text-xs ${ui.link}`}>Manage →</Link>}>
          {topJobs.length === 0 ? (
            <EmptyState
              title="No open jobs"
              body="Publish a job to start receiving applications."
              action={canManageJobs(role) ? <Link href="/jobs/new" className={ui.btnPrimary}>Post a job</Link> : undefined}
            />
          ) : (
            <ul className="-my-2 divide-y divide-navy-50">
              {topJobs.map((j) => (
                <li key={j.id}>
                  <Link href={`/jobs/${j.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">{j.title}</p>
                      <p className="truncate text-xs text-navy-400">
                        {[j.department, j.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                      {j._count.applicants} applicants
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
