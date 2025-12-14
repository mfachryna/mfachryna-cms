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

		// const lastExperience = await prisma.experience.findFirst({
		// 	orderBy: {
		// 		order: 'desc'
		// 	}
		// });

		// const nextOrder = (lastExperience?.order || 0) + 1;

		return {
			tags,
			// nextOrder,
			isNew: true
		};
	} catch (error) {
		console.error('Error loading experience form:', error);
		return {
			tags: [],
			// nextOrder: 1,
			isNew: true
		};
	}
};

export const actions: Actions = {
	save: async ({ request }) => {
		try {
			const formData = await request.formData();

			const title = formData.get('title')?.toString();
			const role = formData.get('role')?.toString();
			const company = formData.get('company')?.toString();
			const location = formData.get('location')?.toString();
			const description = formData.get('description')?.toString() || null;
			const content = formData.get('content')?.toString() || null;

			const startDateStr = formData.get('startDate')?.toString();
			const endDateStr = formData.get('endDate')?.toString();
			const isCurrent = formData.get('isCurrent') === 'on';
			const isHidden = formData.get('isHidden') === 'on';

			const highlights = formData
				.getAll('highlights')
				.map((h) => h.toString().trim())
				.filter((h) => h.length > 0);

			const tagIds = formData.getAll('tagIds').map((id) => Number(id));

			if (!title || !role || !company || !location || !startDateStr) {
				return fail(400, {
					error: 'Title, role, company, location, and start date are required',
					data: {
						title,
						role,
						company,
						location,
						content,
						startDate: startDateStr,
						endDate: endDateStr,
						isCurrent,
						isHidden,
						highlights,
						tagIds
					}
				});
			}

			const startDate = new Date(startDateStr);
			const endDate = !isCurrent && endDateStr ? new Date(endDateStr) : null;

			if (endDate && endDate <= startDate) {
				return fail(400, {
					error: 'End date must be after start date'
				});
			}

			const experience = await prisma.experience.create({
				data: {
					title,
					role,
					company,
					location,
					description,
					content,
					startDate,
					endDate,
					isHidden,
					highlights,
					tags: {
						connect: tagIds.map((id) => ({ id }))
					}
				}
			});

			throw redirect(303, '/experiences');
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}

			console.error('Error creating experience:', error);
			return fail(500, {
				error: 'Failed to create experience'
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
