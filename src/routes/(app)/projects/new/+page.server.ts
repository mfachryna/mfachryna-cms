import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: {
				name: 'asc'
			}
		});

		const lastProject = await prisma.project.findFirst({
			orderBy: {
				order: 'desc'
			}
		});

		const nextOrder = (lastProject?.order || 0) + 1;

		return {
			tags,
			nextOrder,
			isNew: true
		};
	} catch (error) {
		console.error('Error loading project form:', error);
		return {
			tags: [],
			nextOrder: 1,
			isNew: true
		};
	}
};

export const actions: Actions = {
	save: async ({ request }) => {
		try {
			const formData = await request.formData();

			const title = formData.get('title')?.toString();
			const subtitle = formData.get('subtitle')?.toString() || null;
			const description = formData.get('description')?.toString();
			const content = formData.get('content')?.toString() || null;
			const liveUrl = formData.get('liveUrl')?.toString() || null;
			const githubUrl = formData.get('githubUrl')?.toString() || null;

			const imageUrl = formData.get('imageUrl')?.toString() || null;
			const thumbnailUrl = formData.get('thumbnailUrl')?.toString() || null;

			const imagesJson = formData.get('additionalImagesJson')?.toString();
			let images = [];
			if (imagesJson) {
				try {
					const rawImages = JSON.parse(imagesJson);
					images = rawImages.map((img: any) => img.url);
				} catch (e) {
					console.warn('Failed to parse images:', e);
				}
			}

			const featured = formData.get('featured') === 'on';
			const order = Number(formData.get('order')) || 1;

			const tagIds = formData.getAll('tagIds').map((id) => Number(id));

			if (!title || !description) {
				return fail(400, {
					error: 'Title and description are required'
				});
			}

			const project = await prisma.project.create({
				data: {
					title,
					subtitle,
					description,
					content,
					liveUrl,
					githubUrl,
					imageUrl,
					thumbnailUrl,
					images,
					featured,
					order,
					tags: {
						connect: tagIds.map((id) => ({ id }))
					}
				}
			});

			throw redirect(303, '/projects');
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}

			console.error('Error creating project:', error);
			return fail(500, {
				error: 'Failed to create project'
			});
		}
	},

	createTag: async ({ request }) => {
		try {
			const formData = await request.formData();

			const tagName = formData.get('tagName')?.toString();
			const isTech = formData.get('isTech') === 'true' || formData.get('isTech') === 'on';

			if (!tagName) {
				return fail(400, {
					error: 'Tag name is required'
				});
			}

			const existingTag = await prisma.tag.findFirst({
				where: {
					name: {
						equals: tagName,
						mode: 'insensitive'
					}
				}
			});

			if (existingTag) {
				return fail(400, {
					error: 'Tag already exists'
				});
			}

			const tag = await prisma.tag.create({
				data: {
					name: tagName,
					isTech
				}
			});

			return {
				success: true,
				tag,
				message: `Tag "${tag.name}" created successfully!`
			};
		} catch (error) {
			console.error('Error creating tag:', error);
			return fail(500, {
				error: 'Failed to create tag'
			});
		}
	}
};
