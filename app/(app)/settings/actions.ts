"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";

async function authorizeAdmin() {
  const ctx = await requireRecruitment();
  if (!canManageSettings(ctx.role)) throw new Error("Only owners and admins can change settings.");
  return ctx;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

const nameSchema = z.string().trim().min(2).max(60);

export async function updateCompanyName(formData: FormData): Promise<void> {
  const { organizationId } = await authorizeAdmin();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return;
  await db.organization.update({ where: { id: organizationId }, data: { name: name.data } });
  revalidateAll();
}

export async function renameStage(stageId: string, formData: FormData): Promise<void> {
  const { organizationId } = await authorizeAdmin();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return;
  await tenantDb(organizationId).pipelineStage.updateMany({ where: { id: stageId }, data: { name: name.data } });
  revalidateAll();
}

export async function addStage(formData: FormData): Promise<void> {
  const { organizationId } = await authorizeAdmin();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return;
  const tdb = tenantDb(organizationId);

  // Insert custom stages just before Hired/Rejected so the flow stays sensible.
  const stages = await tdb.pipelineStage.findMany({ orderBy: { position: "asc" } });
  const firstTerminal = stages.find((s) => s.kind === "HIRED" || s.kind === "REJECTED");
  const insertAt = firstTerminal ? firstTerminal.position : (stages.at(-1)?.position ?? -1) + 1;
  const toShift = stages.filter((s) => s.position >= insertAt).reverse();

  await db.$transaction(async (tx) => {
    // Shift from the end backwards so the (organizationId, position) unique key never collides.
    for (const s of toShift) {
      await tx.pipelineStage.update({ where: { id: s.id }, data: { position: s.position + 1 } });
    }
    await tx.pipelineStage.create({
      data: { organizationId, name: name.data, kind: "CUSTOM", position: insertAt },
    });
  });
  revalidateAll();
}

export async function moveStage(stageId: string, direction: "up" | "down"): Promise<void> {
  const { organizationId } = await authorizeAdmin();
  const stages = await tenantDb(organizationId).pipelineStage.findMany({ orderBy: { position: "asc" } });
  const i = stages.findIndex((s) => s.id === stageId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= stages.length) return;
  const a = stages[i];
  const b = stages[j];

  await db.$transaction(async (tx) => {
    const temp = -1 - Math.abs(a.position) - 1000; // free slot, avoids the unique clash
    await tx.pipelineStage.update({ where: { id: a.id }, data: { position: temp } });
    await tx.pipelineStage.update({ where: { id: b.id }, data: { position: a.position } });
    await tx.pipelineStage.update({ where: { id: a.id }, data: { position: b.position } });
  });
  revalidateAll();
}

/** Only empty custom stages can be removed; built-in kinds drive system behaviour. */
export async function deleteStage(stageId: string): Promise<void> {
  const { organizationId } = await authorizeAdmin();
  const tdb = tenantDb(organizationId);
  const stage = await tdb.pipelineStage.findUnique({
    where: { id: stageId },
    include: { _count: { select: { applicants: true, movesFrom: true, movesTo: true } } },
  });
  if (!stage || stage.kind !== "CUSTOM") return;
  const c = stage._count;
  if (c.applicants + c.movesFrom + c.movesTo > 0) return;
  await tdb.pipelineStage.deleteMany({ where: { id: stage.id } });
  revalidateAll();
}
