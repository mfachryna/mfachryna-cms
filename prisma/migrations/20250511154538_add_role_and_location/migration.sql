/*
  Warnings:

  - Added the required column `location` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns as nullable
ALTER TABLE "Experience" ADD COLUMN "role" TEXT;
ALTER TABLE "Experience" ADD COLUMN "location" TEXT;

-- Add default values to existing records
UPDATE "Experience" SET "role" = 'Not Specified' WHERE "role" IS NULL;
UPDATE "Experience" SET "location" = 'Not Specified' WHERE "location" IS NULL;

-- Now make the columns non-nullable
ALTER TABLE "Experience" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "Experience" ALTER COLUMN "location" SET NOT NULL;
