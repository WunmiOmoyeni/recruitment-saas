import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// One session lookup per request, however many components ask for it.
const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

const getMembership = cache(async (organizationId: string, userId: string) =>
  db.member.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  })
);

/**
 * THE guard. Call this at the top of every protected page, server action and
 * route handler. It proves, on the server, that:
 *   1. the user is logged in,
 *   2. the session has an active organization,
 *   3. the user really is a member of that organization (and has an allowed role).
 * The organizationId it returns is the ONLY one you may use in queries.
 * Never take organizationId from the browser.
 */
export async function requireOrg(allowedRoles?: string[]) {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) redirect("/login");

  const member = await getMembership(organizationId, session.user.id);
  if (!member) redirect("/login");

  if (allowedRoles && !allowedRoles.includes(member.role)) {
    throw new Error("Forbidden");
  }

  return { userId: session.user.id, organizationId, role: member.role };
}

/** The signed-in user's display details (for headers and audit trails). */
export async function getAppUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

/** Throws unless the organization has this module enabled (and not expired). */
export async function requireModule(organizationId: string, moduleKey: string) {
  const row = await db.organizationModule.findUnique({
    where: { organizationId_moduleKey: { organizationId, moduleKey } },
  });
  const active = row && row.enabled && (!row.expiresAt || row.expiresAt > new Date());
  if (!active) throw new Error(`The ${moduleKey} module is not enabled`);
}

/** Shortcut used by every recruitment page/action. */
export async function requireRecruitment() {
  const ctx = await requireOrg();
  await requireModule(ctx.organizationId, "RECRUITMENT");
  return ctx;
}
