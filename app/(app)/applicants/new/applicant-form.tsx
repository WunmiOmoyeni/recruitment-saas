"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ApplicantFields } from "@/components/applicant-fields";
import { ui } from "@/components/ui";
import { createApplicant, type ActionState } from "../actions";

export function NewApplicantForm({
  jobs,
  defaultJobId,
}: {
  jobs: { id: string; title: string; status: string }[];
  defaultJobId?: string;
}) {
  const [state, action, pending] = useActionState(createApplicant, {} as ActionState);
  const v = state.values ?? {};

  return (
    <form action={action} className="space-y-5 rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
      <div>
        <label className={ui.label} htmlFor="jobId">Job *</label>
        <select id="jobId" name="jobId" required className={ui.input} defaultValue={v.jobId ?? defaultJobId ?? ""}>
          <option value="" disabled>Choose a job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}{j.status !== "OPEN" ? ` (${j.status.toLowerCase()})` : ""}
            </option>
          ))}
        </select>
      </div>
      <ApplicantFields values={v} />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{state.error}</p>
      )}
      <div className="flex gap-3 border-t border-navy-100 pt-5">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Adding…" : "Add candidate"}
        </button>
        <Link href="/applicants" className={ui.btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}
