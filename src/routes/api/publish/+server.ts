import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/auth';
import {
	markdownToHtml,
	estimateReadingTime,
	deriveExcerpt,
	slugify
} from '$lib/server/obsidian-markdown';
import type { RequestHandler } from './$types';

/**
 * Publish endpoint for external editors (the Obsidian plugin).
 *
 * Auth is handled in hooks.server.ts: either an admin session cookie, or a
 * PUBLISH_TOKEN bearer token. This handler is only reached once one of those
 * passed, but it re-checks below as defence in depth.
 *
 * Accepts Markdown and converts server-side so that the conversion rules live
 * in one place rather than in every client.
 *
 * Upserts on `slug` — re-publishing an edited note updates the existing post.
 * Nothing is ever deleted.
 */

const MAX_MARKDOWN_BYTES = 512 * 1024;

type Payload = {
	title?: string;
	markdown?: string;
	slug?: string;
	description?: string;
	excerpt?: string;
	imageUrl?: string | null;
	tags?: string[];
	publish?: boolean;
	/** Promote this post to the wide hero slot on page 1 of /blog. */
	featured?: boolean;
	assetBaseUrl?: string;
	lang?: string;
	locale?: string;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	// hooks.server.ts already gated this, but a publish endpoint is worth a
	// second check in case that guard is ever loosened.
	const authorized =
		Boolean(locals.user) || /^Bearer\s+.+/i.test(request.headers.get('authorization') ?? '');
	if (!authorized) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: Payload;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Body must be JSON' }, { status: 400 });
	}

	const title = typeof body.title === 'string' ? body.title.trim() : '';
	const markdown = typeof body.markdown === 'string' ? body.markdown : '';

	if (!title) return json({ error: 'title is required' }, { status: 400 });
	if (!markdown.trim()) return json({ error: 'markdown is required' }, { status: 400 });

	if (Buffer.byteLength(markdown, 'utf8') > MAX_MARKDOWN_BYTES) {
		return json({ error: 'markdown exceeds 512KB' }, { status: 413 });
	}

	const slug = (typeof body.slug === 'string' && body.slug.trim()) || slugify(title);
	if (!slug) return json({ error: 'could not derive a slug from the title' }, { status: 400 });

	const html = markdownToHtml(markdown, { assetBaseUrl: body.assetBaseUrl });
	if (!html.trim()) {
		return json({ error: 'note is empty after conversion — nothing to publish' }, { status: 400 });
	}

	const description =
		(typeof body.description === 'string' && body.description.trim()) || deriveExcerpt(markdown);
	const excerpt =
		(typeof body.excerpt === 'string' && body.excerpt.trim()) || deriveExcerpt(markdown, 160);

	// `blog` is the marker tag used to find the note; it is not a topic.
	const tags = (Array.isArray(body.tags) ? body.tags : [])
		.filter((t): t is string => typeof t === 'string')
		.map((t) => t.replace(/^#/, '').trim())
		.filter((t) => t && !/^blog(\/|$)/i.test(t) && !/^note(\/|$)/i.test(t))
		.slice(0, 12);

	// Extract language from payload or frontmatter and ensure it is tagged
	const langMatch = markdown.match(/^---\r?\n[\s\S]*?\n(?:lang|locale):\s*["']?([a-zA-Z-]+)["']?[\s\S]*?\n---/i);
	const explicitLang = (body.lang || body.locale || langMatch?.[1])?.trim().toLowerCase();
	if (explicitLang && !tags.some((t) => t.toLowerCase() === explicitLang)) {
		tags.push(explicitLang);
	}

	const shouldPublish = body.publish === true;
	const featured = body.featured === true;

	try {
		const existing = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });

		const tagConnect = tags.map((name) => ({
			where: { name },
			create: { name, isTech: true }
		}));

		const data = {
			title,
			description,
			excerpt,
			content: html,
			imageUrl: body.imageUrl ?? null,
			readingTime: estimateReadingTime(markdown),
			published: shouldPublish,
			featured,
			...(shouldPublish ? { publishedAt: new Date() } : {})
		};

		const blog = await prisma.blog.upsert({
			where: { slug },
			update: { ...data, tags: { set: [], connectOrCreate: tagConnect } },
			create: { ...data, slug, tags: { connectOrCreate: tagConnect } },
			include: { tags: true }
		});

		return json({
			success: true,
			action: existing ? 'updated' : 'created',
			id: blog.id,
			slug: blog.slug,
			published: blog.published,
			featured: blog.featured,
			readingTime: blog.readingTime,
			tags: blog.tags.map((t) => t.name)
		});
	} catch (err) {
		console.error('Publish failed:', err);
		return json({ error: 'Failed to publish' }, { status: 500 });
	}
};
