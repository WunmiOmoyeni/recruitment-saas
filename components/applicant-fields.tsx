import { ui } from "@/components/ui";

// Candidate fields shared by the public application form and "Add candidate".
export function ApplicantFields({ values = {} }: { values?: Record<string, string> }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="name">Full name *</label>
          <input id="name" name="name" required autoComplete="name" className={ui.input} defaultValue={values.name} />
        </div>
        <div>
          <label className={ui.label} htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={ui.input} defaultValue={values.email} />
        </div>
        <div>
          <label className={ui.label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={ui.input} defaultValue={values.phone} />
        </div>
        <div>
          <label className={ui.label} htmlFor="cvUrl">Link to CV / LinkedIn / portfolio</label>
          <input id="cvUrl" name="cvUrl" type="url" placeholder="https://" className={ui.input} defaultValue={values.cvUrl} />
        </div>
      </div>
      <div>
        <label className={ui.label} htmlFor="experience">Experience summary</label>
        <textarea
          id="experience"
          name="experience"
          rows={4}
          placeholder="A few lines about your most relevant experience and skills."
          className={ui.input}
          defaultValue={values.experience}
        />
      </div>
      <div>
        <label className={ui.label} htmlFor="cvText">CV / résumé (paste text)</label>
        <textarea
          id="cvText"
          name="cvText"
          rows={8}
          placeholder="Paste the contents of the CV here."
          className={ui.input.replace("text-sm", "font-mono text-xs")}
          defaultValue={values.cvText}
        />
      </div>
    </>
  );
}
