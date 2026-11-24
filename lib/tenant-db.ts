import { db } from "@/lib/db";

// Tables that belong to a single organization (tenant).
const TENANT_MODELS = new Set([
  "Job",
  "PipelineStage",
  "Applicant",
  "StageHistory",
  "EmailLog",
  "OrganizationModule",
]);

type Args = {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
  create?: Record<string, unknown>;
};

/**
 * A database client locked to ONE organization.
 *
 *   const tdb = tenantDb(organizationId);   // organizationId from requireOrg()
 *   await tdb.job.findMany();               // only that organization's jobs
 *
 * Reads and updates get `organizationId` added to their filter, and creates
 * get it stamped on the new row (overriding anything the caller passed), so a
 * forgotten filter can no longer leak another client's data.
 *
 * Limits: only the top-level model is scoped (not nested `include`s), and
 * operations not listed below are blocked on purpose.
 */
export function tenantDb(organizationId: string) {
  return db.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);

          const a: Args = { ...(args as Args) };

          switch (operation) {
            case "findMany":
            case "findFirst":
            case "findFirstOrThrow":
            case "findUnique":
            case "findUniqueOrThrow":
            case "count":
            case "aggregate":
            case "groupBy":
            case "update":
            case "updateMany":
            case "delete":
            case "deleteMany":
              a.where = { ...a.where, organizationId };
              break;
            case "create":
              a.data = { ...(a.data as Record<string, unknown>), organizationId };
              break;
            case "createMany": {
              const rows = Array.isArray(a.data) ? a.data : [a.data ?? {}];
              a.data = rows.map((r) => ({ ...r, organizationId }));
              break;
            }
            case "upsert":
              a.where = { ...a.where, organizationId };
              a.create = { ...a.create, organizationId };
              break;
            default:
              throw new Error(`tenantDb: "${operation}" is not allowed on ${model}`);
          }

          return query(a as typeof args);
        },
      },
    },
  });
}