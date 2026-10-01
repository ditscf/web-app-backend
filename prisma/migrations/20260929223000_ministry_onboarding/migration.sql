-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "onboardedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MinistryMembership" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "ministryId" UUID NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinistryMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MinistryMembership_ministryId_idx" ON "MinistryMembership"("ministryId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_membership_one_current" ON "MinistryMembership"("personId", "ministryId") WHERE ("effectiveTo" IS NULL);

-- AddForeignKey
ALTER TABLE "MinistryMembership" ADD CONSTRAINT "MinistryMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryMembership" ADD CONSTRAINT "MinistryMembership_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
