import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EMPLOYMENT_LABEL, formatSalary } from "@/components/ui";
import { PublicShell } from "../public-shell";

export const metadata: Metadata = { title: "Careers" };

export default async function CareersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) notFound();

  // Public page: only OPEN jobs, always filtered by this organization.
  const jobs = await db.job.findMany({
    where: { organizationId: org.id, status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });
  const departments = [...new Set(jobs.map((j) => j.department).filter(Boolean))] as string[];

  return (
    <PublicShell orgName={org.name} slug={slug}>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">Join the team</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Work at {org.name}</h1>
          <p className="mt-4 max-w-xl text-navy-100">
            {jobs.length > 0
              ? `We have ${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}. Find one that fits and apply in a couple of minutes.`
              : "There are no open roles right now — check back soon."}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {departments.length > 1 && (
          <p className="mb-4 text-sm text-navy-500">Teams hiring: {departments.join(" · ")}</p>
        )}
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/apply/${slug}/${job.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-navy-900 group-hover:text-teal-700">{job.title}</h2>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {job.department && <span className="rounded-full bg-navy-50 px-2 py-0.5 text-navy-700">{job.department}</span>}
                    {job.location && <span className="rounded-full bg-navy-50 px-2 py-0.5 text-navy-700">{job.location}</span>}
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">{EMPLOYMENT_LABEL[job.employmentType]}</span>
                    {(job.salaryMin != null || job.salaryMax != null) && (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 self-start rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-teal-700 sm:self-center">
                  View & apply →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PublicShell>
  );
}
