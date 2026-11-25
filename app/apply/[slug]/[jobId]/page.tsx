import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EMPLOYMENT_LABEL, formatSalary, ui } from "@/components/ui";
import { submitApplication } from "../../actions";
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

  const job = await db.job.findFirst({
    where: {
      id: jobId,
      organizationId: org.id,
      status: "OPEN",
    },
  });

  if (!job) notFound();

  return (
    <PublicShell orgName={org.name} slug={slug}>
      <main className="w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16">

        <Link
          href={`/apply/${slug}`}
          className={`text-sm ${ui.link}`}
        >
          ← All open roles
        </Link>

        {/* Job information */}
        <section className="mt-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm lg:p-8">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Job opportunity
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 lg:text-4xl">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {job.department && (
                <span className="rounded-full bg-navy-900 px-3 py-1.5 text-teal-200">
                  {job.department}
                </span>
              )}

              {job.location && (
                <span className="rounded-full bg-navy-50 px-3 py-1.5 text-navy-700">
                  {job.location}
                </span>
              )}

              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-700">
                {EMPLOYMENT_LABEL[job.employmentType]}
              </span>

              {(job.salaryMin != null || job.salaryMax != null) && (
                <span className="rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-700">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-navy-100 pt-5">
              <h2 className="mb-3 text-sm font-bold text-navy-900">
                About this role
              </h2>

              <div className="whitespace-pre-wrap text-sm leading-7 text-navy-600">
                {job.description}
              </div>
            </div>
          </div>
        </section>

        {/* Application form */}
        <section className="mt-8 rounded-2xl border border-navy-100 bg-white shadow-sm">
          <div className="border-b border-navy-100 px-6 py-6 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Application form
            </p>

            <h2 className="mt-1 text-2xl font-bold text-navy-900">
              Apply for this position
            </h2>

            <p className="mt-2 text-sm text-navy-500">
              Complete the form below to submit your application.
              Make sure your information is accurate before submitting.
            </p>
          </div>

          <div className="px-6 py-8 lg:px-10 lg:py-10">
            <ApplyForm
              action={submitApplication.bind(null, slug, job.id)}
              slug={slug}
              jobTitle={job.title}
            />
          </div>
        </section>

      </main>
    </PublicShell>
  );
}