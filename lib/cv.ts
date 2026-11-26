// Server-side CV validation. Never trust the browser's file type or filename:
// we check the extension AND the first bytes of the file ("magic bytes").

export const MAX_CV_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB bodies

const TYPES = {
  pdf: {
    contentType: "application/pdf",
    magic: [0x25, 0x50, 0x44, 0x46, 0x2d], // "%PDF-"
  },
  docx: {
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [0x50, 0x4b, 0x03, 0x04], // zip container "PK.."
  },
} as const;

export type CvExt = keyof typeof TYPES;

export async function validateCv(
  file: File
): Promise<{ ok: true; ext: CvExt; contentType: string } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "The CV file is empty." };
  if (file.size > MAX_CV_BYTES) return { ok: false, error: "Your CV must be 4 MB or smaller." };

  const ext = file.name.toLowerCase().split(".").pop();
  if (ext !== "pdf" && ext !== "docx") {
    return { ok: false, error: "Your CV must be a PDF or DOCX file." };
  }

  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const looksRight = TYPES[ext].magic.every((byte, i) => head[i] === byte);
  if (!looksRight) {
    return { ok: false, error: `That file doesn't look like a valid ${ext.toUpperCase()}.` };
  }

  return { ok: true, ext, contentType: TYPES[ext].contentType };
}
