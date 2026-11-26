import { CvUpload } from "@/components/cv-upload";
import { ui } from "@/components/ui";

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-0.5 text-sm text-navy-500">{hint}</p>
    </div>
  );
}

// Candidate fields shared by the public application form and "Add candidate".
//
// `@container` makes the two-column rows depend on the width of the space the
// form is placed in (not the screen): one column in a narrow card or on a
// phone, two columns once there is room.
export function ApplicantFields({ requireCv = false }: { requireCv?: boolean }) {
  return (
    <div className="@container space-y-8">
      {/* Personal information */}
      <section>
        <SectionTitle title="Personal information" hint="So the hiring team can reach you." />
        <div className="grid gap-x-6 gap-y-5 @lg:grid-cols-2">
          <div>
            <label className={ui.label} htmlFor="name">
              Full name <span className="text-red-500">*</span>
            </label>
            <input id="name" name="name" required maxLength={120} autoComplete="name"
              placeholder="Enter your full name" className={ui.input} />
          </div>
          <div>
            <label className={ui.label} htmlFor="email">
              Email address <span className="text-red-500">*</span>
            </label>
            <input id="email" name="email" type="email" required maxLength={200} autoComplete="email"
              placeholder="you@example.com" className={ui.input} />
          </div>
          <div>
            <label className={ui.label} htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" maxLength={40} autoComplete="tel"
              placeholder="+234 800 000 0000" className={ui.input} />
          </div>
        </div>
      </section>

      <div className="border-t border-navy-100" />

      {/* Professional information */}
      <section>
        <SectionTitle title="Professional information" hint="A few lines about your background." />
        <label className={ui.label} htmlFor="experience">Experience summary</label>
        <textarea id="experience" name="experience" rows={5} maxLength={4000}
          placeholder="Briefly describe your relevant experience, skills and achievements."
          className={`${ui.input} min-h-32 resize-y`} />
      </section>

      <div className="border-t border-navy-100" />

      {/* CV and portfolio */}
      <section>
        <SectionTitle title="CV & portfolio" hint="Upload your CV and share a profile link if you have one." />
        <div className="space-y-5">
          <div>
            <label className={`${ui.label}`} htmlFor="cv">
              CV {requireCv ? <span className="text-red-500">*</span> : <span className="font-normal text-navy-400">(optional)</span>}
            </label>
            <CvUpload name="cv" required={requireCv} />
          </div>
          <div>
            <label className={ui.label} htmlFor="portfolioUrl">
              LinkedIn or portfolio link <span className="font-normal text-navy-400">(optional)</span>
            </label>
            <input id="portfolioUrl" name="portfolioUrl" type="text" inputMode="url" maxLength={500}
              autoComplete="url" placeholder="linkedin.com/in/your-name" className={ui.input} />
          </div>
        </div>
      </section>
    </div>
  );
}