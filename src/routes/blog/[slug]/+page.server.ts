import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug } = params;
	const isAdmin = Boolean(locals.user);

	const blog = await prisma.blog.findFirst({
		where: {
			slug,
			// Drafts are visible only to a signed-in admin previewing them.
			// Anonymous visitors get a 404 for anything unpublished.
			...(isAdmin ? {} : { published: true })
		},
		include: { tags: true }
	});

	if (!blog) {
		throw error(404, 'Blog post not found');
	}

	// Only count real reads: not admin previews, not drafts.
	if (!isAdmin && blog.published) {
		try {
			await prisma.blog.update({
				where: { id: blog.id },
				data: { views: { increment: 1 } }
			});
		} catch (err) {
			// A failed view counter must never break the page.
			console.error('Failed to increment blog views:', err);
		}
	}

	const tagIds = blog.tags?.map((tag) => tag.id) ?? [];

	const relatedBlogs = tagIds.length
		? await prisma.blog
				.findMany({
					where: {
						id: { not: blog.id },
						published: true,
						tags: { some: { id: { in: tagIds } } }
					},
					include: { tags: true },
					orderBy: { publishedAt: 'desc' },
					take: 3
				})
				.catch((err) => {
					console.error('Failed to load related blogs:', err);
					return [];
				})
		: [];

	return {
		blog,
		relatedBlogs,
		isPreview: isAdmin && !blog.published
	};
};
