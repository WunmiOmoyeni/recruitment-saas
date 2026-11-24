import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";
import { ConfirmSubmit, SubmitButton } from "@/components/confirm-submit";
import { Avatar, Card, PageHeader, STAGE_STYLE, cx, formatDate, ui } from "@/components/ui";
import { addStage, deleteStage, moveStage, renameStage, updateCompanyName } from "./actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { organizationId, role, userId } = await requireRecruitment();
  const isAdmin = canManageSettings(role);
  const tdb = tenantDb(organizationId);

  const [org, stages, members, modules] = await Promise.all([
    db.organization.findUniqueOrThrow({ where: { id: organizationId } }),
    tdb.pipelineStage.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { applicants: true, movesFrom: true, movesTo: true } } },
    }),
    db.member.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    tdb.organizationModule.findMany({ include: { module: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle={isAdmin ? "Manage your company, hiring pipeline and team." : "Only owners and admins can change settings."}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Company">
          <form action={updateCompanyName} className="space-y-3">
            <div>
              <label className={ui.label} htmlFor="name">Company name</label>
              <input id="name" name="name" defaultValue={org.name} disabled={!isAdmin} minLength={2} maxLength={60} className={ui.input} />
            </div>
            <div>
              <p className={ui.label}>Careers page</p>
              <Link href={`/apply/${org.slug}`} target="_blank" className="block rounded-lg bg-teal-50 px-3 py-2 font-mono text-sm text-teal-800 ring-1 ring-teal-100 hover:bg-teal-100">
                /apply/{org.slug} ↗
              </Link>
            </div>
            {isAdmin && <SubmitButton className={ui.btnPrimary}>Save company</SubmitButton>}
          </form>
        </Card>

        <Card title="Plan & modules">
          <ul className="space-y-3">
            {modules.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-navy-100 p-3">
                <div>
                  <p className="font-medium text-navy-900">{m.module.name}</p>
                  <p className="text-xs text-navy-500">{m.module.description}</p>
                </div>
                <span className={cx("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", m.enabled ? "bg-teal-600 text-white" : "bg-navy-100 text-navy-600")}>
                  {m.enabled ? (m.expiresAt ? `Until ${formatDate(m.expiresAt)}` : "Active") : "Disabled"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Hiring pipeline">
        <p className="mb-4 text-sm text-navy-500">
          Rename stages to match how your team works. Built-in stages (Applied, Hired, Rejected…) keep their meaning when renamed.
          Custom stages can be deleted while no candidate has ever been in them.
        </p>
        <ol className="space-y-2">
          {stages.map((s, i) => {
            const style = STAGE_STYLE[s.kind] ?? STAGE_STYLE.CUSTOM;
            const used = s._count.applicants + s._count.movesFrom + s._count.movesTo > 0;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-navy-100 bg-white p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-teal-200">{i + 1}</span>
                <span className={cx("h-2.5 w-2.5 rounded-full", style.dot)} />
                {isAdmin ? (
                  <form action={renameStage.bind(null, s.id)} className="flex flex-1 items-center gap-2">
                    <input name="name" defaultValue={s.name} minLength={2} maxLength={60} className={`${ui.input} max-w-xs`} />
                    <SubmitButton pendingLabel="…" className={ui.btnSmall}>Rename</SubmitButton>
                  </form>
                ) : (
                  <span className="flex-1 font-medium text-navy-900">{s.name}</span>
                )}
                <span className="text-xs uppercase tracking-wide text-navy-400">{s.kind.toLowerCase()}</span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">{s._count.applicants} now</span>
                {isAdmin && (
                  <div className="flex gap-1">
                    <form action={moveStage.bind(null, s.id, "up")}>
                      <button disabled={i === 0} className={`${ui.btnSmall} disabled:opacity-30`} aria-label="Move up">↑</button>
                    </form>
                    <form action={moveStage.bind(null, s.id, "down")}>
                      <button disabled={i === stages.length - 1} className={`${ui.btnSmall} disabled:opacity-30`} aria-label="Move down">↓</button>
                    </form>
                    {s.kind === "CUSTOM" && !used && (
                      <form action={deleteStage.bind(null, s.id)}>
                        <ConfirmSubmit message={`Delete the "${s.name}" stage?`} className={ui.btnDanger}>Delete</ConfirmSubmit>
                      </form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {isAdmin && (
          <form action={addStage} className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
            <input name="name" required minLength={2} maxLength={60} placeholder="New stage, e.g. Technical test" className={`${ui.input} max-w-xs`} />
            <SubmitButton pendingLabel="Adding…" className={ui.btnPrimary}>+ Add stage</SubmitButton>
          </form>
        )}
      </Card>

      <Card title={`Team (${members.length})`}>
        <ul className="divide-y divide-navy-50">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <Avatar name={m.user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-900">
                  {m.user.name} {m.userId === userId && <span className="text-xs text-navy-400">(you)</span>}
                </p>
                <p className="truncate text-xs text-navy-400">{m.user.email}</p>
              </div>
              <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", m.role === "owner" ? "bg-navy-900 text-teal-200" : m.role === "admin" ? "bg-teal-100 text-teal-800" : "bg-navy-50 text-navy-600")}>
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
