import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ApplicantError, createApplicantRecord } from "@/lib/applicants";
import { validateCv } from "@/lib/cv";
import { deleteCv, saveCv } from "@/lib/storage";
import { requireRecruitment } from "@/lib/tenant";
import { parseApplicantForm } from "@/lib/validation/applicant";

// Signed-in team members adding a candidate by hand (referral, CV sent by email).
// The organization comes from the session, never from the form.
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const { organizationId, userId } = await requireRecruitment();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Invalid request.", 400);
  }

  const jobId = String(form.get("jobId") ?? "");
  if (!jobId) return fail("Choose a job.", 400);

  const parsed = parseApplicantForm(form);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join(". "), 400);

  // CV is optional here, but if one is attached it gets the same checks.
  let cv: { path: string; type: string } | undefined;
  const file = form.get("cv");
  if (file instanceof File && file.size > 0) {
    const check = await validateCv(file);
    if (!check.ok) return fail(check.error, 400);
    cv = {
      path: await saveCv(`${organizationId}/${randomUUID()}.${check.ext}`, file),
      type: check.contentType,
    };
  }

  try {
    const applicant = await createApplicantRecord({
      organizationId,
      jobId,
      input: parsed.data,
      source: "MANUAL",
      changedById: userId,
      requireOpenJob: false,
      cv,
    });

    revalidatePath("/applicants");
    revalidatePath("/pipeline");
    revalidatePath("/dashboard");
    revalidatePath("/jobs", "layout");
    return NextResponse.json({ ok: true, id: applicant.id });
  } catch (error) {
    if (cv) await deleteCv(cv.path);
    if (error instanceof ApplicantError) return fail(error.message, 400);
    console.error("Could not add candidate", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
