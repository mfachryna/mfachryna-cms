import { prisma } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const tags = await prisma.tag.findMany({
			include: {
				_count: {
					select: {
						blogs: true,
						projects: true,
						experiences: true
					}
				}
			},
			orderBy: {
				name: 'asc'
			}
		});

		const tagsWithUsage = tags.map((tag) => ({
			...tag,
			usageCount:
				(tag._count?.blogs || 0) + (tag._count?.projects || 0) + (tag._count?.experiences || 0)
		}));

		return {
			tags: tagsWithUsage
		};
	} catch (error) {
		console.error('Failed to load tags:', error);
		return {
			tags: []
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const tagName = data.get('tagName') as string;
		const iconUrl = data.get('iconUrl') as string;
		const isTech = data.get('isTech') === 'on';

		if (!tagName || !tagName.trim()) {
			return fail(400, { error: 'Tag name is required' });
		}

		try {
			const existingTag = await prisma.tag.findFirst({
				where: {
					name: {
						equals: tagName.trim(),
						mode: 'insensitive'
					}
				}
			});

			if (existingTag) {
				return fail(400, { error: 'A tag with this name already exists' });
			}

			await prisma.tag.create({
				data: {
					name: tagName.trim(),
					iconUrl: iconUrl.trim() || null,
					isTech
				}
			});

			return {
				success: true,
				message: 'Tag created successfully'
			};
		} catch (error) {
			console.error('Failed to create tag:', error);
			return fail(500, { error: 'Failed to create tag' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		try {
			await prisma.tag.delete({
				where: { id: Number(id) }
			});

			return {
				success: true,
				message: 'Tag deleted successfully'
			};
		} catch (error) {
			console.error('Failed to delete tag:', error);
			return fail(500, { error: 'Failed to delete tag' });
		}
	}
};
