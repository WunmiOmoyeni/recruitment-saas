"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth-shell";
import { ui } from "@/components/ui";

const field = ui.input;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
  "company";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const company = String(form.get("company"));

    // 1. Create the user account
    const signUp = await authClient.signUp.email({ name, email, password });
    if (signUp.error) {
      setError(signUp.error.message ?? "Could not create account");
      setBusy(false);
      return;
    }

    // 2. Create their organization (the tenant). If the slug is taken,
    //    retry once with a random suffix.
    const base = slugify(company);
    let org = await authClient.organization.create({ name: company, slug: base });
    if (org.error) {
      const suffix = Math.random().toString(36).slice(2, 6);
      org = await authClient.organization.create({
        name: company,
        slug: `${base}-${suffix}`,
      });
    }
    if (org.error) {
      setError(org.error.message ?? "Could not create organization");
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Set up your company and start hiring in minutes."
      footer={<>
        Already have an account? <Link className={ui.link} href="/login">Log in</Link>
      </>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={ui.label} htmlFor="name">Your name</label>
          <input className={field} name="name" id="name" placeholder="Ada Okafor" required />
        </div>
        <div>
          <label className={ui.label} htmlFor="company">Company name</label>
          <input className={field} name="company" id="company" placeholder="Acme Ltd" required />
        </div>
        <div>
          <label className={ui.label} htmlFor="email">Work email</label>
          <input className={field} name="email" type="email" id="email" placeholder="you@company.com" required />
        </div>
        <div>
          <label className={ui.label} htmlFor="password">Password</label>
          <input
            className={field}
            name="password"
            type="password"
            id="password"
            placeholder="At least 10 characters"
            minLength={10}
            required
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className={`${ui.btnPrimary} w-full`}
        >
          {busy ? "Setting up your workspace…" : "Create workspace"}
        </button>
      </form>
    </AuthShell>
  );
}