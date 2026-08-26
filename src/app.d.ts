// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			// Populated by hooks.server.ts from Lucia. Previously these were
			// typed from the unused Drizzle helpers in $lib/server/auth, which
			// declared a `username` field that Lucia never supplies.
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
