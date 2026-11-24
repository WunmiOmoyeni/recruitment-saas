"use server";

import { revalidatePath } from "next/cache";
import { ApplicantError, createApplicantRecord } from "@/lib/applicants";
import { db } from "@/lib/db";
import { parseApplicantForm } from "@/lib/validation/applicant";

export type ApplyState = { error?: string; done?: boolean; values?: Record<string, string> };

function valuesFrom(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/**
 * Public, unauthenticated. The organization is resolved from the slug in the
 * URL (bound on the server), never from a hidden form field.
 */
export async function submitApplication(
  slug: string,
  jobId: string,
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  // Honeypot: real people never see or fill this field.
  if (String(formData.get("website") ?? "") !== "") return { done: true };

  const org = await db.organization.findUnique({ where: { slug }, select: { id: true } });
  if (!org) return { error: "This company could not be found." };

  const mod = await db.organizationModule.findUnique({
    where: { organizationId_moduleKey: { organizationId: org.id, moduleKey: "RECRUITMENT" } },
  });
  if (!mod || !mod.enabled || (mod.expiresAt && mod.expiresAt < new Date())) {
    return { error: "This company is not accepting applications right now." };
  }

  const parsed = parseApplicantForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(". "), values: valuesFrom(formData) };
  }

  try {
    await createApplicantRecord({
      organizationId: org.id,
      jobId,
      input: parsed.data,
      source: "APPLICATION_SITE",
      changedById: null,
      requireOpenJob: true,
    });
  } catch (e) {
    if (e instanceof ApplicantError) return { error: e.message, values: valuesFrom(formData) };
    throw e;
  }

  revalidatePath("/applicants");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { done: true };
}
