import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { db } from "@/lib/db";

// Every new organization starts with this pipeline. Clients can rename or
// reorder later; `kind` tells the system what each stage means.
const DEFAULT_STAGES = [
  { name: "Applied", kind: "APPLIED" },
  { name: "Screening", kind: "SCREENING" },
  { name: "Interview", kind: "INTERVIEW" },
  { name: "Offer", kind: "OFFER" },
  { name: "Hired", kind: "HIRED" },
  { name: "Rejected", kind: "REJECTED" },
] as const;

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    // TODO before launch: turn on email verification once Resend is set up
  },

  databaseHooks: {
    session: {
      create: {
        // On every login, start the session inside the user's first organization
        before: async (session) => {
          const membership = await db.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" },
          });
          return {
            data: { ...session, activeOrganizationId: membership?.organizationId ?? null },
          };
        },
      },
    },
  },

  plugins: [
    organization({
      organizationHooks: {
        // Runs when a client signs up: give them a pipeline and the Recruitment module
        afterCreateOrganization: async ({ organization }) => {
          await db.$transaction([
            db.pipelineStage.createMany({
              data: DEFAULT_STAGES.map((s, i) => ({
                organizationId: organization.id,
                name: s.name,
                kind: s.kind,
                position: i,
              })),
            }),
            db.organizationModule.create({
              data: { organizationId: organization.id, moduleKey: "RECRUITMENT" },
            }),
          ]);
        },
      },
    }),
    nextCookies(), // must stay the LAST plugin
  ],
});