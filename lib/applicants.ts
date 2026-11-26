import { Prisma } from "@prisma/client";
import { tenantDb } from "@/lib/tenant-db";
import { screenApplicant } from "@/lib/screening";
import type { ApplicantInput } from "@/lib/validation/applicant";

export class ApplicantError extends Error {}

/**
 * Creates an applicant in the organization's first ("Applied") stage, runs the
 * keyword screening and writes the first audit-trail entry. Used by both the
 * public careers page and the "add candidate" form.
 *
 * `cv` is the already-saved CV file (see lib/storage.ts). If this function
 * throws, the CALLER must delete that file again.
 */
export async function createApplicantRecord(opts: {
  organizationId: string;
  jobId: string;
  input: ApplicantInput;
  source: "APPLICATION_SITE" | "MANUAL";
  changedById: string | null;
  requireOpenJob: boolean;
  cv?: { path: string; type: string };
  consentAt?: Date;
}) {
  const tdb = tenantDb(opts.organizationId);

  const job = await tdb.job.findUnique({ where: { id: opts.jobId } });
  if (!job) throw new ApplicantError("That job could not be found.");
  if (opts.requireOpenJob && job.status !== "OPEN") {
    throw new ApplicantError("This job is no longer accepting applications.");
  }

  const duplicate = await tdb.applicant.findFirst({
    where: { jobId: job.id, email: opts.input.email },
    select: { id: true },
  });
  if (duplicate) throw new ApplicantError("An application with this email already exists for this job.");

  const firstStage =
    (await tdb.pipelineStage.findFirst({ where: { kind: "APPLIED" }, orderBy: { position: "asc" } })) ??
    (await tdb.pipelineStage.findFirst({ orderBy: { position: "asc" } }));
  if (!firstStage) throw new ApplicantError("This company's hiring pipeline is not set up yet.");

  const { score, summary } = screenApplicant(job, opts.input);

  const applicant = await tdb.applicant
    .create({
      data: {
        organizationId: opts.organizationId,
        jobId: job.id,
        stageId: firstStage.id,
        name: opts.input.name,
        email: opts.input.email,
        phone: opts.input.phone,
        experience: opts.input.experience,
        portfolioUrl: opts.input.portfolioUrl,
        cvPath: opts.cv?.path,
        cvType: opts.cv?.type,
        cvText: opts.input.cvText,
        consentAt: opts.consentAt,
        source: opts.source,
        aiScore: score,
        aiSummary: summary,
      },
    })
    .catch((e: unknown) => {
      // Two people submitting at the same moment can slip past the check above;
      // the database's unique constraint is the final guard.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ApplicantError("An application with this email already exists for this job.");
      }
      throw e;
    });

  await tdb.stageHistory.create({
    data: {
      organizationId: opts.organizationId,
      applicantId: applicant.id,
      fromStageId: null,
      toStageId: firstStage.id,
      changedById: opts.changedById,
    },
  });

  return applicant;
}