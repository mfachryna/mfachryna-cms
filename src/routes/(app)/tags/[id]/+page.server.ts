import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const tagId = parseInt(params.id);

		if (isNaN(tagId)) {
			throw error(404, 'Tag not found');
		}

		const tag = await prisma.tag.findUnique({
			where: { id: tagId },
			include: {
				_count: {
					select: {
						blogs: true,
						projects: true,
						experiences: true
					}
				}
			}
		});

		if (!tag) {
			throw error(404, 'Tag not found');
		}

		const tagWithUsage = {
			...tag,
			usageCount: tag._count.blogs + tag._count.projects + tag._count.experiences
		};

		return {
			tag: tagWithUsage
		};
	} catch (err) {
		if (err.status) {
			throw err;
		}

		console.error('Error loading tag:', err);
		throw error(500, 'Failed to load tag');
	}
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		try {
			const tagId = parseInt(params.id);

			if (isNaN(tagId)) {
				return fail(400, { error: 'Invalid tag ID' });
			}

			const formData = await request.formData();

			const name = formData.get('name')?.toString().trim();
			const isTech = formData.get('isTech') === 'on';
			const iconUrl = formData.get('iconUrl')?.toString().trim() || null;

			if (!name) {
				return fail(400, {
					error: 'Tag name is required'
				});
			}

			const existingTag = await prisma.tag.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive'
					},
					NOT: {
						id: tagId
					}
				}
			});

			if (existingTag) {
				return fail(400, {
					error: 'A tag with this name already exists'
				});
			}

			const tag = await prisma.tag.update({
				where: { id: tagId },
				data: {
					name,
					isTech,
					iconUrl
				}
			});

			throw redirect(303, '/tags');
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}

			console.error('Error updating tag:', error);
			return fail(500, {
				error: 'Failed to update tag'
			});
		}
	},

	delete: async ({ params }) => {
		try {
			const tagId = parseInt(params.id);

			if (isNaN(tagId)) {
				return fail(400, { error: 'Invalid tag ID' });
			}

			const tagWithUsage = await prisma.tag.findUnique({
				where: { id: tagId },
				include: {
					_count: {
						select: {
							blogs: true,
							projects: true,
							experiences: true
						}
					}
				}
			});

			if (!tagWithUsage) {
				return fail(404, {
					error: 'Tag not found'
				});
			}

			const totalUsage =
				tagWithUsage._count.blogs + tagWithUsage._count.projects + tagWithUsage._count.experiences;

			if (totalUsage > 0) {
				return fail(400, {
					error: `Cannot delete tag "${tagWithUsage.name}" because it is being used by ${totalUsage} item(s). Remove it from all content first.`
				});
			}

			await prisma.tag.delete({
				where: { id: tagId }
			});

			throw redirect(303, '/tags');
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}

			console.error('Error deleting tag:', error);
			return fail(500, {
				error: 'Failed to delete tag'
			});
		}
	}
};
