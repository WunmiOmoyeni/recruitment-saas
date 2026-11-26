"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicantFields } from "@/components/applicant-fields";
import { ui } from "@/components/ui";
import { MAX_CV_BYTES } from "@/lib/cv";

export function NewApplicantForm({
  jobs,
  defaultJobId,
}: {
  jobs: { id: string; title: string; status: string }[];
  defaultJobId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const cv = data.get("cv");
    if (cv instanceof File && cv.size > MAX_CV_BYTES) {
      setError("The CV must be 4 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/applicants", { method: "POST", body: data });
      const json = await res.json().catch(() => null);
      if (!json) {
        setError("Your session may have expired. Please log in again.");
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/applicants/${json.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
      <div>
        <label className={ui.label} htmlFor="jobId">Job *</label>
        <select id="jobId" name="jobId" required className={ui.input} defaultValue={defaultJobId ?? ""}>
          <option value="" disabled>Choose a job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}{j.status !== "OPEN" ? ` (${j.status.toLowerCase()})` : ""}
            </option>
          ))}
        </select>
      </div>
      <ApplicantFields />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
      )}
      <div className="flex gap-3 border-t border-navy-100 pt-5">
        <button type="submit" disabled={busy} className={ui.btnPrimary}>
          {busy ? "Adding…" : "Add candidate"}
        </button>
        <Link href="/applicants" className={ui.btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}
