<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Plus,
		Search,
		Filter,
		MoreHorizontal,
		Edit,
		Eye,
		Trash2,
		Briefcase,
		MapPin,
		Calendar,
		Tag,
		Clock,
		Building
	} from 'lucide-svelte';
	import ActionButtons from '$lib/components/ui/ActionButtons.svelte';

	export let data;
	export let form;

	let searchQuery = '';
	let selectedFilter = 'all';

	const filterOptions = [
		{ value: 'all', label: 'All Experiences' },
		{ value: 'current', label: 'Current Position' },
		{ value: 'past', label: 'Past Positions' },
		{ value: 'recent', label: 'Recent (Last 2 Years)' },
		{ value: 'long-term', label: 'Long Term (1+ Years)' }
	];

	$: filteredExperiences = data.experiences.filter((experience) => {
		const matchesSearch =
			!searchQuery ||
			experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			experience.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
			experience.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
			experience.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
			experience.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

		if (!matchesSearch) return false;

		switch (selectedFilter) {
			case 'current':
				return !experience.endDate;
			case 'past':
				return !!experience.endDate;
			case 'recent':
				const twoYearsAgo = new Date();
				twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
				return new Date(experience.startDate) > twoYearsAgo;
			case 'long-term':
				const startDate = new Date(experience.startDate);
				const endDate = experience.endDate ? new Date(experience.endDate) : new Date();
				const durationYears =
					(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
				return durationYears >= 1;
			default:
				return true;
		}
	});

	function createExperience() {
		goto('/experiences/new');
	}

	function editExperience(id: number) {
		goto(`/experiences/${id}`);
	}

	function previewExperience(experience: any) {
		editExperience(experience.id);
	}

	async function deleteExperience(experience: any) {
		const confirmed = confirm(
			`Are you sure you want to delete the experience "${experience.title}" at ${experience.company}?\n\nThis action cannot be undone.`
		);

		if (!confirmed) return;

		try {
			const formData = new FormData();
			formData.append('id', experience.id.toString());

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				alert('Experience deleted successfully!');
				location.reload();
			} else {
				alert('Failed to delete experience. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting experience:', error);
			alert('An error occurred while deleting the experience.');
		}
	}

	function formatDuration(startDate: string, endDate?: string) {
		const start = new Date(startDate);
		const end = endDate ? new Date(endDate) : new Date();

		const diffTime = Math.abs(end.getTime() - start.getTime());
		const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

		const years = Math.floor(diffMonths / 12);
		const months = diffMonths % 12;

		if (years === 0) {
			return `${months} month${months !== 1 ? 's' : ''}`;
		} else if (months === 0) {
			return `${years} year${years !== 1 ? 's' : ''}`;
		} else {
			return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
		}
	}

	function formatDateRange(startDate: string, endDate?: string) {
		const start = new Date(startDate).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});

		if (!endDate) {
			return `${start} - Present`;
		}

		const end = new Date(endDate).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});

		return `${start} - ${end}`;
	}
</script>

<svelte:head>
	<title>Experiences - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center text-2xl font-bold text-gray-900">
				<Briefcase class="mr-3 h-6 w-6 text-blue-600" />
				Work Experience
			</h1>
			<p class="mt-1 text-gray-600">Manage your professional experience and career history</p>
		</div>

		<button
			on:click={createExperience}
			class="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			<Plus class="h-4 w-4" />
			<span>Add Experience</span>
		</button>
	</div>

	<div class="flex items-center space-x-4">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
			<input
				type="text"
				placeholder="Search experiences..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-gray-900">{data.experiences.length}</div>
			<div class="text-sm text-gray-600">Total Positions</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-green-600">
				{data.experiences.filter((e) => !e.endDate).length}
			</div>
			<div class="text-sm text-gray-600">Current Positions</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-blue-600">
				{new Set(data.experiences.map((e) => e.company)).size}
			</div>
			<div class="text-sm text-gray-600">Companies</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-purple-600">
				{data.experiences.reduce((total, exp) => total + exp.highlights.length, 0)}
			</div>
			<div class="text-sm text-gray-600">Total Highlights</div>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
		<div class="p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Experience Timeline</h2>

			{#if filteredExperiences.length === 0}
				<div class="py-12 text-center">
					<Briefcase class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900">
						{searchQuery || selectedFilter !== 'all'
							? 'No experiences found'
							: 'No experience added yet'}
					</h3>
					<p class="mb-4 text-gray-600">
						{searchQuery || selectedFilter !== 'all'
							? 'Try adjusting your search or filter criteria'
							: 'Get started by adding your first work experience'}
					</p>
					{#if !searchQuery && selectedFilter === 'all'}
						<button
							on:click={createExperience}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Experience
						</button>
					{/if}
				</div>
			{:else}
				<div class="relative">
					<!-- Timeline line -->
					<div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

					<div class="space-y-8">
						{#each filteredExperiences.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) as experience, index}
							<div class="relative">
								<!-- Timeline dot -->
								<div class="absolute left-4 top-6 z-10 h-4 w-4 rounded-full border-4 {!experience.endDate ? 'border-green-500 bg-green-100' : 'border-blue-500 bg-blue-100'}"></div>
								
								<!-- Experience card -->
								<div class="ml-12 rounded-lg bg-gray-50 p-6 transition-shadow hover:shadow-md">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-1 flex items-center space-x-2">
												<h3 class="text-lg font-semibold text-gray-900">{experience.title}</h3>
												{#if !experience.endDate}
													<span
														class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
													>
														Current
													</span>
												{/if}
											</div>

											<div class="mb-2 flex items-center space-x-4 text-sm text-gray-600">
												<div class="flex items-center">
													<Building class="mr-1 h-4 w-4" />
													<span class="font-medium">{experience.company}</span>
												</div>

												<div class="flex items-center">
													<Briefcase class="mr-1 h-4 w-4" />
													<span>{experience.role}</span>
												</div>

												<div class="flex items-center">
													<MapPin class="mr-1 h-4 w-4" />
													<span>{experience.location}</span>
												</div>
											</div>

											<div class="mb-3 flex items-center space-x-4 text-sm text-gray-600">
												<div class="flex items-center">
													<Calendar class="mr-1 h-4 w-4" />
													<span>{formatDateRange(experience.startDate, experience.endDate)}</span>
												</div>

												<div class="flex items-center">
													<Clock class="mr-1 h-4 w-4" />
													<span>{formatDuration(experience.startDate, experience.endDate)}</span>
												</div>
											</div>

											{#if experience.tags?.length > 0}
												<div class="mb-3 flex flex-wrap gap-1">
													{#each experience.tags.slice(0, 4) as tag}
														<span class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
															{tag.name}
														</span>
													{/each}
													{#if experience.tags.length > 4}
														<span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
															+{experience.tags.length - 4}
														</span>
													{/if}
												</div>
											{/if}

											{#if experience.highlights?.length > 0}
												<div class="mb-4">
													<p class="mb-2 text-sm font-medium text-gray-700">Key Highlights:</p>
													<ul class="space-y-1 text-sm text-gray-600">
														{#each experience.highlights.slice(0, 2) as highlight}
															<li class="flex items-start">
																<span
																	class="mt-2 mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"
																></span>
																<span class="line-clamp-1">{highlight}</span>
															</li>
														{/each}
														{#if experience.highlights.length > 2}
															<li class="text-xs text-blue-600">
																+{experience.highlights.length - 2} more highlights
															</li>
														{/if}
													</ul>
												</div>
											{/if}
										</div>

										<div class="ml-4 flex space-x-2">
											<button
												on:click={() => editExperience(experience.id)}
												class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
												title="Edit"
											>
												<Edit class="h-4 w-4" />
											</button>
											
											<button
												on:click={() => previewExperience(experience)}
												class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
												title="Preview"
											>
												<Eye class="h-4 w-4" />
											</button>
											
											<button
												on:click={() => deleteExperience(experience)}
												class="rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
												title="Delete"
											>
												<Trash2 class="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if form?.success}
		<div
			class="fixed right-4 bottom-4 rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg"
		>
			<p class="text-sm text-green-600">✅ {form.message}</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
