import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '$env/dynamic/private';

/**
 * Prisma 7 supplies the connection string through a driver adapter rather
 * than the schema's datasource block. The adapter also owns the pool — `max`
 * caps connections per serverless instance so cold-start bursts cannot
 * exhaust the database's connection limit.
 */
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createClient() {
	const adapter = new PrismaPg({
		connectionString: env.DATABASE_URL,
		max: 3
	});
	return new PrismaClient({ adapter, log: ['warn', 'error'] });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
