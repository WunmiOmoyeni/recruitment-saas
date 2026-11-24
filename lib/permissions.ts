// Who can do what. Roles come from Better Auth: "owner" | "admin" | "member".
// Custom roles (HR, Hiring Manager) will plug in here later.

/** Create, edit, publish, close and delete job postings. */
export const canManageJobs = (role: string) => role === "owner" || role === "admin";

/** Rename/reorder pipeline stages, edit company details. */
export const canManageSettings = (role: string) => role === "owner" || role === "admin";

/** Delete a candidate permanently. Everyone can move candidates and add notes. */
export const canDeleteApplicants = (role: string) => role === "owner" || role === "admin";
