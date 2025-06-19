ALTER TABLE "Experience"
RENAME TO "experiences";

ALTER TABLE "Project"
RENAME TO "projects";

ALTER TABLE "Blog"
RENAME TO "blogs";

ALTER TABLE "Tag"
RENAME TO "tags";

ALTER TABLE "Contact"
RENAME TO "contacts";

ALTER TABLE "experiences"
RENAME COLUMN "startDate" TO "start_date";

ALTER TABLE "experiences"
RENAME COLUMN "endDate" TO "end_date";

ALTER TABLE "experiences"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "experiences"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "projects"
RENAME COLUMN "imageUrl" TO "image_url";

ALTER TABLE "projects"
RENAME COLUMN "thumbnailUrl" TO "thumbnail_url";

ALTER TABLE "projects"
RENAME COLUMN "githubUrl" TO "github_url";

ALTER TABLE "projects"
RENAME COLUMN "liveUrl" TO "live_url";

ALTER TABLE "projects"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "projects"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "blogs"
RENAME COLUMN "imageUrl" TO "image_url";

ALTER TABLE "blogs"
RENAME COLUMN "publishedAt" TO "published_at";

ALTER TABLE "blogs"
RENAME COLUMN "readingTime" TO "reading_time";

ALTER TABLE "blogs"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "blogs"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "tags"
RENAME COLUMN "iconUrl" TO "icon_url";

ALTER TABLE "tags"
RENAME COLUMN "isTech" TO "is_tech";

ALTER TABLE "tags"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "tags"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "contacts"
RENAME COLUMN "projectType" TO "project_type";

ALTER TABLE "contacts"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "contacts"
RENAME COLUMN "updatedAt" TO "updated_at";