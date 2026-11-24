import Link from "next/link";
import type { ReactNode } from "react";

// Header/footer for the public careers site, branded with the client's name.
export function PublicShell({ orgName, slug, children }: { orgName: string; slug: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-navy-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href={`/apply/${slug}`} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-base font-bold text-white">
              {orgName[0]?.toUpperCase()}
            </span>
            <span className="text-lg font-semibold text-white">{orgName}</span>
          </Link>
          <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-medium text-teal-200">Careers</span>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-navy-100 bg-white py-6 text-center text-xs text-navy-400">
        Hiring powered by <Link href="/" className="font-semibold text-navy-700">Recruit<span className="text-teal-600">Flow</span></Link>
      </footer>
    </div>
  );
}
