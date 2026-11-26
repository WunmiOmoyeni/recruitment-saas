import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canDeleteApplicants } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { ConfirmSubmit, SubmitButton } from "@/components/confirm-submit";
import {
  Avatar,
  Card,
  STAGE_STYLE,
  ScorePill,
  StageBadge,
  cx,
  formatDate,
  formatDateTime,
  ui,
} from "@/components/ui";
import {
  deleteApplicant,
  moveApplicant,
  rescreenApplicant,
  saveNotes,
  sendApplicantEmail,
} from "../actions";
import { EmailComposer, NotesForm } from "./client-forms";

export const metadata: Metadata = { title: "Candidate" };

const EMAIL_STATUS: Record<string, string> = {
  SENT: "bg-teal-50 text-teal-700",
  LOGGED: "bg-navy-50 text-navy-600",
  FAILED: "bg-red-50 text-red-700",
};

export default async function ApplicantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organizationId, role } = await requireRecruitment();
  const tdb = tenantDb(organizationId);

  const applicant = await tdb.applicant.findUnique({
    where: { id },
    include: { job: true, stage: true },
  });
  if (!applicant) notFound();

  const [stages, history, emails] = await Promise.all([
    tdb.pipelineStage.findMany({ orderBy: { position: "asc" } }),
    tdb.stageHistory.findMany({
      where: { applicantId: applicant.id },
      orderBy: { createdAt: "desc" },
      include: { fromStage: true, toStage: true, changedBy: { select: { name: true } } },
    }),
    tdb.emailLog.findMany({ where: { applicantId: applicant.id }, orderBy: { sentAt: "desc" } }),
  ]);

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
    <div className="space-y-6">
      <Link href="/applicants" className={`text-sm ${ui.link}`}>← All applicants</Link>

      <div className="rounded-xl border border-navy-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={applicant.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{applicant.name}</h1>
              <p className="text-sm text-navy-500">
                Applied for{" "}
                <Link href={`/jobs/${applicant.job.id}`} className={ui.link}>{applicant.job.title}</Link>
                {" · "}
                {formatDate(applicant.createdAt)}
                {" · "}
                {applicant.source === "MANUAL" ? "Added by team" : "Careers page"}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a href={`mailto:${applicant.email}`} className={ui.link}>{applicant.email}</a>
                {applicant.phone && <a href={`tel:${applicant.phone}`} className={ui.link}>{applicant.phone}</a>}
                {applicant.cvPath && (
                  <a href={`/api/cv/${applicant.id}`} className={ui.link}>
                    Download CV ↓
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge name={applicant.stage.name} kind={applicant.stage.kind} />
            {canDeleteApplicants(role) && (
              <form action={deleteApplicant.bind(null, applicant.id)}>
                <ConfirmSubmit message={`Permanently delete ${applicant.name}?`} className={ui.btnDanger}>
                  Delete
                </ConfirmSubmit>
              </form>
            )}
          </div>
        </div>

        {/* Stage stepper: click any stage to move the candidate there */}
        <div className="flex flex-wrap gap-2 border-t border-navy-100 bg-navy-50/50 px-6 py-4">
          <span className="mr-1 self-center text-xs font-semibold uppercase tracking-wide text-navy-400">Move to</span>
          {stages.map((s) => {
            const current = s.id === applicant.stageId;
            return (
              <form key={s.id} action={moveApplicant.bind(null, applicant.id, s.id)}>
                <SubmitButton
                  pendingLabel="Moving…"
                  className={cx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                    current
                      ? "bg-navy-900 text-white"
                      : "bg-white text-navy-700 ring-1 ring-navy-200 hover:ring-teal-400 hover:text-teal-700"
                  )}
                >
                  <span className={cx("h-2 w-2 rounded-full", (STAGE_STYLE[s.kind] ?? STAGE_STYLE.CUSTOM).dot)} />
                  {s.name}
                </SubmitButton>
              </form>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card
            title={<span className="flex items-center gap-2">Keyword match <ScorePill score={applicant.aiScore} /></span>}
            action={
              <form action={rescreenApplicant.bind(null, applicant.id)}>
                <SubmitButton pendingLabel="Scoring…" className={ui.btnSmall}>Re-score</SubmitButton>
              </form>
            }
          >
            {applicant.aiScore != null && (
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-navy-50">
                <div className="h-full rounded-full bg-gradient-to-r from-navy-600 to-teal-500" style={{ width: `${applicant.aiScore}%` }} />
              </div>
            )}
            <p className="text-sm text-navy-700">
              {applicant.aiSummary ?? "Not scored yet. Click Re-score to compare this candidate with the job description."}
            </p>
          </Card>

          <Card title="Experience">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700">
              {applicant.experience || <span className="text-navy-400">No experience summary provided.</span>}
            </p>
          </Card>

          <Card title="CV / résumé">
            {applicant.cvPath ? (
              <a href={`/api/cv/${applicant.id}`} className={ui.btnSecondary}>Download CV</a>
            ) : (
              <p className="text-sm text-navy-400">No CV uploaded.</p>
            )}
            {applicant.cvText && (
              <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-navy-50 p-4 font-mono text-xs leading-relaxed text-navy-800">
                {applicant.cvText}
              </pre>
            )}
          </Card>

          <Card title="Email candidate">
            <EmailComposer action={sendApplicantEmail.bind(null, applicant.id)} />
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Team notes">
            <NotesForm action={saveNotes.bind(null, applicant.id)} notes={applicant.notes} />
          </Card>

          <Card title="Activity">
            <ol className="relative space-y-4 border-l-2 border-teal-100 pl-5">
              {history.map((h) => (
                <li key={h.id} className="relative">
                  <span className={cx("absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white", (STAGE_STYLE[h.toStage.kind] ?? STAGE_STYLE.CUSTOM).dot)} />
                  <p className="text-sm text-navy-800">
                    {h.fromStage ? (
                      <>Moved from <b>{h.fromStage.name}</b> to <b>{h.toStage.name}</b></>
                    ) : (
                      <>Entered pipeline at <b>{h.toStage.name}</b></>
                    )}
                  </p>
                  <p className="text-xs text-navy-400">
                    {h.changedBy?.name ?? "System"} · {formatDateTime(h.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          <Card title={`Emails (${emails.length})`}>
            {emails.length === 0 ? (
              <p className="text-sm text-navy-400">No emails sent yet.</p>
            ) : (
              <ul className="space-y-3">
                {emails.map((e) => (
                  <li key={e.id} className="rounded-lg border border-navy-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-navy-900">{e.subject}</p>
                      <span className={cx("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", EMAIL_STATUS[e.status] ?? EMAIL_STATUS.LOGGED)}>
                        {e.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-navy-500">{e.body}</p>
                    <p className="mt-1 text-[11px] text-navy-400">{formatDateTime(e.sentAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
