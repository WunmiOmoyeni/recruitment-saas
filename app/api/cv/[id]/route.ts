import { NextResponse } from "next/server";
import { readCv } from "@/lib/storage";
import { requireRecruitment } from "@/lib/tenant";
import { tenantDb } from "@/lib/tenant-db";

// Authenticated CV download. Takes an applicant id (never a file path) and
// only finds applicants inside the signed-in user's own organization.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organizationId } = await requireRecruitment();

  const applicant = await tenantDb(organizationId).applicant.findUnique({
    where: { id },
    select: { id: true, cvPath: true, cvType: true },
  });
  if (!applicant?.cvPath) return new NextResponse("Not found", { status: 404 });

  const body = await readCv(applicant.cvPath);
  if (!body) return new NextResponse("Not found", { status: 404 });

  const ext = applicant.cvPath.toLowerCase().endsWith(".docx") ? "docx" : "pdf";

  return new NextResponse(body, {
    headers: {
      "Content-Type": applicant.cvType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="cv-${applicant.id}.${ext}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
