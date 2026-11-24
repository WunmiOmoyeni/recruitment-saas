// Ready-made candidate emails. Placeholders are filled on the server.
export const EMAIL_TEMPLATES = [
  {
    key: "received",
    label: "Application received",
    subject: "We received your application for {{job}}",
    body: "Hi {{name}},\n\nThank you for applying for the {{job}} role at {{company}}. Our team is reviewing applications and we'll be in touch about next steps.\n\nBest regards,\n{{company}} Recruitment",
  },
  {
    key: "interview",
    label: "Interview invitation",
    subject: "Interview invitation — {{job}} at {{company}}",
    body: "Hi {{name}},\n\nWe enjoyed reviewing your application for {{job}} and would like to invite you to an interview. Please reply with a few times that work for you this week.\n\nBest regards,\n{{company}} Recruitment",
  },
  {
    key: "offer",
    label: "Offer",
    subject: "Your offer from {{company}}",
    body: "Hi {{name}},\n\nWe're delighted to offer you the {{job}} position at {{company}}. We'll send the formal offer letter shortly — please let us know if you have any questions.\n\nCongratulations,\n{{company}} Recruitment",
  },
  {
    key: "rejection",
    label: "Not moving forward",
    subject: "Your application for {{job}}",
    body: "Hi {{name}},\n\nThank you for your interest in the {{job}} role at {{company}} and for the time you put into your application. After careful consideration, we've decided not to move forward at this time.\n\nWe wish you every success,\n{{company}} Recruitment",
  },
] as const;
