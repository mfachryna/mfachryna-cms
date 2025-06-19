import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	try {
		const blog = await prisma.blog.findFirst({
			where: {
				slug
			},
			include: {}
		});

		if (!blog) {
			throw error(404, 'Blog post not found');
		}

		await prisma.blog.update({
			where: { id: blog.id },
			data: {
				views: {
					increment: 1
				}
			}
		});

		const tagIds = blog.tags?.map((tag) => tag.id) || [];

		let relatedBlogs = [];

		if (tagIds.length > 0) {
			relatedBlogs = await prisma.blog.findMany({
				where: {
					id: { not: blog.id },
					published: true,
					tags: {
						some: {
							id: {
								in: tagIds
							}
						}
					}
				},
				include: {
					tags: true
				},
				orderBy: {
					publishedAt: 'desc'
				},
				take: 3
			});
		}

		return {
			blog,
			relatedBlogs
		};
	} catch (err) {
		console.error('Error loading blog:', err);

		if (err?.status) {
		}

		throw error(500, 'Failed to load blog post');
	}
};
