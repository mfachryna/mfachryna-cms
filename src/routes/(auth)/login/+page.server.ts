import { lucia, prisma } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		throw redirect(302, '/dashboard');
	}

	const userCount = await prisma.user.count();

	return {
		hasUsers: userCount > 0
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (
			typeof email !== 'string' ||
			email.length < 3 ||
			email.length > 255 ||
			!email.includes('@')
		) {
			return fail(400, {
				error: 'Invalid email',
				data: { email }
			});
		}

		if (typeof password !== 'string' || password.length < 1 || password.length > 255) {
			return fail(400, {
				error: 'Invalid password',
				data: { email }
			});
		}

		try {
			const existingUser = await prisma.user.findUnique({
				where: { email: email.toLowerCase() }
			});

			if (!existingUser) {
				return fail(400, {
					error: 'Incorrect email or password',
					data: { email }
				});
			}

			const validPassword = await bcrypt.compare(password, existingUser.password);
			if (!validPassword) {
				return fail(400, {
					error: 'Incorrect email or password',
					data: { email }
				});
			}

			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (e) {
			console.error('Login error:', e);
			return fail(500, {
				error: 'An unknown error occurred',
				data: { email }
			});
		}

		throw redirect(302, '/dashboard');
	}
};
