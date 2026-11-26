"use client";

import Link from "next/link";
import { useState } from "react";
import { ApplicantFields } from "@/components/applicant-fields";
import { ui } from "@/components/ui";
import { MAX_CV_BYTES } from "@/lib/cv";

export function ApplyForm({
  slug,
  jobId,
  jobTitle,
  companyName,
}: {
  slug: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const cv = data.get("cv");
    if (!(cv instanceof File) || cv.size === 0) {
      setError("Please attach your CV.");
      return;
    }
    if (cv.size > MAX_CV_BYTES) {
      setError("Your CV must be 4 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Application sent!</h2>
        <p className="mt-2 text-sm text-navy-600">
          Thanks for applying for <b>{jobTitle}</b>. The team will review your application and get back to you by email.
        </p>
        <Link href={`/apply/${slug}`} className={`mt-6 ${ui.btnSecondary}`}>See other roles</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="jobId" value={jobId} />

      <ApplicantFields requireCv />

      <label className="flex items-start gap-2.5 text-sm text-navy-600">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
        />
        <span>
          I agree that {companyName} may store and process my application and CV for recruitment purposes.
        </span>
      </label>

      {/* Honeypot for bots: hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit application"}
      </button>
      <p className="text-center text-xs text-navy-400">
        Your details are shared only with the hiring team at this company.
      </p>
    </form>
  );
}
