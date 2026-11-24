import { db } from "@/lib/db";
import { getAppUser, requireOrg } from "@/lib/tenant";
import { Avatar } from "@/components/ui";
import { SignOutButton } from "@/components/signout-button";

export async function OrgBadge() {
  const { organizationId, role } = await requireOrg();
  const org = await db.organization.findUnique({ where: { id: organizationId } });
  return (
    <div className="flex items-center gap-3 rounded-lg bg-navy-800 px-3 py-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-500/20 text-sm font-bold text-teal-300">
        {org?.name?.[0]?.toUpperCase() ?? "?"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{org?.name}</p>
        <p className="text-xs capitalize text-navy-300">{role}</p>
      </div>
    </div>
  );
}

export async function UserMenu() {
  const user = await getAppUser();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-navy-900">{user.name}</p>
        <p className="text-xs text-navy-400">{user.email}</p>
      </div>
      <Avatar name={user.name} />
      <SignOutButton />
    </div>
  );
}
