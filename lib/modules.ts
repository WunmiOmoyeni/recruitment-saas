import { db } from "@/lib/db";

/** True when the organization has this module enabled and not expired. */
export async function hasModule(organizationId: string, moduleKey: string) {
  const row = await db.organizationModule.findUnique({
    where: { organizationId_moduleKey: { organizationId, moduleKey } },
  });
  return !!row && row.enabled && (!row.expiresAt || row.expiresAt > new Date());
}
