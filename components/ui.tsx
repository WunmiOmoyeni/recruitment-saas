// Shared, theme-aware building blocks. Teal = action, navy = structure.
import Link from "next/link";
import type { ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const ui = {
  input:
    "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:bg-navy-50",
  label: "mb-1.5 block text-sm font-medium text-navy-800",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50",
  btnNavy:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-800 shadow-sm transition hover:border-teal-400 hover:text-teal-700 disabled:opacity-50",
  btnSmall:
    "inline-flex items-center justify-center rounded-md border border-navy-200 bg-white px-2.5 py-1 text-xs font-medium text-navy-700 transition hover:border-teal-400 hover:text-teal-700",
  btnDanger:
    "inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50",
  card: "rounded-xl border border-navy-100 bg-white shadow-sm",
  link: "font-medium text-teal-700 underline-offset-2 hover:underline",
};

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className }: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(ui.card, className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-semibold text-navy-900">{title}</p>
      {body && <p className="mt-1 text-sm text-navy-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-teal-50 text-teal-700 ring-teal-600/20",
  DRAFT: "bg-navy-50 text-navy-600 ring-navy-500/20",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};
const STATUS_LABEL: Record<string, string> = { OPEN: "Open", DRAFT: "Draft", CLOSED: "Closed" };

export function JobStatusBadge({ status }: { status: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", STATUS_STYLE[status])}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// Each stage kind gets a fixed spot on the teal → navy spectrum.
export const STAGE_STYLE: Record<string, { badge: string; bar: string; dot: string }> = {
  APPLIED: { badge: "bg-navy-50 text-navy-700 ring-navy-500/20", bar: "bg-navy-300", dot: "bg-navy-300" },
  SCREENING: { badge: "bg-sky-50 text-sky-700 ring-sky-600/20", bar: "bg-navy-500", dot: "bg-navy-500" },
  INTERVIEW: { badge: "bg-teal-50 text-teal-700 ring-teal-600/20", bar: "bg-teal-400", dot: "bg-teal-400" },
  OFFER: { badge: "bg-teal-100 text-teal-800 ring-teal-700/20", bar: "bg-teal-600", dot: "bg-teal-600" },
  HIRED: { badge: "bg-teal-600 text-white ring-teal-700", bar: "bg-teal-700", dot: "bg-teal-700" },
  REJECTED: { badge: "bg-red-50 text-red-700 ring-red-600/20", bar: "bg-red-300", dot: "bg-red-400" },
  CUSTOM: { badge: "bg-navy-100 text-navy-800 ring-navy-600/20", bar: "bg-navy-700", dot: "bg-navy-700" },
};

export function StageBadge({ name, kind }: { name: string; kind: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", (STAGE_STYLE[kind] ?? STAGE_STYLE.CUSTOM).badge)}>
      {name}
    </span>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-navy-300">—</span>;
  const tone =
    score >= 70 ? "bg-teal-600 text-white" : score >= 40 ? "bg-teal-100 text-teal-800" : "bg-navy-100 text-navy-700";
  return <span className={cx("inline-flex min-w-9 justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold", tone)}>{score}%</span>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const s = size === "sm" ? "h-7 w-7 text-[11px]" : size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs";
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-navy-700 font-semibold text-white", s)}>
      {initials || "?"}
    </span>
  );
}

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={cx("text-lg font-bold tracking-tight", light ? "text-white" : "text-navy-900")}>
        Recruit<span className="text-teal-500">Flow</span>
      </span>
    </Link>
  );
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-48 rounded-md bg-navy-100" />
      <div className="h-4 w-72 rounded bg-navy-50" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white ring-1 ring-navy-100" />
        ))}
      </div>
    </div>
  );
}

export const EMPLOYMENT_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export function formatSalary(min: number | null, max: number | null, currency: string) {
  if (min == null && max == null) return "—";
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  return `${currency} ${fmt((min ?? max) as number)}`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date) {
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
