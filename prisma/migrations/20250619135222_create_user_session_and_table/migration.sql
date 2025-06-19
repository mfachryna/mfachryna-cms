-- AlterTable
ALTER TABLE "blogs" RENAME CONSTRAINT "Blog_pkey" TO "blogs_pkey";

-- AlterTable
ALTER TABLE "contacts" RENAME CONSTRAINT "Contact_pkey" TO "contacts_pkey";

-- AlterTable
ALTER TABLE "experiences" RENAME CONSTRAINT "Experience_pkey" TO "experiences_pkey";

-- AlterTable
ALTER TABLE "projects" RENAME CONSTRAINT "Project_pkey" TO "projects_pkey";

-- AlterTable
ALTER TABLE "tags" RENAME CONSTRAINT "Tag_pkey" TO "tags_pkey";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Blog_slug_key" RENAME TO "blogs_slug_key";

-- RenameIndex
ALTER INDEX "Tag_name_key" RENAME TO "tags_name_key";
