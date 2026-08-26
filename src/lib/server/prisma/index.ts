export * from "./database";

// `export type { X } from '...'` is a pure re-export: it forwards the names
// but does NOT bring them into this module's scope, so the aliases below
// could not see them. Import as well as re-export.
import type { Blog, Project, Experience, Tag } from '@prisma/client';

export type { Blog, Project, Experience, Tag, Contact } from '@prisma/client';

export type BlogWithTags = Blog & {
    tags: Tag[];
};

export type ProjectWithTags = Project & {
    tags: Tag[];
};

export type ExperienceWithTags = Experience & {
    tags: Tag[];
};

export type PaginatedBlogs = {
    blogs: BlogWithTags[];
    total: number;
    page: number;
    totalPages: number;
};
