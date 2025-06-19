import { prisma } from '$lib/server/auth';
import { fail, redirect, json } from '@sveltejs/kit';

export async function load({ params }) {
	const { id } = params;

	try {
		const tags = await prisma.tag.findMany({
			orderBy: { name: 'asc' }
		});

		if (id === 'new') {
			return {
				blog: null,
				tags,
				isNew: true
			};
		}

		const blogId = Number(id);
		if (isNaN(blogId)) {
			throw redirect(302, '/blogs');
		}

		const blog = await prisma.blog.findUnique({
			where: { id: blogId },
			include: {
				tags: true
			}
		});

		if (!blog) {
			throw redirect(302, '/blogs');
		}

		return {
			blog,
			tags,
			isNew: false
		};
	} catch (error) {
		console.error('Failed to load blog:', error);
		throw redirect(302, '/blogs');
	}
}

export const actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const { id } = params;

		const title = data.get('title') as string;
		const slug = data.get('slug') as string;
		const description = data.get('description') as string;
		const content = data.get('content') as string;
		const excerpt = data.get('excerpt') as string;
		const imageUrl = data.get('imageUrl') as string;
		const published = data.has('published');
		const featured = data.has('featured');
		const readingTime = data.get('readingTime') as string;

		const tagIds = data.getAll('tagIds').map((id) => Number(id));

		const additionalImagesJson = data.get('additionalImagesJson') as string;
		let additionalImages: string[] = [];

		if (additionalImagesJson) {
			try {
				const rawImages = JSON.parse(additionalImagesJson);

				additionalImages = rawImages.map((img: any) => img.url);
			} catch (error) {
				console.error('Failed to parse additional images:', error);
			}
		}

		if (!title || !slug || !description || !content) {
			return fail(400, {
				error: 'Title, slug, description, and content are required'
			});
		}

		try {
			if (id === 'new') {
				const blog = await prisma.blog.create({
					data: {
						title,
						slug,
						description,
						content,
						excerpt: excerpt || null,
						imageUrl: imageUrl || null,
						images: additionalImages,
						published,
						featured,
						readingTime: readingTime ? Number(readingTime) : null,
						publishedAt: published ? new Date() : null,
						tags: {
							connect: tagIds.map((id) => ({ id }))
						}
					},
					include: { tags: true }
				});

				throw redirect(302, '/blogs');
			} else {
				const existingBlog = await prisma.blog.findUnique({
					where: { id: Number(id) }
				});

				const blog = await prisma.blog.update({
					where: { id: Number(id) },
					data: {
						title,
						slug,
						description,
						content,
						excerpt: excerpt || null,
						imageUrl: imageUrl || null,
						images: additionalImages,
						published,
						featured,
						readingTime: readingTime ? Number(readingTime) : null,
						publishedAt:
							published && !existingBlog?.published ? new Date() : existingBlog?.publishedAt,
						tags: {
							set: tagIds.map((id) => ({ id }))
						}
					},
					include: { tags: true }
				});

				return {
					success: true,
					message: 'Blog post updated successfully!'
				};
			}
		} catch (error: any) {
			if (error?.status === 302) {
				throw error;
			}

			console.error('❌ Failed to save blog:', error);

			if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
				return fail(400, {
					error: 'A blog post with this slug already exists'
				});
			}

			return fail(500, {
				error: 'Failed to save blog post'
			});
		}
	},

	createTag: async ({ request }) => {
		try {
			const formData = await request.formData();
			const tagName = formData.get('tagName') as string;
			const isTech = formData.get('isTech') === 'true';

			if (!tagName || tagName.trim().length === 0) {
				return fail(400, {
					type: 'error',
					error: 'Tag name is required'
				});
			}

			const existingTag = await prisma.tag.findFirst({
				where: {
					OR: [
						{ name: tagName.trim() },
						{ iconUrl: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
					]
				}
			});

			if (existingTag) {
				return fail(400, {
					type: 'error',
					error: 'A tag with this name already exists'
				});
			}

			const tag = await prisma.tag.create({
				data: {
					name: tagName.trim(),
					iconUrl: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
					isTech: isTech
				}
			});

			return {
				type: 'success',
				tag: {
					id: tag.id,
					name: tag.name,
					iconUrl: tag.iconUrl,
					isTech: tag.isTech
				},
				message: `Tag "${tag.name}" created successfully!`
			};
		} catch (error) {
			console.error('Error creating tag:', error);
			return fail(500, {
				type: 'error',
				error: 'Failed to create tag. Please try again.'
			});
		}
	}
};
