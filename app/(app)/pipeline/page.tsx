import type { Metadata } from "next";
import Link from "next/link";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { PageHeader, ui } from "@/components/ui";
import { PipelineBoard } from "./board";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { organizationId } = await requireRecruitment();
  const { job } = await searchParams;
  const tdb = tenantDb(organizationId);

  const [stages, jobs, applicants] = await Promise.all([
    tdb.pipelineStage.findMany({ orderBy: { position: "asc" } }),
    tdb.job.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true } }),
    tdb.applicant.findMany({
      where: job ? { jobId: job } : {},
      orderBy: [{ aiScore: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: 500,
      select: { id: true, name: true, stageId: true, aiScore: true, createdAt: true, job: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        subtitle="Drag candidates between stages, or use the arrows on each card. Every move is recorded."
        actions={<Link href="/applicants/new" className={ui.btnPrimary}>+ Add candidate</Link>}
      />

      <form className="flex flex-wrap items-center gap-2">
        <select name="job" defaultValue={job ?? ""} className={`${ui.input} max-w-xs`}>
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}{j.status !== "OPEN" ? ` (${j.status.toLowerCase()})` : ""}
            </option>
          ))}
        </select>
        <button className={ui.btnNavy}>Show</button>
        {job && <Link href="/pipeline" className={ui.btnSecondary}>Clear</Link>}
      </form>

      <PipelineBoard
        key={job ?? "all"}
        stages={stages.map((s) => ({ id: s.id, name: s.name, kind: s.kind }))}
        cards={applicants.map((a) => ({
          id: a.id,
          name: a.name,
          jobTitle: a.job.title,
          stageId: a.stageId,
          aiScore: a.aiScore,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
