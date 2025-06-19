import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(302, '/login');
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: event.locals.user.id },
			select: {
				id: true,
				name: true,
				email: true
			}
		});

		if (!user) {
			throw redirect(302, '/login');
		}

		const [newContactsCount, totalNotifications] = await Promise.all([
			prisma.contact.count({
				where: { status: 'new' }
			}),
			prisma.contact.count({
				where: {
					OR: [{ status: 'new' }, { status: 'in-progress' }]
				}
			})
		]);

		return {
			user,
			newContactsCount,
			totalNotifications
		};
	} catch (error) {
		console.error('Failed to load layout data:', error);
		throw redirect(302, '/login');
	}
};
