"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApplicantError, createApplicantRecord } from "@/lib/applicants";
import { db } from "@/lib/db";
import { fillTemplate, sendEmail } from "@/lib/email";
import { canDeleteApplicants } from "@/lib/permissions";
import { screenApplicant } from "@/lib/screening";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { emailSchema, parseApplicantForm } from "@/lib/validation/applicant";

export type ActionState = { error?: string; ok?: string; values?: Record<string, string> };

function valuesFrom(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function revalidateApplicants(id?: string) {
  revalidatePath("/applicants");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  revalidatePath("/jobs", "layout");
  if (id) revalidatePath(`/applicants/${id}`);
}

/** Add a candidate by hand (e.g. a referral or a CV that came in by email). */
export async function createApplicant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { organizationId, userId } = await requireRecruitment();

  const jobId = String(formData.get("jobId") ?? "");
  const parsed = parseApplicantForm(formData);
  if (!jobId) return { error: "Choose a job.", values: valuesFrom(formData) };
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(". "), values: valuesFrom(formData) };
  }

  let id: string;
  try {
    const applicant = await createApplicantRecord({
      organizationId,
      jobId,
      input: parsed.data,
      source: "MANUAL",
      changedById: userId,
      requireOpenJob: false,
    });
    id = applicant.id;
  } catch (e) {
    if (e instanceof ApplicantError) return { error: e.message, values: valuesFrom(formData) };
    throw e;
  }

  revalidateApplicants();
  redirect(`/applicants/${id}`);
}

/** Move a candidate to another stage and record who did it. */
export async function moveApplicant(applicantId: string, toStageId: string): Promise<void> {
  const { organizationId, userId } = await requireRecruitment();
  const tdb = tenantDb(organizationId);

  // Both ids come from the browser: confirm each belongs to this organization.
  const [applicant, stage] = await Promise.all([
    tdb.applicant.findUnique({ where: { id: applicantId }, select: { id: true, stageId: true } }),
    tdb.pipelineStage.findUnique({ where: { id: toStageId }, select: { id: true } }),
  ]);
  if (!applicant || !stage) throw new Error("Not found");
  if (applicant.stageId === stage.id) return;

  await db.$transaction([
    db.applicant.updateMany({
      where: { id: applicant.id, organizationId },
      data: { stageId: stage.id },
    }),
    db.stageHistory.create({
      data: {
        organizationId,
        applicantId: applicant.id,
        fromStageId: applicant.stageId,
        toStageId: stage.id,
        changedById: userId,
      },
    }),
  ]);

  revalidateApplicants(applicant.id);
}

export async function moveApplicantForm(applicantId: string, formData: FormData): Promise<void> {
  await moveApplicant(applicantId, String(formData.get("stageId") ?? ""));
}

export async function saveNotes(applicantId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { organizationId } = await requireRecruitment();
  const notes = String(formData.get("notes") ?? "").slice(0, 20000);

  const res = await tenantDb(organizationId).applicant.updateMany({
    where: { id: applicantId },
    data: { notes },
  });
  if (res.count === 0) return { error: "Applicant not found." };

  revalidatePath(`/applicants/${applicantId}`);
  return { ok: "Notes saved" };
}

/** Re-run keyword screening (e.g. after the job description changed). */
export async function rescreenApplicant(applicantId: string): Promise<void> {
  const { organizationId } = await requireRecruitment();
  const tdb = tenantDb(organizationId);
  const a = await tdb.applicant.findUnique({ where: { id: applicantId }, include: { job: true } });
  if (!a) throw new Error("Not found");

  const { score, summary } = screenApplicant(a.job, a);
  await tdb.applicant.updateMany({ where: { id: a.id }, data: { aiScore: score, aiSummary: summary } });
  revalidateApplicants(a.id);
}

export async function sendApplicantEmail(
  applicantId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { organizationId } = await requireRecruitment();
  const tdb = tenantDb(organizationId);

  const parsed = emailSchema.safeParse({ subject: formData.get("subject"), body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(". "), values: valuesFrom(formData) };
  }

  const a = await tdb.applicant.findUnique({
    where: { id: applicantId },
    include: { job: { select: { title: true } }, organization: { select: { name: true } } },
  });
  if (!a) return { error: "Applicant not found." };

  const vars = { name: a.name.split(/\s+/)[0] ?? a.name, job: a.job.title, company: a.organization.name };
  const subject = fillTemplate(parsed.data.subject, vars);
  const body = fillTemplate(parsed.data.body, vars);
  const status = await sendEmail({ to: a.email, subject, body });

  await tdb.emailLog.create({
    data: { organizationId, applicantId: a.id, to: a.email, subject, body, status },
  });
  revalidatePath(`/applicants/${a.id}`);

  if (status === "FAILED") return { error: "The email provider rejected the message. It was logged as failed." };
  return {
    ok: status === "SENT" ? `Email sent to ${a.email}` : "No email provider configured — message logged (see server console).",
  };
}

export async function deleteApplicant(applicantId: string): Promise<void> {
  const { organizationId, role } = await requireRecruitment();
  if (!canDeleteApplicants(role)) throw new Error("Forbidden");

  await tenantDb(organizationId).applicant.deleteMany({ where: { id: applicantId } });
  revalidateApplicants();
  redirect("/applicants");
}
