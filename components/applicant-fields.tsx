
import { ui } from "@/components/ui";

// Candidate fields shared by the public application form and "Add candidate".
export function ApplicantFields({
  values = {},
}: {
  values?: Record<string, string>;
}) {
  return (
    <div className="space-y-10">

      {/* Personal Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-bold text-navy-900">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-navy-500">
            Provide your contact details so the hiring team can reach you.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <label className={ui.label} htmlFor="name">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Enter your full name"
              className={ui.input}
              defaultValue={values.name}
            />
          </div>

          <div>
            <label className={ui.label} htmlFor="email">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={ui.input}
              defaultValue={values.email}
            />
          </div>

          <div>
            <label className={ui.label} htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className={ui.input}
              defaultValue={values.phone}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-navy-100" />

      {/* Professional Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-bold text-navy-900">
            Professional Information
          </h3>
          <p className="mt-1 text-sm text-navy-500">
            Tell us about your professional background and experience.
          </p>
        </div>

        <div>
          <label className={ui.label} htmlFor="experience">
            Experience summary
          </label>
          <textarea
            id="experience"
            name="experience"
            rows={5}
            placeholder="Briefly describe your relevant experience, skills, achievements, and qualifications."
            className={`${ui.input} min-h-32 resize-y`}
            defaultValue={values.experience}
          />
        </div>
      </section>

      <div className="border-t border-navy-100" />

      {/* CV and Portfolio */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-bold text-navy-900">
            CV & Portfolio
          </h3>
          <p className="mt-1 text-sm text-navy-500">
            Share your CV, LinkedIn profile, or portfolio with us.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={ui.label} htmlFor="cvUrl">
              CV / LinkedIn / Portfolio URL
            </label>
            <input
              id="cvUrl"
              name="cvUrl"
              type="url"
              placeholder="https://"
              className={ui.input}
              defaultValue={values.cvUrl}
            />
            <p className="mt-1.5 text-xs text-navy-400">
              Provide a link to your online CV or professional profile.
            </p>
          </div>

          <div>
            <label className={ui.label} htmlFor="cvText">
              CV / Résumé (paste text)
            </label>
            <textarea
              id="cvText"
              name="cvText"
              rows={5}
              placeholder="Paste the contents of your CV here."
              className={ui.input}
              defaultValue={values.cvText}
            />
            <p className="mt-1.5 text-xs text-navy-400">
              Alternatively, paste your CV contents here.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
