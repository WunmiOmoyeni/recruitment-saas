import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

// People often type "linkedin.com/in/me" without https://, so add it for them.
// The schema below still rejects anything that is not a real http(s) link.
const withProtocol = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

export const applicantSchema = z.object({
  name: z.string().trim().min(2, "Please enter a full name").max(120),
  email: z.email("Please enter a valid email address").trim().toLowerCase().max(200),
  phone: optionalText(40),
  experience: optionalText(4000),
  portfolioUrl: z
    .url({ protocol: /^https?$/, message: "Enter a valid link, for example linkedin.com/in/your-name" })
    .max(500)
    .optional(),
  // Filled in by the server (never by the form) once CV text extraction exists.
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
  const link = text("portfolioUrl");

  return applicantSchema.safeParse({
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    experience: text("experience"),
    portfolioUrl: link ? withProtocol(link) : undefined,
  });
}

export const emailSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required").max(200),
  body: z.string().trim().min(5, "Message is required").max(10000),
});