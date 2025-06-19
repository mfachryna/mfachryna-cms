<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		X,
		Tag,
		Code,
		Hash,
		FileText,
		FolderOpen,
		Briefcase,
		Calendar,
		TrendingUp,
		Users,
		Edit,
		Settings
	} from 'lucide-svelte';

	export let show = false;
	export let tag: any = null;

	const dispatch = createEventDispatcher();

	$: safeTag = tag || {};
	$: tagName = safeTag.name || 'Untitled Tag';
	$: tagIsTech = safeTag.isTech || false;
	$: tagCreatedAt = safeTag.createdAt || null;
	$: tagUpdatedAt = safeTag.updatedAt || null;
	$: tagUsageCount = safeTag.usageCount || 0;
	$: tagCounts = safeTag._count || { blogs: 0, projects: 0, experiences: 0 };

	function closeModal() {
		show = false;
		dispatch('close');
	}

	function handleEdit() {
		if (safeTag.id) {
			dispatch('edit', { tag: safeTag });
			closeModal();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!show) return;

		if (event.key === 'Escape') {
			closeModal();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}

	function formatDate(dateString: string): string {
		try {
			if (!dateString) return 'Date not available';

			const date = new Date(dateString);
			if (isNaN(date.getTime())) return 'Invalid date';

			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Date formatting error';
		}
	}

	function getUsageText(count: number): string {
		if (count === 0) return 'Not used';
		if (count === 1) return '1 time';
		return `${count} times`;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show && tag}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
		>
			<div
				class="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6"
			>
				<div class="flex items-center space-x-4">
					<div
						class="h-12 w-12 {tagIsTech
							? 'bg-blue-100'
							: 'bg-purple-100'} flex items-center justify-center rounded-lg"
					>
						{#if tagIsTech}
							<Code class="h-6 w-6 text-blue-600" />
						{:else}
							<Tag class="h-6 w-6 text-purple-600" />
						{/if}
					</div>

					<div>
						<h2 id="modal-title" class="text-xl font-bold text-gray-900">
							{tagName}
						</h2>
						<div class="mt-1 flex items-center space-x-2">
							<span
								class="rounded-full px-2 py-1 text-xs font-medium {tagIsTech
									? 'bg-blue-100 text-blue-800'
									: 'bg-purple-100 text-purple-800'}"
							>
								{tagIsTech ? 'Technology' : 'General'}
							</span>
							<span class="text-sm text-gray-600">
								Used {getUsageText(tagUsageCount)}
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<button
						on:click={handleEdit}
						class="rounded bg-purple-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-700"
					>
						Edit
					</button>
					<button
						on:click={closeModal}
						class="rounded-lg p-2 transition-colors hover:bg-gray-100"
						aria-label="Close modal"
					>
						<X class="h-5 w-5" />
					</button>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto">
				<div class="space-y-6 p-6">
					<div>
						<h3 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
							<TrendingUp class="mr-2 h-5 w-5 text-green-600" />
							Usage Statistics
						</h3>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div class="rounded-lg bg-blue-50 p-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<FileText class="mr-2 h-5 w-5 text-blue-600" />
										<span class="text-sm font-medium text-gray-700">Blogs</span>
									</div>
									<span class="text-2xl font-bold text-blue-600">{tagCounts.blogs}</span>
								</div>
								<p class="mt-1 text-xs text-gray-600">
									{tagCounts.blogs === 0
										? 'Not used in blogs'
										: tagCounts.blogs === 1
											? 'Used in 1 blog'
											: `Used in ${tagCounts.blogs} blogs`}
								</p>
							</div>

							<div class="rounded-lg bg-green-50 p-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<FolderOpen class="mr-2 h-5 w-5 text-green-600" />
										<span class="text-sm font-medium text-gray-700">Projects</span>
									</div>
									<span class="text-2xl font-bold text-green-600">{tagCounts.projects}</span>
								</div>
								<p class="mt-1 text-xs text-gray-600">
									{tagCounts.projects === 0
										? 'Not used in projects'
										: tagCounts.projects === 1
											? 'Used in 1 project'
											: `Used in ${tagCounts.projects} projects`}
								</p>
							</div>

							<div class="rounded-lg bg-orange-50 p-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<Briefcase class="mr-2 h-5 w-5 text-orange-600" />
										<span class="text-sm font-medium text-gray-700">Experiences</span>
									</div>
									<span class="text-2xl font-bold text-orange-600">{tagCounts.experiences}</span>
								</div>
								<p class="mt-1 text-xs text-gray-600">
									{tagCounts.experiences === 0
										? 'Not used in experiences'
										: tagCounts.experiences === 1
											? 'Used in 1 experience'
											: `Used in ${tagCounts.experiences} experiences`}
								</p>
							</div>
						</div>

						<div class="mt-4 rounded-lg bg-gray-50 p-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<Users class="mr-2 h-5 w-5 text-gray-600" />
									<span class="font-medium text-gray-900">Total Usage</span>
								</div>
								<span class="text-xl font-bold text-gray-900">{tagUsageCount}</span>
							</div>
							<p class="mt-1 text-sm text-gray-600">
								{tagUsageCount === 0
									? 'This tag is not currently being used'
									: tagUsageCount === 1
										? 'This tag is used once across your content'
										: `This tag is used ${tagUsageCount} times across your content`}
							</p>
						</div>
					</div>

					<div>
						<h3 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
							<Settings class="mr-2 h-5 w-5 text-gray-600" />
							Tag Properties
						</h3>

						<div class="space-y-3 rounded-lg bg-gray-50 p-4">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-700">Name</span>
								<span class="font-mono text-gray-900">{tagName}</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-700">Type</span>
								<div class="flex items-center">
									{#if tagIsTech}
										<Code class="mr-1 h-4 w-4 text-blue-600" />
										<span class="font-medium text-blue-600">Technology</span>
									{:else}
										<Hash class="mr-1 h-4 w-4 text-purple-600" />
										<span class="font-medium text-purple-600">General</span>
									{/if}
								</div>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-700">Status</span>
								<div class="flex items-center">
									<div
										class="h-2 w-2 rounded-full {tagUsageCount > 0
											? 'bg-green-500'
											: 'bg-orange-500'} mr-2"
									></div>
									<span
										class="{tagUsageCount > 0 ? 'text-green-600' : 'text-orange-600'} font-medium"
									>
										{tagUsageCount > 0 ? 'Active' : 'Unused'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="border-t border-gray-200 pt-4">
						<h3 class="mb-3 text-lg font-semibold text-gray-900">Record Information</h3>
						<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
							{#if tagCreatedAt}
								<div class="flex items-center text-gray-600">
									<Calendar class="mr-2 h-4 w-4" />
									<span class="font-medium">Created:</span>
									<span class="ml-1">{formatDate(tagCreatedAt)}</span>
								</div>
							{/if}

							{#if tagUpdatedAt}
								<div class="flex items-center text-gray-600">
									<Calendar class="mr-2 h-4 w-4" />
									<span class="font-medium">Updated:</span>
									<span class="ml-1">{formatDate(tagUpdatedAt)}</span>
								</div>
							{/if}
						</div>
					</div>

					{#if tagUsageCount === 0}
						<div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
							<div class="flex items-start">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<h4 class="text-sm font-medium text-orange-800">Unused Tag</h4>
									<p class="mt-1 text-sm text-orange-700">
										This tag is not currently being used in any content. Consider using it or
										deleting it to keep your tag list organized.
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
