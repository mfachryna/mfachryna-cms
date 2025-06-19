export * from "./database";

export type { Blog, Project, Experience, Tag, Contact } from "@prisma/client";

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
