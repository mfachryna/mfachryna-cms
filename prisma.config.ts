import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 moved the datasource URL out of schema.prisma. The CLI (migrate,
 * db push, studio) reads it from here; the runtime client gets it separately
 * through the driver adapter in src/lib/server/prisma/database.ts.
 */
export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		url: process.env.DATABASE_URL
	}
});
