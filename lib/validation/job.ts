import { z } from "zod";

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED"] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalInt = z.number().int().nonnegative().max(2_000_000_000).optional();

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(10000),
    department: optionalText(80),
    location: optionalText(120),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    salaryMin: optionalInt,
    salaryMax: optionalInt,
    salaryCurrency: z
      .string()
      .trim()
      .length(3, "Use a 3-letter currency code like NGN")
      .toUpperCase()
      .optional(),
    status: z.enum(JOB_STATUSES),
  })
  .refine(
    (d) => d.salaryMin === undefined || d.salaryMax === undefined || d.salaryMax >= d.salaryMin,
    { message: "Maximum salary must be at least the minimum", path: ["salaryMax"] }
  );

// Turns raw form fields into typed data. Empty boxes become `undefined`.
export function parseJobForm(formData: FormData) {
  const text = (key: string) => {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    return t === "" ? undefined : t;
  };
  const num = (key: string) => {
    const v = text(key);
    return v === undefined ? undefined : Number(v);
  };

  return jobSchema.safeParse({
    title: text("title"),
    description: text("description"),
    department: text("department"),
    location: text("location"),
    employmentType: text("employmentType"),
    salaryMin: num("salaryMin"),
    salaryMax: num("salaryMax"),
    salaryCurrency: text("salaryCurrency"),
    status: text("status"),
  });
}