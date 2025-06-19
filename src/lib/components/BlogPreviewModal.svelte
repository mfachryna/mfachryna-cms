<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Eye, Calendar, Clock, User, Tag, ExternalLink, Edit } from 'lucide-svelte';

	export let blog: any;
	export let show = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function editBlog() {
		dispatch('edit', { id: blog.id });
	}

	function openInNewTab() {
		window.open(`/blog/${blog.slug}`, '_blank');
	}

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

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
</script>

{#if show && blog}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
			<div class="flex items-center justify-between border-b border-gray-200 p-6">
				<div class="flex items-center space-x-3">
					<Eye class="h-5 w-5 text-blue-600" />
					<h2 class="text-lg font-semibold text-gray-900">Blog Preview</h2>
					{#if !blog.published}
						<span
							class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
						>
							Draft
						</span>
					{/if}
					{#if blog.featured}
						<span
							class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
						>
							Featured
						</span>
					{/if}
				</div>

				<div class="flex items-center space-x-2">
					<button
						type="button"
						on:click={editBlog}
						class="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
						title="Edit Blog"
					>
						<Edit class="mr-1 h-4 w-4" />
						Edit
					</button>

					{#if blog.published}
						<button
							type="button"
							on:click={openInNewTab}
							class="flex items-center rounded-lg px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
							title="Open in New Tab"
						>
							<ExternalLink class="mr-1 h-4 w-4" />
							View Live
						</button>
					{/if}

					<button
						type="button"
						on:click={close}
						class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						title="Close"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</div>

			<div class="max-h-[calc(90vh-80px)] overflow-y-auto">
				<article class="max-w-none">
					<div class="relative">
						{#if blog.imageUrl}
							<img src={blog.imageUrl} alt={blog.title} class="h-64 w-full object-cover sm:h-80" />
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
							></div>
						{:else}
							<div class="h-64 w-full bg-gradient-to-r from-blue-600 to-purple-600 sm:h-80"></div>
						{/if}

						<div class="absolute right-0 bottom-0 left-0 p-6 text-white">
							<h1 class="mb-4 text-3xl leading-tight font-bold sm:text-4xl">
								{blog.title}
							</h1>

							{#if blog.description}
								<p class="mb-4 text-lg text-gray-200">
									{blog.description}
								</p>
							{/if}

							<div class="flex flex-wrap items-center gap-4 text-sm text-gray-300">
								<div class="flex items-center">
									<User class="mr-1 h-4 w-4" />
									<span>Admin</span>
								</div>

								{#if blog.publishedAt}
									<div class="flex items-center">
										<Calendar class="mr-1 h-4 w-4" />
										<span>{formatDate(blog.publishedAt)}</span>
									</div>
								{/if}

								<div class="flex items-center">
									<Clock class="mr-1 h-4 w-4" />
									<span>{getReadingTimeText(blog.readingTime)}</span>
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
								<h3 class="mb-6 text-xl font-semibold text-gray-900">Gallery</h3>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{#each blog.images as imageUrl}
										<img
											src={imageUrl}
											alt="Blog gallery"
											class="h-48 w-full cursor-pointer rounded-lg object-cover shadow-sm transition-shadow hover:shadow-md"
											on:click={() => {
												window.open(imageUrl, '_blank');
											}}
										/>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</article>
			</div>
		</div>
	</div>
{/if}

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
	}

	:global(.prose blockquote) {
		border-left: 4px solid #3b82f6;
		background: #f8fafc;
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
		margin: 2rem 0;
	}

	:global(.prose code) {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.prose pre) {
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 0.5rem;
		padding: 1.5rem;
		overflow-x: auto;
	}

	:global(.prose pre code) {
		background: transparent;
		padding: 0;
		color: inherit;
	}
</style>
