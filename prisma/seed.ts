import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODULES = [
  {
    key: "RECRUITMENT" as const,
    name: "Recruitment",
    description: "Job postings, application site, pipeline, AI screening",
  },
];

async function main() {
  for (const module of MODULES) {
    await prisma.module.upsert({
      where: { key: module.key },
      update: {
        name: module.name,
        description: module.description,
      },
      create: module,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Module seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });