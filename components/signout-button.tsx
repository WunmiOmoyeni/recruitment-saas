"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:border-teal-400 hover:text-teal-700 disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
