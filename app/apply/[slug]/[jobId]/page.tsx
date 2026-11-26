import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EMPLOYMENT_LABEL, formatSalary, ui } from "@/components/ui";
import { PublicShell } from "../../public-shell";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = { title: "Apply" };

export default async function JobApplyPage({
  params,
}: {
  params: Promise<{ slug: string; jobId: string }>;
}) {
  const { slug, jobId } = await params;
  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) notFound();

  const job = await db.job.findFirst({ where: { id: jobId, organizationId: org.id, status: "OPEN" } });
  if (!job) notFound();

  return (
    <PublicShell orgName={org.name} slug={slug}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link href={`/apply/${slug}`} className={`text-sm ${ui.link}`}>← All open roles</Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-12">
          <article className="lg:col-span-5">
            <h1 className="text-3xl font-bold tracking-tight text-navy-900">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {job.department && <span className="rounded-full bg-navy-900 px-2.5 py-1 text-teal-200">{job.department}</span>}
              {job.location && <span className="rounded-full bg-navy-50 px-2.5 py-1 text-navy-700">{job.location}</span>}
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">{EMPLOYMENT_LABEL[job.employmentType]}</span>
              {(job.salaryMin != null || job.salaryMax != null) && (
                <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-700">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              )}
            </div>
            <div className="mt-6 whitespace-pre-wrap rounded-xl border border-navy-100 bg-white p-6 text-sm leading-relaxed text-navy-700 shadow-sm">
              {job.description}
            </div>
          </article>

          <aside className="lg:col-span-7">
            <div className="rounded-xl border-t-4 border-teal-500 bg-white p-6 shadow-md ring-1 ring-navy-100 sm:p-8 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-navy-900">Apply for this role</h2>
              <p className="mb-6 mt-1 text-sm text-navy-500">Takes about two minutes.</p>
              <ApplyForm slug={slug} jobId={job.id} jobTitle={job.title} companyName={org.name} />
            </div>
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}
