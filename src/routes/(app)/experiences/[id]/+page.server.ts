import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const experienceId = parseInt(params.id);

		if (isNaN(experienceId)) {
			throw error(404, 'Experience not found');
		}

		const experience = await prisma.experience.findUnique({
			where: { id: experienceId },
			include: {
				tags: true
			}
		});

		if (!experience) {
			throw error(404, 'Experience not found');
		}

		const tags = await prisma.tag.findMany({
			orderBy: { name: 'asc' }
		});

		return {
			experience,
			tags,
			isNew: false
		};
	} catch (err) {
		if (err.status) {
			throw err;
		}

		console.error('Error loading experience:', err);
		throw error(500, 'Failed to load experience');
	}
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		try {
			const experienceId = parseInt(params.id);

			if (isNaN(experienceId)) {
				return fail(400, { error: 'Invalid experience ID' });
			}

			const formData = await request.formData();

			const title = formData.get('title')?.toString();
			const role = formData.get('role')?.toString();
			const company = formData.get('company')?.toString();
			const location = formData.get('location')?.toString();

			const content = formData.get('content')?.toString() || null;

			const startDateStr = formData.get('startDate')?.toString();
			const endDateStr = formData.get('endDate')?.toString();
			const isCurrent = formData.get('isCurrent') === 'on';

			const highlights = formData
				.getAll('highlights')
				.map((h) => h.toString().trim())
				.filter((h) => h.length > 0);

			const tagIds = formData.getAll('tagIds').map((id) => Number(id));

			if (!title || !role || !company || !location || !startDateStr) {
				return fail(400, {
					error: 'Title, role, company, location, and start date are required'
				});
			}

			const startDate = new Date(startDateStr);
			const endDate = !isCurrent && endDateStr ? new Date(endDateStr) : null;

			if (endDate && endDate <= startDate) {
				return fail(400, {
					error: 'End date must be after start date'
				});
			}

			const experience = await prisma.experience.update({
				where: { id: experienceId },
				data: {
					title,
					role,
					company,
					location,

					content,
					startDate,
					endDate,
					highlights,

					tags: {
						set: [],
						connect: tagIds.map((id) => ({ id }))
					}
				}
			});

			throw redirect(303, '/experiences');
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}

			console.error('Error updating experience:', error);
			return fail(500, {
				error: 'Failed to update experience'
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
