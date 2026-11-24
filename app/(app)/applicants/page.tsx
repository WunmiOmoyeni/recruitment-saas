import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import {
  Avatar,
  EmptyState,
  PageHeader,
  ScorePill,
  StageBadge,
  formatDate,
  ui,
} from "@/components/ui";

export const metadata: Metadata = { title: "Applicants" };

const SORTS = {
  newest: { label: "Newest first", orderBy: { createdAt: "desc" } },
  oldest: { label: "Oldest first", orderBy: { createdAt: "asc" } },
  score: { label: "Best match", orderBy: { aiScore: { sort: "desc", nulls: "last" } } },
  name: { label: "Name A–Z", orderBy: { name: "asc" } },
} satisfies Record<string, { label: string; orderBy: Prisma.ApplicantOrderByWithRelationInput }>;

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; job?: string; stage?: string; sort?: string }>;
}) {
  const { organizationId } = await requireRecruitment();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const sortKey = (sp.sort && sp.sort in SORTS ? sp.sort : "newest") as keyof typeof SORTS;

  const where: Prisma.ApplicantWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (sp.job) where.jobId = sp.job;
  if (sp.stage) where.stageId = sp.stage;

  const tdb = tenantDb(organizationId);
  const [applicants, jobs, stages, total] = await Promise.all([
    tdb.applicant.findMany({
      where,
      orderBy: [SORTS[sortKey].orderBy, { createdAt: "desc" }],
      take: 200,
      include: { job: { select: { id: true, title: true } }, stage: true },
    }),
    tdb.job.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    tdb.pipelineStage.findMany({ orderBy: { position: "asc" } }),
    tdb.applicant.count(),
  ]);
  const filtered = Boolean(q || sp.job || sp.stage);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        subtitle={filtered ? `${applicants.length} matching of ${total}` : `${total} candidates across all jobs`}
        actions={<Link href="/applicants/new" className={ui.btnPrimary}>+ Add candidate</Link>}
      />

      <form className="grid gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Search name or email…" className={ui.input} />
        <select name="job" defaultValue={sp.job ?? ""} className={ui.input}>
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <select name="stage" defaultValue={sp.stage ?? ""} className={ui.input}>
          <option value="">All stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select name="sort" defaultValue={sortKey} className={ui.input}>
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className={ui.btnNavy}>Filter</button>
          {filtered && <Link href="/applicants" className={ui.btnSecondary}>Clear</Link>}
        </div>
      </form>

      {applicants.length === 0 ? (
        <EmptyState
          title={filtered ? "No candidates match these filters" : "No applicants yet"}
          body={filtered ? "Try clearing a filter." : "Applications from your careers page will appear here."}
          action={<Link href="/applicants/new" className={ui.btnPrimary}>Add a candidate</Link>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-xs uppercase tracking-wide text-navy-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Stage</th>
                <th className="px-4 py-3 font-semibold">Match</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {applicants.map((a) => (
                <tr key={a.id} className="transition hover:bg-teal-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/applicants/${a.id}`} className="flex items-center gap-3">
                      <Avatar name={a.name} size="sm" />
                      <span>
                        <span className="block font-semibold text-navy-900 hover:text-teal-700">{a.name}</span>
                        <span className="block text-xs text-navy-400">{a.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${a.job.id}`} className="text-navy-700 hover:text-teal-700">{a.job.title}</Link>
                  </td>
                  <td className="px-4 py-3"><StageBadge name={a.stage.name} kind={a.stage.kind} /></td>
                  <td className="px-4 py-3"><ScorePill score={a.aiScore} /></td>
                  <td className="px-4 py-3 text-xs text-navy-500">
                    {a.source === "MANUAL" ? "Added by team" : "Careers page"}
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
