import { lucia } from '$lib/server/auth';
import { json, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';

/**
 * Routes under /api are fail-closed: anything not explicitly listed here
 * requires a valid admin session. The CMS calls these endpoints with
 * same-origin `fetch`, so the session cookie is sent automatically.
 *
 * Add a path here only if it is genuinely meant to be public.
 */
const PUBLIC_API_ROUTES: string[] = [];

/**
 * Routes that may alternatively authenticate with a bearer token, for clients
 * that cannot hold a browser session — currently the Obsidian publisher
 * plugin. Session auth still works on these; the token is an additional path,
 * never a replacement.
 */
const TOKEN_API_ROUTES: string[] = ['/api/publish', '/api/upload'];

function isApiRoute(pathname: string) {
	if (!pathname.startsWith('/api')) return false;
	return !PUBLIC_API_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
}

function allowsToken(pathname: string) {
	return TOKEN_API_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Constant-time compare so the token cannot be recovered by timing. */
function tokenMatches(provided: string, expected: string) {
	const a = Buffer.from(provided);
	const b = Buffer.from(expected);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

function hasValidToken(request: Request) {
	const expected = env.PUBLISH_TOKEN;
	// An unset or trivially short token must never grant access.
	if (!expected || expected.length < 24) return false;

	const header = request.headers.get('authorization') ?? '';
	const match = /^Bearer\s+(.+)$/i.exec(header.trim());
	if (!match) return false;

	return tokenMatches(match[1].trim(), expected);
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;

		if (isApiRoute(path)) {
			if (allowsToken(path) && hasValidToken(event.request)) {
				return resolve(event);
			}
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	if (!user && isApiRoute(path)) {
		if (allowsToken(path) && hasValidToken(event.request)) {
			return resolve(event);
		}
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	return resolve(event);
};
