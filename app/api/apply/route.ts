import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ApplicantError, createApplicantRecord } from "@/lib/applicants";
import { validateCv } from "@/lib/cv";
import { db } from "@/lib/db";
import { hasModule } from "@/lib/modules";
import { deleteCv, saveCv } from "@/lib/storage";
import { parseApplicantForm } from "@/lib/validation/applicant";

// PUBLIC endpoint: anyone on the internet can call it. Validate everything.
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Invalid request.", 400);
  }

  // Honeypot: real people never see or fill this hidden field, bots often do.
  // Pretend it worked so the bot learns nothing.
  if (String(form.get("website") ?? "") !== "") return NextResponse.json({ ok: true });

  const slug = String(form.get("slug") ?? "");
  const jobId = String(form.get("jobId") ?? "");
  if (!slug || !jobId) return fail("Invalid request.", 400);

  const parsed = parseApplicantForm(form);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join(". "), 400);

  if (form.get("consent") !== "on") {
    return fail("Please agree to the data notice to apply.", 400);
  }

  const file = form.get("cv");
  if (!(file instanceof File)) return fail("Please attach your CV.", 400);
  const cv = await validateCv(file);
  if (!cv.ok) return fail(cv.error, 400);

  // Which company? Derived from the slug on the SERVER and checked every time.
  const org = await db.organization.findUnique({ where: { slug }, select: { id: true } });
  if (!org || !(await hasModule(org.id, "RECRUITMENT"))) {
    return fail("This company is not accepting applications right now.", 404);
  }

  // We choose the storage key. The user's filename is never used in a path.
  const cvPath = await saveCv(`${org.id}/${randomUUID()}.${cv.ext}`, file);

  try {
    await createApplicantRecord({
      organizationId: org.id,
      jobId,
      input: parsed.data,
      source: "APPLICATION_SITE",
      changedById: null,
      requireOpenJob: true,
      cv: { path: cvPath, type: cv.contentType },
      consentAt: new Date(),
    });
  } catch (error) {
    await deleteCv(cvPath); // don't leave an orphan file behind
    if (error instanceof ApplicantError) return fail(error.message, 400);
    console.error("Could not save application", error);
    return fail("Something went wrong. Please try again.", 500);
  }

  revalidatePath("/applicants");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
