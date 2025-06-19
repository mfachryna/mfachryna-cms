<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		X,
		Calendar,
		Clock,
		MapPin,
		Building,
		Briefcase,
		Tag,
		CheckCircle,
		ExternalLink,
		User,
		Award
	} from 'lucide-svelte';

	export let show = false;
	export let experience: any = null;

	const dispatch = createEventDispatcher();

	$: safeExperience = experience || {};
	$: experienceTitle = safeExperience.title || 'Untitled Experience';
	$: experienceRole = safeExperience.role || 'Role not specified';
	$: experienceCompany = safeExperience.company || 'Company not specified';
	$: experienceLocation = safeExperience.location || 'Location not specified';
	$: experienceDescription = safeExperience.description || '';
	$: experienceContent = safeExperience.content || '';
	$: experienceStartDate = safeExperience.startDate || null;
	$: experienceEndDate = safeExperience.endDate || null;
	$: experienceHighlights = Array.isArray(safeExperience.highlights)
		? safeExperience.highlights
		: [];
	$: experienceTags = Array.isArray(safeExperience.tags) ? safeExperience.tags : [];
	$: experienceCreatedAt = safeExperience.createdAt || null;
	$: experienceUpdatedAt = safeExperience.updatedAt || null;

	$: isCurrentPosition = !experienceEndDate;
	$: hasHighlights = experienceHighlights.length > 0;
	$: hasTags = experienceTags.length > 0;
	$: hasContent = experienceContent && experienceContent.trim().length > 0;

	function closeModal() {
		show = false;
		dispatch('close');
	}

	function handleEdit() {
		if (safeExperience.id) {
			dispatch('edit', { experience: safeExperience });
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

	function formatDuration(startDate: string, endDate?: string | null): string {
		try {
			if (!startDate) return 'Duration not available';

			const start = new Date(startDate);
			const end = endDate ? new Date(endDate) : new Date();

			if (isNaN(start.getTime()) || (endDate && isNaN(end.getTime()))) {
				return 'Invalid date';
			}

			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));

			const years = Math.floor(diffMonths / 12);
			const months = diffMonths % 12;

			if (years === 0 && months === 0) {
				return 'Less than 1 month';
			} else if (years === 0) {
				return `${months} month${months !== 1 ? 's' : ''}`;
			} else if (months === 0) {
				return `${years} year${years !== 1 ? 's' : ''}`;
			} else {
				return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
			}
		} catch (error) {
			console.error('Error calculating duration:', error);
			return 'Duration calculation error';
		}
	}

	function formatDateRange(startDate: string, endDate?: string | null): string {
		try {
			if (!startDate) return 'Date not available';

			const start = new Date(startDate);
			if (isNaN(start.getTime())) return 'Invalid start date';

			const startFormatted = start.toLocaleDateString('en-US', {
				month: 'long',
				year: 'numeric'
			});

			if (!endDate) {
				return `${startFormatted} - Present`;
			}

			const end = new Date(endDate);
			if (isNaN(end.getTime())) return `${startFormatted} - Invalid end date`;

			const endFormatted = end.toLocaleDateString('en-US', {
				month: 'long',
				year: 'numeric'
			});

			return `${startFormatted} - ${endFormatted}`;
		} catch (error) {
			console.error('Error formatting date range:', error);
			return 'Date formatting error';
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

	function sanitizeHTML(html: string): string {
		if (!html) return '';

		return html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/on\w+="[^"]*"/g, '')
			.replace(/javascript:/gi, '');
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show && experience}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
		>
			<div
				class="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
			>
				<div class="flex items-center space-x-4">
					<div
						class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100"
					>
						<Building class="h-8 w-8 text-blue-600" />
					</div>

					<div class="min-w-0 flex-1">
						<h2 id="modal-title" class="truncate text-xl font-bold text-gray-900">
							{experienceTitle}
						</h2>
						<div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
							<div class="flex items-center">
								<Briefcase class="mr-1 h-4 w-4 flex-shrink-0" />
								<span class="truncate">{experienceRole}</span>
							</div>
							<span class="hidden sm:inline">•</span>
							<div class="flex items-center">
								<Building class="mr-1 h-4 w-4 flex-shrink-0" />
								<span class="truncate font-medium">{experienceCompany}</span>
							</div>
						</div>
					</div>

					{#if isCurrentPosition}
						<div
							class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium whitespace-nowrap text-green-800"
						>
							Current Position
						</div>
					{/if}
				</div>

				<div class="flex flex-shrink-0 items-center space-x-2">
					<button
						on:click={handleEdit}
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
						disabled={!safeExperience.id}
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
				<div class="space-y-8 p-6">
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<div class="space-y-4">
							<h3 class="flex items-center text-lg font-semibold text-gray-900">
								<User class="mr-2 h-5 w-5 text-blue-600" />
								Position Details
							</h3>

							<div class="space-y-3 rounded-lg bg-gray-50 p-4">
								<div class="flex items-start">
									<Briefcase class="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-gray-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">Role</div>
										<div class="text-gray-900">{experienceRole}</div>
									</div>
								</div>

								<div class="flex items-start">
									<Building class="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-gray-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">Company</div>
										<div class="text-gray-900">{experienceCompany}</div>
									</div>
								</div>

								<div class="flex items-start">
									<MapPin class="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-gray-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">Location</div>
										<div class="text-gray-900">{experienceLocation}</div>
									</div>
								</div>
							</div>
						</div>

						<div class="space-y-4">
							<h3 class="flex items-center text-lg font-semibold text-gray-900">
								<Clock class="mr-2 h-5 w-5 text-blue-600" />
								Duration
							</h3>

							<div class="space-y-3 rounded-lg bg-gray-50 p-4">
								<div class="flex items-start">
									<Calendar class="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-gray-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">Period</div>
										<div class="text-gray-900">
											{formatDateRange(experienceStartDate, experienceEndDate)}
										</div>
									</div>
								</div>

								<div class="flex items-start">
									<Clock class="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-gray-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">Duration</div>
										<div class="text-gray-900">
											{formatDuration(experienceStartDate, experienceEndDate)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{#if experienceDescription}
						<div>
							<h3 class="mb-3 text-lg font-semibold text-gray-900">About the Role</h3>
							<div class="rounded-lg bg-blue-50 p-4">
								<p class="leading-relaxed text-gray-700">{experienceDescription}</p>
							</div>
						</div>
					{/if}

					{#if hasHighlights}
						<div>
							<h3 class="mb-4 flex items-center text-lg font-semibold text-gray-900">
								<CheckCircle class="mr-2 h-5 w-5 text-green-600" />
								Key Achievements & Responsibilities
								<span class="ml-2 text-sm font-normal text-gray-500"
									>({experienceHighlights.length} items)</span
								>
							</h3>

							<div class="space-y-3">
								{#each experienceHighlights as highlight, index}
									{#if highlight && highlight.trim()}
										<div
											class="flex items-start space-x-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
										>
											<div
												class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
											>
												<span class="text-xs font-medium text-blue-700">{index + 1}</span>
											</div>
											<p class="flex-1 leading-relaxed text-gray-700">{highlight.trim()}</p>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					{#if hasTags}
						<div>
							<h3 class="mb-3 flex items-center text-lg font-semibold text-gray-900">
								<Tag class="mr-2 h-5 w-5 text-purple-600" />
								Technologies & Skills
								<span class="ml-2 text-sm font-normal text-gray-500"
									>({experienceTags.length} items)</span
								>
							</h3>

							<div class="flex flex-wrap gap-2">
								{#each experienceTags as tag}
									{#if tag && tag.name}
										<span
											class="rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-800 transition-colors hover:bg-purple-200"
										>
											{tag.name}
										</span>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					{#if hasContent}
						<div>
							<h3 class="mb-3 text-lg font-semibold text-gray-900">Additional Details</h3>
							<div class="prose max-w-none rounded-lg bg-gray-50 p-4">
								{@html sanitizeHTML(experienceContent)}
							</div>
						</div>
					{/if}

					<div class="border-t border-gray-200 pt-6">
						<h3 class="mb-3 text-lg font-semibold text-gray-900">Record Information</h3>
						<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
							{#if experienceCreatedAt}
								<div class="flex items-center text-gray-600">
									<Calendar class="mr-2 h-4 w-4" />
									<span class="font-medium">Created:</span>
									<span class="ml-1">{formatDate(experienceCreatedAt)}</span>
								</div>
							{/if}

							{#if experienceUpdatedAt}
								<div class="flex items-center text-gray-600">
									<Clock class="mr-2 h-4 w-4" />
									<span class="font-medium">Last Updated:</span>
									<span class="ml-1">{formatDate(experienceUpdatedAt)}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.prose {
		color: #374151;
		line-height: 1.7;
	}

	.prose h1,
	.prose h2,
	.prose h3,
	.prose h4,
	.prose h5,
	.prose h6 {
		color: #111827;
		font-weight: 600;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	.prose h1 {
		font-size: 1.5em;
	}
	.prose h2 {
		font-size: 1.25em;
	}
	.prose h3 {
		font-size: 1.125em;
	}

	.prose p {
		margin-bottom: 1rem;
	}

	.prose ul,
	.prose ol {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.prose li {
		margin-bottom: 0.5rem;
	}

	.prose a {
		color: #2563eb;
		text-decoration: underline;
	}

	.prose a:hover {
		color: #1e40af;
	}

	.prose code {
		background-color: #f3f4f6;
		padding: 0.25rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
	}

	.prose pre {
		background-color: #111827;
		color: #f3f4f6;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.prose blockquote {
		border-left: 4px solid #d1d5db;
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #4b5563;
	}

	.prose table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.prose th,
	.prose td {
		border: 1px solid #d1d5db;
		padding: 0.5rem;
		text-align: left;
	}

	.prose th {
		background-color: #f9fafb;
		font-weight: 600;
	}

	@media (max-width: 640px) {
		.prose h1 {
			font-size: 1.25em;
		}
		.prose h2 {
			font-size: 1.125em;
		}
		.prose h3 {
			font-size: 1em;
		}
	}
</style>
