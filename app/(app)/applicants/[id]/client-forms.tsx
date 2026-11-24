"use client";

import { useActionState, useRef } from "react";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";
import { ui } from "@/components/ui";
import type { ActionState } from "../actions";

type BoundAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function NotesForm({ action, notes }: { action: BoundAction; notes: string }) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="notes"
        rows={6}
        defaultValue={notes}
        placeholder="Interview feedback, impressions, follow-ups… (visible to your team only)"
        className={ui.input}
      />
      <div className="flex items-center gap-3">
        <button disabled={pending} className={ui.btnNavy}>{pending ? "Saving…" : "Save notes"}</button>
        {state.ok && <span className="text-sm text-teal-700">✓ {state.ok}</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}

export function EmailComposer({ action }: { action: BoundAction }) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {EMAIL_TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-100 hover:bg-teal-100"
            onClick={() => {
              if (subjectRef.current) subjectRef.current.value = t.subject;
              if (bodyRef.current) bodyRef.current.value = t.body;
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input ref={subjectRef} name="subject" placeholder="Subject" className={ui.input} defaultValue={state.values?.subject} />
      <textarea ref={bodyRef} name="body" rows={7} placeholder="Message…" className={ui.input} defaultValue={state.values?.body} />
      <p className="text-xs text-navy-400">
        Placeholders: <code>{"{{name}}"}</code>, <code>{"{{job}}"}</code>, <code>{"{{company}}"}</code>
      </p>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={ui.btnPrimary}>{pending ? "Sending…" : "Send email"}</button>
        {state.ok && <span className="text-sm text-teal-700">✓ {state.ok}</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
