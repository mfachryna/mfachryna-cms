import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(302, '/login');
	}

	const user = event.locals.user;

	try {
		const contactGroups = await prisma.contact.groupBy({
			by: ['status'],
			where: {
				status: { in: ['new', 'in-progress'] }
			},
			_count: {
				status: true
			}
		});

		let newContactsCount = 0;
		let inProgressCount = 0;
		for (const group of contactGroups) {
			if (group.status === 'new') newContactsCount = group._count.status;
			if (group.status === 'in-progress') inProgressCount = group._count.status;
		}

		return {
			user,
			newContactsCount,
			totalNotifications: newContactsCount + inProgressCount
		};
	} catch (error) {
		console.error('Failed to load layout data:', error);
		return {
			user,
			newContactsCount: 0,
			totalNotifications: 0
		};
	}
};
