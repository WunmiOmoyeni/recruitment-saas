"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

const ICONS: Record<string, string> = {
  dashboard: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
  jobs: "M4 7h16v12H4zM9 7V5h6v2",
  applicants: "M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 19v-1a4 4 0 00-3-3.87M16 3.13a3.5 3.5 0 010 6.75",
  pipeline: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z",
};

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/applicants", label: "Applicants", icon: "applicants" },
  { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function SideNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  if (mobile) {
    return (
      <nav className="flex gap-1 overflow-x-auto px-3 py-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cx(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
              isActive(l.href) ? "bg-teal-500 text-white" : "text-navy-200 hover:bg-navy-800"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="mt-6 flex flex-col gap-1 px-3">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Workspace</p>
      {LINKS.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cx(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active ? "bg-teal-500/15 text-white" : "text-navy-200 hover:bg-navy-800 hover:text-white"
            )}
          >
            <span className={cx("h-5 w-1 rounded-full", active ? "bg-teal-400" : "bg-transparent")} />
            <svg viewBox="0 0 24 24" className={cx("h-5 w-5", active ? "text-teal-300" : "text-navy-400 group-hover:text-teal-300")} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[l.icon]} />
            </svg>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
