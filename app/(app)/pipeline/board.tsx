"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Avatar, STAGE_STYLE, ScorePill, cx } from "@/components/ui";
import { moveApplicant } from "../applicants/actions";

type Stage = { id: string; name: string; kind: string };
type Card = { id: string; name: string; jobTitle: string; stageId: string; aiScore: number | null; createdAt: string };

export function PipelineBoard({ stages, cards }: { stages: Stage[]; cards: Card[] }) {
  const [optimistic, applyMove] = useOptimistic(cards, (state, move: { id: string; stageId: string }) =>
    state.map((c) => (c.id === move.id ? { ...c, stageId: move.stageId } : c))
  );
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function move(id: string, stageId: string) {
    const card = optimistic.find((c) => c.id === id);
    if (!card || card.stageId === stageId) return;
    setError(null);
    startTransition(async () => {
      applyMove({ id, stageId });
      try {
        await moveApplicant(id, stageId);
      } catch {
        setError("Could not move that candidate. Please refresh and try again.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, idx) => {
          const items = optimistic.filter((c) => c.stageId === stage.id);
          const style = STAGE_STYLE[stage.kind] ?? STAGE_STYLE.CUSTOM;
          return (
            <section
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(stage.id);
              }}
              onDragLeave={() => setDragOver((s) => (s === stage.id ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, stage.id);
              }}
              className={cx(
                "flex w-72 shrink-0 flex-col rounded-xl border bg-navy-50/60 transition",
                dragOver === stage.id ? "border-teal-400 bg-teal-50 ring-2 ring-teal-200" : "border-navy-100"
              )}
            >
              <header className="flex items-center justify-between rounded-t-xl border-b border-navy-100 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cx("h-2.5 w-2.5 rounded-full", style.dot)} />
                  <h2 className="text-sm font-semibold text-navy-900">{stage.name}</h2>
                </div>
                <span className="rounded-full bg-navy-900 px-2 py-0.5 text-xs font-semibold text-teal-200">{items.length}</span>
              </header>
              <div className="flex min-h-40 flex-1 flex-col gap-2 p-3">
                {items.length === 0 && (
                  <p className="m-auto text-center text-xs text-navy-300">Drop candidates here</p>
                )}
                {items.map((c) => (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", c.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="group cursor-grab rounded-lg border border-navy-100 bg-white p-3 shadow-sm transition hover:border-teal-300 hover:shadow active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar name={c.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/applicants/${c.id}`} className="block truncate text-sm font-semibold text-navy-900 hover:text-teal-700">
                          {c.name}
                        </Link>
                        <p className="truncate text-xs text-navy-400">{c.jobTitle}</p>
                      </div>
                      <ScorePill score={c.aiScore} />
                    </div>
                    {/* Keyboard/touch friendly alternative to drag-and-drop */}
                    <div className="mt-2 flex justify-between opacity-60 transition group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => move(c.id, stages[idx - 1].id)}
                        className="rounded px-1.5 text-xs text-navy-500 hover:bg-navy-50 hover:text-teal-700 disabled:invisible"
                        aria-label={`Move ${c.name} back`}
                      >
                        ← {stages[idx - 1]?.name}
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => move(c.id, stages[idx + 1].id)}
                        className="rounded px-1.5 text-xs text-navy-500 hover:bg-navy-50 hover:text-teal-700 disabled:invisible"
                        aria-label={`Move ${c.name} forward`}
                      >
                        {stages[idx + 1]?.name} →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
