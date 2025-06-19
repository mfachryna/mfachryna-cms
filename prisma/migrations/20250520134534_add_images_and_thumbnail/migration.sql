-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "readingTime" INTEGER,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "iconUrl" TEXT;
