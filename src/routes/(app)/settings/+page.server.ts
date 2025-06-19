import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/auth';
import bcrypt from 'bcryptjs';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const data = await request.formData();
			const name = data.get('name') as string;
			const email = data.get('email') as string;

			if (!name || !email) {
				return fail(400, { error: 'Name and email are required' });
			}

			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					name,
					email,
					updatedAt: new Date()
				}
			});

			return {
				success: true,
				message: 'Profile updated successfully'
			};
		} catch (err) {
			console.error('Error updating profile:', err);
			return fail(500, { error: 'Failed to update profile' });
		}
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const data = await request.formData();
			const currentPassword = data.get('currentPassword') as string;
			const newPassword = data.get('newPassword') as string;
			const confirmPassword = data.get('confirmPassword') as string;

			if (!currentPassword || !newPassword || !confirmPassword) {
				return fail(400, { error: 'All password fields are required' });
			}

			if (newPassword !== confirmPassword) {
				return fail(400, { error: 'New passwords do not match' });
			}

			if (newPassword.length < 8) {
				return fail(400, { error: 'Password must be at least 8 characters' });
			}

			const user = await prisma.user.findUnique({
				where: { id: locals.user.id }
			});

			if (!user) {
				return fail(400, { error: 'User not found' });
			}

			const isValidPassword = await bcrypt.compare(currentPassword, user.password);
			if (!isValidPassword) {
				return fail(400, { error: 'Current password is incorrect' });
			}

			const hashedPassword = await bcrypt.hash(newPassword, 12);

			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					password: hashedPassword,
					updatedAt: new Date()
				}
			});

			return {
				success: true,
				message: 'Password updated successfully'
			};
		} catch (err) {
			console.error('Error changing password:', err);
			return fail(500, { error: 'Failed to change password' });
		}
	}
};
