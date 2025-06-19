import { lucia, prisma } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const userCount = await prisma.user.count();

	if (userCount > 0) {
		throw redirect(302, '/login');
	}

	if (event.locals.user) {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const userCount = await prisma.user.count();
		if (userCount > 0) {
			throw redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (typeof name !== 'string' || name.length < 1 || name.length > 255) {
			return fail(400, {
				error: 'Invalid name',
				data: { name, email }
			});
		}

		if (
			typeof email !== 'string' ||
			email.length < 3 ||
			email.length > 255 ||
			!email.includes('@')
		) {
			return fail(400, {
				error: 'Invalid email',
				data: { name, email }
			});
		}

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				data: { name, email }
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match',
				data: { name, email }
			});
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 12);

			const user = await prisma.user.create({
				data: {
					name,
					email: email.toLowerCase(),
					password: hashedPassword
				}
			});

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (e) {
			console.error('Setup error:', e);
			return fail(500, {
				error: 'An unknown error occurred',
				data: { name, email }
			});
		}

		throw redirect(302, '/dashboard');
	}
};
