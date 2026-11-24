import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const applicantSchema = z.object({
  name: z.string().trim().min(2, "Please enter a full name").max(120),
  email: z.email("Please enter a valid email address").trim().toLowerCase().max(200),
  phone: optionalText(40),
  experience: optionalText(4000),
  cvUrl: z
    .url({ protocol: /^https?$/, message: "CV link must start with http:// or https://" })
    .max(500)
    .optional(),
  cvText: optionalText(20000),
});

export type ApplicantInput = z.infer<typeof applicantSchema>;

export function parseApplicantForm(formData: FormData) {
  const text = (key: string) => {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    return t === "" ? undefined : t;
  };
  return applicantSchema.safeParse({
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    experience: text("experience"),
    cvUrl: text("cvUrl"),
    cvText: text("cvText"),
  });
}

export const emailSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required").max(200),
  body: z.string().trim().min(5, "Message is required").max(10000),
});
