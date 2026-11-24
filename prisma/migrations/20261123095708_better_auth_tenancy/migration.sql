/*
  Warnings:

  - You are about to drop the column `consentGiven` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `cvObjectKey` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `lowMatch` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `screeningScore` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `screeningSummary` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `syncAttemptedAt` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `syncError` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `syncStatus` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `workEmail` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `sentByUserId` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Job` table. All the data in the column will be lost.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `enabledAt` on the `OrganizationModule` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `OrganizationModule` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PipelineStage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PipelineStage` table. All the data in the column will be lost.
  - The `kind` column on the `PipelineStage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `movedByUserId` on the `StageHistory` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `StageHistory` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `StageHistory` table. All the data in the column will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,moduleKey]` on the table `OrganizationModule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `EmailLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `applicantId` on table `EmailLog` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `key` on the `Module` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `moduleKey` to the `OrganizationModule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toStageId` to the `StageHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StageKind" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApplicantSource" AS ENUM ('APPLICATION_SITE', 'MANUAL');

-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "EmailLog" DROP CONSTRAINT "EmailLog_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "EmailLog" DROP CONSTRAINT "EmailLog_sentByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationModule" DROP CONSTRAINT "OrganizationModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationModule" DROP CONSTRAINT "OrganizationModule_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineStage" DROP CONSTRAINT "PipelineStage_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "StageHistory" DROP CONSTRAINT "StageHistory_movedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "StageHistory" DROP CONSTRAINT "StageHistory_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "StageHistory" DROP CONSTRAINT "StageHistory_stageId_fkey";

-- DropIndex
DROP INDEX "Applicant_jobId_idx";

-- DropIndex
DROP INDEX "Applicant_organizationId_jobId_email_key";

-- DropIndex
DROP INDEX "Applicant_organizationId_syncStatus_idx";

-- DropIndex
DROP INDEX "EmailLog_applicantId_idx";

-- DropIndex
DROP INDEX "EmailLog_organizationId_createdAt_idx";

-- DropIndex
DROP INDEX "Job_organizationId_slug_key";

-- DropIndex
DROP INDEX "Module_key_key";

-- DropIndex
DROP INDEX "OrganizationModule_moduleId_idx";

-- DropIndex
DROP INDEX "OrganizationModule_organizationId_idx";

-- DropIndex
DROP INDEX "OrganizationModule_organizationId_moduleId_key";

-- DropIndex
DROP INDEX "PipelineStage_organizationId_kind_key";

-- DropIndex
DROP INDEX "StageHistory_applicantId_idx";

-- DropIndex
DROP INDEX "StageHistory_stageId_idx";

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "consentGiven",
DROP COLUMN "cvObjectKey",
DROP COLUMN "department",
DROP COLUMN "employeeId",
DROP COLUMN "firstName",
DROP COLUMN "jobTitle",
DROP COLUMN "lastName",
DROP COLUMN "lowMatch",
DROP COLUMN "screeningScore",
DROP COLUMN "screeningSummary",
DROP COLUMN "startDate",
DROP COLUMN "syncAttemptedAt",
DROP COLUMN "syncError",
DROP COLUMN "syncStatus",
DROP COLUMN "updatedAt",
DROP COLUMN "workEmail",
ADD COLUMN     "aiScore" INTEGER,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "cvText" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "source" "ApplicantSource" NOT NULL DEFAULT 'APPLICATION_SITE',
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmailLog" DROP COLUMN "createdAt",
DROP COLUMN "error",
DROP COLUMN "providerId",
DROP COLUMN "sentByUserId",
DROP COLUMN "template",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "applicantId" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SENT';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "slug",
DROP COLUMN "updatedAt",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
DROP COLUMN "key",
ADD COLUMN     "key" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("key");

-- AlterTable
ALTER TABLE "OrganizationModule" DROP COLUMN "enabledAt",
DROP COLUMN "moduleId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "moduleKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PipelineStage" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "kind",
ADD COLUMN     "kind" "StageKind" NOT NULL DEFAULT 'CUSTOM';

-- AlterTable
ALTER TABLE "StageHistory" DROP COLUMN "movedByUserId",
DROP COLUMN "note",
DROP COLUMN "stageId",
ADD COLUMN     "changedById" TEXT,
ADD COLUMN     "fromStageId" TEXT,
ADD COLUMN     "toStageId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Membership";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "ModuleKey";

-- DropEnum
DROP TYPE "PipelineStageKind";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SyncStatus";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "invitation"("organizationId");

-- CreateIndex
CREATE INDEX "Applicant_organizationId_jobId_idx" ON "Applicant"("organizationId", "jobId");

-- CreateIndex
CREATE INDEX "EmailLog_organizationId_applicantId_idx" ON "EmailLog"("organizationId", "applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationModule_organizationId_moduleKey_key" ON "OrganizationModule"("organizationId", "moduleKey");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationModule" ADD CONSTRAINT "OrganizationModule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationModule" ADD CONSTRAINT "OrganizationModule_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "Module"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "PipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
