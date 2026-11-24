"use client";

import Link from "next/link";
import { ui } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-navy-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">!</div>
      <h1 className="mt-4 text-lg font-semibold text-navy-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-navy-500">
        {error.message === "Forbidden"
          ? "You don't have permission to do that. Ask an owner or admin."
          : "We couldn't complete that request. Please try again."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={reset} className={ui.btnPrimary}>Try again</button>
        <Link href="/dashboard" className={ui.btnSecondary}>Dashboard</Link>
      </div>
    </div>
  );
}
