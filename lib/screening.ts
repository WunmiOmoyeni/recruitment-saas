// Lightweight, offline candidate screening.
//
// Pulls the key terms out of a job posting and checks how many of them appear
// in the candidate's experience / CV text. It is deliberately simple and fully
// explainable (it lists what matched and what didn't). Swap `screenApplicant`
// for an LLM call later without touching any page: callers only use
// { score, summary }.

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being
  below between both but by can could did do does doing down during each etc few for from further had
  has have having he her here hers him his how i if in into is it its itself just like make may me
  more most must my no nor not now of off on once only or other our ours out over own per role same
  she should so some such than that the their them then there these they this those through to too
  under until up us very was we were what when where which while who whom why will with within work
  would you your yours year years team join looking ideal candidate candidates company job responsibilities
  requirements required preferred including strong ability skills experience good great well new using use
  across ensure help other others able based day days time full part plus etc. we're you'll you're it's`
    .split(/\s+/)
    .filter(Boolean)
);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/** The most frequent meaningful words in the job (title words count triple). */
export function keyTerms(title: string, description: string, limit = 25) {
  const counts = new Map<string, number>();
  for (const w of tokenize(title)) counts.set(w, (counts.get(w) ?? 0) + 3);
  for (const w of tokenize(description)) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export function screenApplicant(
  job: { title: string; description: string },
  candidate: { experience?: string | null; cvText?: string | null }
): { score: number | null; summary: string | null } {
  const text = `${candidate.experience ?? ""}\n${candidate.cvText ?? ""}`.trim();
  if (text.length < 20) {
    return { score: null, summary: "Not enough CV or experience text to screen." };
  }
  const terms = keyTerms(job.title, job.description);
  if (terms.length === 0) return { score: null, summary: null };

  const have = new Set(tokenize(text));
  const matched = terms.filter((t) => have.has(t));
  const missing = terms.filter((t) => !have.has(t));
  const score = Math.round((matched.length / terms.length) * 100);

  const summary =
    `Matched ${matched.length} of ${terms.length} key terms from the job posting.` +
    (matched.length ? ` Found: ${matched.slice(0, 12).join(", ")}.` : "") +
    (missing.length ? ` Not mentioned: ${missing.slice(0, 8).join(", ")}.` : "");

  return { score, summary };
}
