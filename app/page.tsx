import Link from "next/link";
import { Logo } from "@/components/ui";

const FEATURES = [
  {
    title: "Your own careers page",
    body: "Every company gets a branded page at /apply/your-company. Publish a job and it's live instantly.",
    icon: "M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18M12 3a9 9 0 110 18 9 9 0 010-18z",
  },
  {
    title: "Visual hiring pipeline",
    body: "Drag candidates from Applied to Hired. Rename and reorder stages to match how your team works.",
    icon: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  },
  {
    title: "Instant match scoring",
    body: "Each application is scored against the job description, with the matched and missing skills listed.",
    icon: "M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z",
  },
  {
    title: "Full audit trail",
    body: "Every stage move is recorded with who made it and when, so nothing gets lost between interviews.",
    icon: "M12 8v4l3 2M12 3a9 9 0 110 18 9 9 0 010-18z",
  },
  {
    title: "Candidate emails",
    body: "Send interview invites, offers and polite rejections from ready-made templates, logged on the profile.",
    icon: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
  {
    title: "Secure multi-tenant",
    body: "Each company's data is isolated at the database layer. Owners, admins and members get the right access.",
    icon: "M6 10V8a6 6 0 1112 0v2M5 10h14v10H5z",
  },
];

const STEPS = [
  ["Create your workspace", "Sign up with your company name — your pipeline is ready in seconds."],
  ["Post a job", "Write the role, set the salary range and publish it to your careers page."],
  ["Hire the best fit", "Review scored applicants, move them through stages and email them in one place."],
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo light />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-navy-100 hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy-950 pb-24 pt-36 text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-navy-500/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Recruitment, without the spreadsheets
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Hire faster with a pipeline your <span className="text-teal-400">whole team</span> can see.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-navy-200">
              Post jobs, collect applications on your own careers page, and move every candidate from
              first application to signed offer — in one clean workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400">
                Create your workspace
              </Link>
              <Link href="/login" className="rounded-lg border border-navy-600 px-6 py-3 text-base font-semibold text-white hover:border-teal-400">
                I have an account
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
            <div className="rounded-xl bg-background p-4 text-navy-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Pipeline · Product Designer</p>
                <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">Open</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { stage: "Screening", dot: "bg-navy-500", people: [["Amaka Obi", 82], ["Tunde Bello", 64]] },
                  { stage: "Interview", dot: "bg-teal-400", people: [["Zainab Musa", 91], ["Chidi Eze", 73]] },
                  { stage: "Offer", dot: "bg-teal-600", people: [["Ifeoma Nwosu", 88]] },
                ].map((col) => (
                  <div key={col.stage} className="rounded-lg bg-navy-50 p-2">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-navy-700">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      {col.stage}
                    </p>
                    <div className="space-y-1.5">
                      {col.people.map(([n, s]) => (
                        <div key={n} className="rounded-md bg-white p-2 shadow-sm">
                          <p className="truncate text-[11px] font-semibold">{n}</p>
                          <div className="mt-1 h-1 rounded-full bg-navy-100">
                            <div className="h-1 rounded-full bg-gradient-to-r from-navy-600 to-teal-500" style={{ width: `${s}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-teal-600">Everything you need</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-navy-900">From job post to first day</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-navy-100 p-6 transition hover:border-teal-300 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-teal-300">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900">Up and running in three steps</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-navy-900">{t}</h3>
                <p className="mt-2 text-sm text-navy-500">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy-900 to-teal-800 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold">Ready to build your hiring pipeline?</h2>
            <p className="mt-1 text-navy-100">Set up your workspace and post your first job today.</p>
          </div>
          <Link href="/signup" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy-900 shadow-sm hover:bg-teal-50">
            Get started free →
          </Link>
        </div>
      </section>

      <footer className="bg-navy-950 py-8 text-center text-sm text-navy-300">
        © RecruitFlow · Built for modern hiring teams
      </footer>
    </div>
  );
}
