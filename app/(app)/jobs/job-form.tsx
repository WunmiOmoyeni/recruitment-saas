"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ui } from "@/components/ui";
import type { FormState } from "./actions";

const field = ui.input;
const label = ui.label;

type JobValues = {
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  status: string;
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  job?: JobValues;
  submitLabel: string;
  cancelHref?: string;
};

export function JobForm({ action, job, submitLabel, cancelHref = "/jobs" }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  // After a failed submit, show what the user typed; otherwise show the job's values
  const val = (name: string, fallback: string | number | null | undefined) =>
    state.values?.[name] ?? (fallback == null ? "" : String(fallback));

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
      <div>
        <label className={label} htmlFor="title">Job title</label>
        <input id="title" name="title" className={field} required
          defaultValue={val("title", job?.title)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="department">Department</label>
          <input id="department" name="department" className={field}
            defaultValue={val("department", job?.department)} />
        </div>
        <div>
          <label className={label} htmlFor="location">Location</label>
          <input id="location" name="location" className={field}
            defaultValue={val("location", job?.location)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="employmentType">Employment type</label>
          <select id="employmentType" name="employmentType" className={field}
            defaultValue={val("employmentType", job?.employmentType ?? "FULL_TIME")}>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="status">Status</label>
          <select id="status" name="status" className={field}
            defaultValue={val("status", job?.status ?? "DRAFT")}>
            <option value="DRAFT">Draft (not public)</option>
            <option value="OPEN">Open (accepting applications)</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="salaryMin">Salary from</label>
          <input id="salaryMin" name="salaryMin" type="number" min={0} className={field}
            defaultValue={val("salaryMin", job?.salaryMin)} />
        </div>
        <div>
          <label className={label} htmlFor="salaryMax">Salary to</label>
          <input id="salaryMax" name="salaryMax" type="number" min={0} className={field}
            defaultValue={val("salaryMax", job?.salaryMax)} />
        </div>
        <div>
          <label className={label} htmlFor="salaryCurrency">Currency</label>
          <input id="salaryCurrency" name="salaryCurrency" maxLength={3} className={field}
            defaultValue={val("salaryCurrency", job?.salaryCurrency ?? "NGN")} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="description">Description</label>
        <p className="mb-2 text-xs text-navy-400">Shown on your careers page. Also used to score applicants by keyword match.</p>
        <textarea id="description" name="description" rows={10} className={field} required
          defaultValue={val("description", job?.description)} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{state.error}</p>
      )}

      <div className="flex gap-3 border-t border-navy-100 pt-5">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className={ui.btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}