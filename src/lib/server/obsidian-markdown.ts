import { marked } from 'marked';

/**
 * Converts Obsidian Markdown into the HTML this CMS stores.
 *
 * The `content` column holds HTML produced by the Tiptap editor, and the
 * public site renders it with {@html} styled by `.prose-content`. So the
 * conversion target is that same tag vocabulary — p, h2/h3, ul/ol, pre>code,
 * blockquote, table, img, a, strong, em, mark. Obsidian-only syntax is
 * flattened rather than passed through, because it would render unstyled or
 * as a dead link on the public site.
 *
 * NOTE: this logic is intentionally duplicated in
 * mcp-blog-publisher/src/markdown.ts. That package publishes over Prisma
 * directly and does not import from this app. If you change the conversion
 * rules here, change them there too — a divergence means the same note
 * publishes differently depending on which route was used.
 */

export type ConvertOptions = {
	dropLeadingH1?: boolean;
	/** Base URL for resolving ![[embeds]]; embeds are dropped when absent. */
	assetBaseUrl?: string;
};

function stripObsidianSyntax(md: string, opts: ConvertOptions): string {
	let out = md;

	out = out.replace(/!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_m, file: string) => {
		if (!opts.assetBaseUrl) return '';
		const clean = String(file).trim().replace(/^\.\//, '');
		return `![${clean}](${opts.assetBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(clean)})`;
	});

	out = out.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
	out = out.replace(/\[\[([^\]]+)\]\]/g, '$1');

	out = out.replace(/^>\s*\[!([a-zA-Z]+)\][+-]?\s*(.*)$/gm, (_m, _kind: string, title: string) =>
		title ? `> **${title}**` : '>'
	);

	out = out.replace(/```(?:dataview|dataviewjs|tasks)[\s\S]*?```/g, '');
	out = out.replace(/\s*\^[a-zA-Z0-9]{6,}\s*$/gm, '');
	out = out.replace(/%%[\s\S]*?%%/g, '');
	out = out.replace(/==([^=]+)==/g, '<mark>$1</mark>');

	// Dataview inline fields (`Area:: value`) are vault metadata, not prose.
	out = out
		.split('\n')
		.filter((l) => !/^\s*[A-Za-z][A-Za-z0-9 _-]*::\s*/.test(l))
		.join('\n');

	// Bare tag lines and the templates' horizontal rules.
	out = out
		.split('\n')
		.filter((l) => !/^\s*#[a-zA-Z0-9_\-/]+(\s+#[a-zA-Z0-9_\-/]+)*\s*$/.test(l))
		.join('\n')
		.replace(/^\s*_{3,}\s*$/gm, '');

	return out;
}

export function markdownToHtml(md: string, opts: ConvertOptions = {}): string {
	const cleaned = stripObsidianSyntax(md, opts);
	const html = marked.parse(cleaned, { async: false, gfm: true, breaks: false }) as string;

	let out = html;
	if (opts.dropLeadingH1 !== false) {
		out = out.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
	}
	// The site only styles h2/h3; demote deeper headings so they still read.
	out = out.replace(/<(\/?)h[456]>/g, '<$1h4>');

	return out.trim();
}

export function estimateReadingTime(md: string): number {
	const words = md
		.replace(/```[\s\S]*?```/g, '')
		.replace(/[#*_>[\]()`]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

export function deriveExcerpt(md: string, max = 200): string {
	const text = stripObsidianSyntax(md, {})
		.replace(/```[\s\S]*?```/g, '')
		.replace(/^#{1,6}\s.*$/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/[*_`>#]/g, '')
		.split(/\n\s*\n/)
		.map((p) => p.replace(/\s+/g, ' ').trim())
		.find((p) => p.length > 40);

	if (!text) return '';
	return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}
