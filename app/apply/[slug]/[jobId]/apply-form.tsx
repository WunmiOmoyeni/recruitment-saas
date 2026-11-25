"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ApplicantFields } from "@/components/applicant-fields";
import { ui } from "@/components/ui";
import type { ApplyState } from "../../actions";

export function ApplyForm({
  action,
  slug,
  jobTitle,
}: {
  action: (prev: ApplyState, formData: FormData) => Promise<ApplyState>;
  slug: string;
  jobTitle: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ApplyState);

  if (state.done) {
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
   <form action={formAction} className="space-y-8">
  <ApplicantFields values={state.values} />

  {/* Honeypot for bots */}
  <div
    aria-hidden="true"
    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
  >
    <label>
      Website
      <input name="website" tabIndex={-1} autoComplete="off" />
    </label>
  </div>

  {state.error && (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
      {state.error}
    </p>
  )}

  <div className="border-t border-navy-100 pt-6">
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-56"
    >
      {pending ? "Submitting…" : "Submit application"}
    </button>

    <p className="mt-4 text-xs text-navy-400">
      Your details are shared only with the hiring team at this company.
    </p>
  </div>
</form>
  );
}
