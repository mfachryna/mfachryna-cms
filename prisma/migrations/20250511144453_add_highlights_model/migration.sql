/*
  Warnings:

  - You are about to drop the `_ExperienceTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ExperienceTags" DROP CONSTRAINT "_ExperienceTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExperienceTags" DROP CONSTRAINT "_ExperienceTags_B_fkey";

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "highlights" TEXT[];

-- DropTable
DROP TABLE "_ExperienceTags";

-- CreateTable
CREATE TABLE "_ExperienceToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExperienceToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExperienceToTag_B_index" ON "_ExperienceToTag"("B");

-- AddForeignKey
ALTER TABLE "_ExperienceToTag" ADD CONSTRAINT "_ExperienceToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperienceToTag" ADD CONSTRAINT "_ExperienceToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
