<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		Calendar,
		Clock,
		User,
		Tag,
		ArrowLeft,
		Share2,
		Eye,
		Heart,
		MessageCircle,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	export let data;

	const { blog, relatedBlogs } = data;

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getReadingTimeText(minutes: number) {
		return minutes === 1 ? '1 min read' : `${minutes} mins read`;
	}

	async function sharePost() {
		const shareData = {
			title: blog.title,
			text: blog.description,
			url: window.location.href
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				copyToClipboard();
			}
		} else {
			copyToClipboard();
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(window.location.href);

		alert('Link copied to clipboard!');
	}

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>{blog.title} - Your Blog</title>
	<meta name="description" content={blog.description} />
	<meta property="og:title" content={blog.title} />
	<meta property="og:description" content={blog.description} />
	<meta property="og:image" content={blog.imageUrl} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={blog.title} />
	<meta name="twitter:description" content={blog.description} />
	<meta name="twitter:image" content={blog.imageUrl} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<nav class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<button
					on:click={goHome}
					class="flex items-center text-gray-600 transition-colors hover:text-gray-800"
				>
					<ArrowLeft class="mr-2 h-5 w-5" />
					Back to Home
				</button>

				<button
					on:click={sharePost}
					class="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				>
					<Share2 class="mr-2 h-4 w-4" />
					Share
				</button>
			</div>
		</div>
	</nav>

	<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<article class="overflow-hidden rounded-lg bg-white shadow-sm">
			<div class="relative">
				{#if blog.imageUrl}
					<img
						src={blog.imageUrl}
						alt={blog.title}
						class="h-64 w-full object-cover sm:h-80 lg:h-96"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
					></div>
				{:else}
					<div
						class="h-64 w-full bg-gradient-to-r from-blue-600 to-purple-600 sm:h-80 lg:h-96"
					></div>
				{/if}

				<div class="absolute right-0 bottom-0 left-0 p-6 text-white sm:p-8">
					<div class="max-w-3xl">
						{#if blog.featured}
							<span
								class="mb-4 inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium text-yellow-900"
							>
								⭐ Featured
							</span>
						{/if}

						<h1 class="mb-4 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
							{blog.title}
						</h1>

						{#if blog.description}
							<p class="mb-6 text-lg text-gray-200 sm:text-xl">
								{blog.description}
							</p>
						{/if}

						<div class="flex flex-wrap items-center gap-4 text-sm text-gray-300">
							<div class="flex items-center">
								<User class="mr-1 h-4 w-4" />
								<span>Admin</span>
							</div>

							<div class="flex items-center">
								<Calendar class="mr-1 h-4 w-4" />
								<span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
							</div>

							<div class="flex items-center">
								<Clock class="mr-1 h-4 w-4" />
								<span>{getReadingTimeText(blog.readingTime)}</span>
							</div>

							{#if blog.views}
								<div class="flex items-center">
									<Eye class="mr-1 h-4 w-4" />
									<span>{blog.views} views</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="p-6 sm:p-8 lg:p-12">
				{#if blog.tags && blog.tags.length > 0}
					<div class="mb-8 flex flex-wrap gap-2">
						{#each blog.tags as tag}
							<span
								class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {tag.isTech
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 text-gray-800'}"
							>
								<Tag class="mr-1 h-3 w-3" />
								{tag.name}
							</span>
						{/each}
					</div>
				{/if}

				<div class="prose prose-lg max-w-none">
					{@html blog.content}
				</div>

				{#if blog.images && blog.images.length > 0}
					<div class="mt-12">
						<h3 class="mb-6 text-2xl font-bold text-gray-900">Gallery</h3>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each blog.images as image}
								<img
									src={image.url || image}
									alt="Blog gallery"
									class="h-48 w-full cursor-pointer rounded-lg object-cover shadow-sm transition-shadow hover:shadow-md"
									on:click={() => {
										window.open(image.url || image, '_blank');
									}}
								/>
							{/each}
						</div>
					</div>
				{/if}

				<div class="mt-12 border-t border-gray-200 pt-8">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<button class="flex items-center text-gray-600 transition-colors hover:text-red-600">
								<Heart class="mr-1 h-5 w-5" />
								<span>Like</span>
							</button>

							<button class="flex items-center text-gray-600 transition-colors hover:text-blue-600">
								<MessageCircle class="mr-1 h-5 w-5" />
								<span>Comment</span>
							</button>
						</div>

						<button
							on:click={sharePost}
							class="flex items-center text-gray-600 transition-colors hover:text-green-600"
						>
							<Share2 class="mr-1 h-5 w-5" />
							<span>Share</span>
						</button>
					</div>
				</div>
			</div>
		</article>
	</main>
</div>

<style>
	:global(.prose) {
		color: #374151;
		line-height: 1.75;
	}

	:global(.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6) {
		color: #111827;
		font-weight: 600;
		line-height: 1.25;
	}

	:global(.prose h1) {
		font-size: 2.25rem;
		margin-top: 0;
		margin-bottom: 2rem;
	}

	:global(.prose h2) {
		font-size: 1.875rem;
		margin-top: 2.5rem;
		margin-bottom: 1.5rem;
	}

	:global(.prose h3) {
		font-size: 1.5rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	:global(.prose p) {
		margin-bottom: 1.5rem;
	}

	:global(.prose img) {
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		margin: 2rem 0;
	}

	:global(.prose blockquote) {
		border-left: 4px solid #3b82f6;
		background: #f8fafc;
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
		margin: 2rem 0;
		font-style: italic;
	}

	:global(.prose code) {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		color: #e11d48;
	}

	:global(.prose pre) {
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 0.5rem;
		padding: 1.5rem;
		overflow-x: auto;
		margin: 2rem 0;
	}

	:global(.prose pre code) {
		background: transparent;
		padding: 0;
		color: inherit;
	}

	:global(.prose a) {
		color: #3b82f6;
		text-decoration: underline;
		text-decoration-color: #93c5fd;
		transition: all 0.2s ease;
	}

	:global(.prose a:hover) {
		color: #1d4ed8;
		text-decoration-color: #3b82f6;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
