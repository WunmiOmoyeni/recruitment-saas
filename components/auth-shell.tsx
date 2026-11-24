import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

// Split-screen layout for log in / sign up: navy brand panel + white form.
export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-navy-500/30 blur-3xl" />
        <Logo light />
        <div className="relative mt-auto">
          <p className="text-3xl font-bold leading-snug">
            “We replaced three spreadsheets and a shared inbox with one pipeline.”
          </p>
          <p className="mt-4 text-sm text-teal-300">The kind of feedback we build for.</p>
          <ul className="mt-10 space-y-3 text-sm text-navy-200">
            {["Branded careers page in minutes", "Drag-and-drop hiring pipeline", "Every candidate scored and tracked"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
          <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-navy-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
