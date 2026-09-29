-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'EXPIRED', 'APPROVED');

-- CreateEnum
CREATE TYPE "ApprovalStep" AS ENUM ('GENERAL_SECRETARY', 'VICE_GENERAL_SECRETARY');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AuthEmailType" AS ENUM ('LOGIN_CODE', 'ACTIVATION');

-- CreateEnum
CREATE TYPE "AuthEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "FellowshipYearStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FellowshipOffice" AS ENUM ('CHAIRMAN', 'VICE_CHAIRMAN', 'GENERAL_SECRETARY', 'VICE_GENERAL_SECRETARY', 'TREASURER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('EVENT_CHAIRMAN', 'EVENT_TREASURER', 'EVENT_SECRETARY');

-- CreateTable
CREATE TABLE "Person" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "studyClass" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDecision" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "step" "ApprovalStep" NOT NULL,
    "approverPersonId" UUID NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "status" "MembershipStatus" NOT NULL,
    "fellowshipId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL,
    "associateAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginCode" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthEmail" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "accountId" UUID,
    "type" "AuthEmailType" NOT NULL,
    "toEmail" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "AuthEmailStatus" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FellowshipYear" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "status" "FellowshipYearStatus" NOT NULL,
    "operativeSlot" INTEGER,
    "startedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FellowshipYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FellowshipOfficeAssignment" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "fellowshipYearId" UUID NOT NULL,
    "office" "FellowshipOffice" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FellowshipOfficeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ministry" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinistryLeaderAssignment" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "ministryId" UUID NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinistryLeaderAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "fellowshipYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoleAssignment" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "role" "EventRole" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE INDEX "Application_personId_idx" ON "Application"("personId");

-- CreateIndex
CREATE INDEX "Application_expiresAt_idx" ON "Application"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "application_one_pending_per_person" ON "Application"("personId") WHERE (status = 'PENDING'::"ApplicationStatus");

-- CreateIndex
CREATE INDEX "ApplicationDecision_approverPersonId_idx" ON "ApplicationDecision"("approverPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationDecision_applicationId_step_key" ON "ApplicationDecision"("applicationId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationDecision_applicationId_approverPersonId_key" ON "ApplicationDecision"("applicationId", "approverPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_personId_key" ON "Membership"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_applicationId_key" ON "Membership"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_fellowshipId_key" ON "Membership"("fellowshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_personId_key" ON "Account"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_accountId_idx" ON "Session"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginCode_codeHash_key" ON "LoginCode"("codeHash");

-- CreateIndex
CREATE INDEX "LoginCode_accountId_idx" ON "LoginCode"("accountId");

-- CreateIndex
CREATE INDEX "AuthEmail_personId_type_idx" ON "AuthEmail"("personId", "type");

-- CreateIndex
CREATE INDEX "AuthEmail_accountId_idx" ON "AuthEmail"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "FellowshipYear_label_key" ON "FellowshipYear"("label");

-- CreateIndex
CREATE UNIQUE INDEX "FellowshipYear_operativeSlot_key" ON "FellowshipYear"("operativeSlot");

-- CreateIndex
CREATE INDEX "FellowshipOfficeAssignment_personId_idx" ON "FellowshipOfficeAssignment"("personId");

-- CreateIndex
CREATE INDEX "FellowshipOfficeAssignment_fellowshipYearId_idx" ON "FellowshipOfficeAssignment"("fellowshipYearId");

-- CreateIndex
CREATE UNIQUE INDEX "fellowship_office_one_current_holder" ON "FellowshipOfficeAssignment"("fellowshipYearId", "office") WHERE ("effectiveTo" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "fellowship_office_gs_vgs_distinct_person" ON "FellowshipOfficeAssignment"("fellowshipYearId", "personId") WHERE ("effectiveTo" IS NULL AND office IN ('GENERAL_SECRETARY'::"FellowshipOffice", 'VICE_GENERAL_SECRETARY'::"FellowshipOffice"));

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_name_key" ON "Ministry"("name");

-- CreateIndex
CREATE INDEX "MinistryLeaderAssignment_personId_idx" ON "MinistryLeaderAssignment"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_one_current_leader" ON "MinistryLeaderAssignment"("ministryId") WHERE ("effectiveTo" IS NULL);

-- CreateIndex
CREATE INDEX "Event_fellowshipYearId_idx" ON "Event"("fellowshipYearId");

-- CreateIndex
CREATE INDEX "EventRoleAssignment_personId_idx" ON "EventRoleAssignment"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "event_role_one_current_holder" ON "EventRoleAssignment"("eventId", "role") WHERE ("effectiveTo" IS NULL);

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDecision" ADD CONSTRAINT "ApplicationDecision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDecision" ADD CONSTRAINT "ApplicationDecision_approverPersonId_fkey" FOREIGN KEY ("approverPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginCode" ADD CONSTRAINT "LoginCode_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEmail" ADD CONSTRAINT "AuthEmail_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEmail" ADD CONSTRAINT "AuthEmail_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FellowshipOfficeAssignment" ADD CONSTRAINT "FellowshipOfficeAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FellowshipOfficeAssignment" ADD CONSTRAINT "FellowshipOfficeAssignment_fellowshipYearId_fkey" FOREIGN KEY ("fellowshipYearId") REFERENCES "FellowshipYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryLeaderAssignment" ADD CONSTRAINT "MinistryLeaderAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryLeaderAssignment" ADD CONSTRAINT "MinistryLeaderAssignment_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_fellowshipYearId_fkey" FOREIGN KEY ("fellowshipYearId") REFERENCES "FellowshipYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleAssignment" ADD CONSTRAINT "EventRoleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleAssignment" ADD CONSTRAINT "EventRoleAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

