"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth-shell";
import { ui } from "@/components/ui";

const field = ui.input;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setError(error.message ?? "Could not log in");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your hiring workspace."
      footer={<>
        New here? <Link className={ui.link} href="/signup">Create an account</Link>
      </>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={ui.label} htmlFor="email">Email</label>
          <input className={field} name="email" type="email" id="email" placeholder="you@company.com" required />
        </div>
        <div>
          <label className={ui.label} htmlFor="password">Password</label>
          <input className={field} name="password" type="password" id="password" placeholder="••••••••••" required />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className={`${ui.btnPrimary} w-full`}
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}