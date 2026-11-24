"use server";

import type { JobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageJobs } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { JOB_STATUSES, parseJobForm } from "@/lib/validation/job";

export type FormState = { error?: string; values?: Record<string, string> };

// Every action starts here: logged in? member of this company? module bought?
const authorize = requireRecruitment;

function revalidateJobs() {
  revalidatePath("/jobs", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/apply", "layout");
}

// Keeps what the user typed so the form doesn't wipe itself on an error
function valuesFrom(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export async function createJob(_prev: FormState, formData: FormData): Promise<FormState> {
  const { organizationId, role } = await authorize();
  if (!canManageJobs(role)) return { error: "Only owners and admins can create jobs." };

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(". "),
      values: valuesFrom(formData),
    };
  }

  const job = await tenantDb(organizationId).job.create({
    data: { ...parsed.data, organizationId },
  });

  revalidateJobs();
  redirect(`/jobs/${job.id}`);
}

export async function updateJob(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId, role } = await authorize();
  if (!canManageJobs(role)) return { error: "Only owners and admins can edit jobs." };

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(". "),
      values: valuesFrom(formData),
    };
  }

  const d = parsed.data;
  try {
    // tenantDb adds organizationId to the filter, so another company's job id
    // simply won't be found.
    await tenantDb(organizationId).job.update({
      where: { id, organizationId },
      data: {
        ...d,
        // an emptied box means "clear this field"
        department: d.department ?? null,
        location: d.location ?? null,
        salaryMin: d.salaryMin ?? null,
        salaryMax: d.salaryMax ?? null,
      },
    });
  } catch {
    return { error: "Job not found.", values: valuesFrom(formData) };
  }

  revalidateJobs();
  redirect(`/jobs/${id}`);
}

export async function setJobStatus(id: string, status: string): Promise<void> {
  const { organizationId, role } = await authorize();
  if (!canManageJobs(role)) throw new Error("Forbidden");

  // bound arguments come from the browser, so validate them too
  if (!(JOB_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }

  await tenantDb(organizationId).job.update({
    where: { id, organizationId },
    data: { status: status as JobStatus },
  });
  revalidateJobs();
}

// Deleting a job also deletes its applicants (cascade), so it is owner/admin only.
export async function deleteJob(id: string): Promise<void> {
  const { organizationId, role } = await authorize();
  if (!canManageJobs(role)) throw new Error("Forbidden");

  await tenantDb(organizationId).job.deleteMany({ where: { id } });
  revalidateJobs();
  revalidatePath("/applicants");
  revalidatePath("/pipeline");
  redirect("/jobs");
}