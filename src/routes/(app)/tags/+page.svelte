<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import {
		Plus,
		Search,
		Filter,
		Tag,
		Hash,
		Code,
		Edit,
		Trash2,
		FileText,
		FolderOpen,
		Briefcase,
		Eye,
		Settings,
		Loader,
		Image,
		Globe
	} from 'lucide-svelte';

	function formatDate(date: string, short = false) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: short ? 'short' : 'long',
			day: 'numeric'
		});
	}

	export let data;
	export let form;

	let searchQuery = '';
	let selectedFilter = 'all';
	let showCreateModal = false;
	let isCreating = false;

	let newTagName = '';
	let newTagIsTech = false;
	let newTagIconUrl = '';

	const filterOptions = [
		{ value: 'all', label: 'All Tags' },
		{ value: 'tech', label: 'Technology Tags' },
		{ value: 'general', label: 'General Tags' },
		{ value: 'unused', label: 'Unused Tags' },
		{ value: 'popular', label: 'Most Used' },
		{ value: 'with-icons', label: 'With Icons' },
		{ value: 'without-icons', label: 'Without Icons' }
	];

	$: filteredTags = data.tags.filter((tag) => {
		const matchesSearch =
			!searchQuery || tag.name.toLowerCase().includes(searchQuery.toLowerCase());

		if (!matchesSearch) return false;

		switch (selectedFilter) {
			case 'tech':
				return tag.isTech;
			case 'general':
				return !tag.isTech;
			case 'unused':
				return tag.usageCount === 0;
			case 'popular':
				return tag.usageCount > 0;
			case 'with-icons':
				return tag.iconUrl && tag.iconUrl.trim();
			case 'without-icons':
				return !tag.iconUrl || !tag.iconUrl.trim();
			default:
				return true;
		}
	});

	$: sortedTags = filteredTags.sort((a, b) => {
		if (a.usageCount !== b.usageCount) {
			return b.usageCount - a.usageCount;
		}
		return a.name.localeCompare(b.name);
	});

	function createTag() {
		showCreateModal = true;
		newTagName = '';
		newTagIsTech = false;
		newTagIconUrl = '';
	}

	function editTag(id: number) {
		goto(`/tags/${id}`);
	}

	function previewTag(tag: any) {
		editTag(tag.id);
	}

	async function deleteTag(tag: any) {
		const confirmed = confirm(
			`Are you sure you want to delete the tag "${tag.name}"?\n\nThis will remove it from all associated content and cannot be undone.`
		);

		if (!confirmed) return;

		try {
			const formData = new FormData();
			formData.append('id', tag.id.toString());

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				alert('Tag deleted successfully!');
				location.reload();
			} else {
				alert('Failed to delete tag. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting tag:', error);
			alert('An error occurred while deleting the tag.');
		}
	}

	function handleFilterChange(value: string) {
		selectedFilter = value;
	}

	function handleCreateTag() {
		if (!newTagName.trim()) return;

		isCreating = true;

		const form = document.getElementById('createTagForm') as HTMLFormElement;
		if (form) {
			form.submit();
		}
	}

	function getTagColor(tag: any) {
		if (tag.isTech) {
			return 'bg-blue-100 text-blue-800 border-blue-200';
		}
		return 'bg-gray-100 text-gray-800 border-gray-200';
	}

	function getUsageText(count: number) {
		if (count === 0) return 'Unused';
		if (count === 1) return '1 use';
		return `${count} uses`;
	}

	function handleIconError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = 'none';
	}
</script>

<svelte:head>
	<title>Tags - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center text-2xl font-bold text-gray-900">
				<Tag class="mr-3 h-6 w-6 text-black" />
				Tag Management
			</h1>
			<p class="mt-1 text-gray-600">Organize and manage tags for your content</p>
		</div>

		<button
			on:click={createTag}
			class="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
		>
			<Plus class="h-4 w-4" />
			<span>Add Tag</span>
		</button>
	</div>

	<div class="flex items-center space-x-4">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
			<input
				type="text"
				placeholder="Search tags..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-black focus:ring-2 focus:ring-black"
			/>
		</div>

		<select
			bind:value={selectedFilter}
			on:change={(e) => handleFilterChange(e.target.value)}
			class="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
		>
			{#each filterOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-5">
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-gray-900">{data.tags.length}</div>
			<div class="text-sm text-gray-600">Total Tags</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-blue-600">
				{data.tags.filter((t) => t.isTech).length}
			</div>
			<div class="text-sm text-gray-600">Technology Tags</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-green-600">
				{data.tags.filter((t) => t.usageCount > 0).length}
			</div>
			<div class="text-sm text-gray-600">Used Tags</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-orange-600">
				{data.tags.filter((t) => t.usageCount === 0).length}
			</div>
			<div class="text-sm text-gray-600">Unused Tags</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="text-2xl font-bold text-black">
				{data.tags.filter((t) => t.iconUrl && t.iconUrl.trim()).length}
			</div>
			<div class="text-sm text-gray-600">With Icons</div>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
		<div class="p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">All Tags</h2>

			{#if sortedTags.length === 0}
				<div class="py-12 text-center">
					<Tag class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900">
						{searchQuery || selectedFilter !== 'all' ? 'No tags found' : 'No tags created yet'}
					</h3>
					<p class="mb-4 text-gray-600">
						{searchQuery || selectedFilter !== 'all'
							? 'Try adjusting your search or filter criteria'
							: 'Create your first tag to organize your content'}
					</p>
					{#if !searchQuery && selectedFilter === 'all'}
						<button
							on:click={createTag}
							class="rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
						>
							Create Tag
						</button>
					{/if}
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each sortedTags as tag}
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md"
						>
							<div class="mb-3 flex items-start justify-between">
								<div class="flex min-w-0 flex-1 items-center space-x-2">
									<div class="relative h-6 w-6 flex-shrink-0">
										{#if tag.iconUrl && tag.iconUrl.trim()}
											<img
												src={tag.iconUrl}
												alt={tag.name}
												class="h-6 w-6 rounded object-contain"
												on:error={handleIconError}
											/>

											<div
												class="absolute inset-0 flex items-center justify-center"
												style="display: none;"
											>
												{#if tag.isTech}
													<Code class="h-4 w-4 text-blue-600" />
												{:else}
													<Hash class="h-4 w-4 text-gray-600" />
												{/if}
											</div>
										{:else if tag.isTech}
											<Code class="h-4 w-4 text-blue-600" />
										{:else}
											<Hash class="h-4 w-4 text-gray-600" />
										{/if}
									</div>
									<span class="truncate font-medium text-gray-900">{tag.name}</span>
								</div>

								<div class="ml-4 flex space-x-1">
									<button
										on:click={() => editTag(tag.id)}
										class="rounded-lg p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
										title="Edit"
									>
										<Edit class="h-3 w-3" />
									</button>

									<button
										on:click={() => previewTag(tag)}
										class="rounded-lg p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
										title="Preview"
									>
										<Eye class="h-3 w-3" />
									</button>

									<button
										on:click={() => deleteTag(tag)}
										class="rounded-lg p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
										title="Delete"
									>
										<Trash2 class="h-3 w-3" />
									</button>
								</div>
							</div>

							<div class="mb-3 flex items-center justify-between">
								<span class="rounded-full px-2 py-1 text-xs font-medium {getTagColor(tag)}">
									{tag.isTech ? 'Technology' : 'General'}
								</span>

								{#if tag.iconUrl && tag.iconUrl.trim()}
									<div class="flex items-center text-xs text-green-600">
										<Image class="mr-1 h-3 w-3" />
										<span>Has Icon</span>
									</div>
								{:else}
									<div class="flex items-center text-xs text-gray-400">
										<Image class="mr-1 h-3 w-3" />
										<span>No Icon</span>
									</div>
								{/if}
							</div>

							<div class="space-y-2 text-sm text-gray-600">
								<div class="flex items-center justify-between">
									<span>Usage:</span>
									<span
										class="font-medium {tag.usageCount === 0
											? 'text-orange-600'
											: 'text-green-600'}"
									>
										{getUsageText(tag.usageCount)}
									</span>
								</div>

								{#if tag.usageCount > 0}
									<div class="flex items-center justify-between text-xs">
										<div class="flex items-center space-x-3">
											{#if tag._count?.blogs > 0}
												<div class="flex items-center">
													<FileText class="mr-1 h-3 w-3" />
													<span>{tag._count.blogs}</span>
												</div>
											{/if}
											{#if tag._count?.projects > 0}
												<div class="flex items-center">
													<FolderOpen class="mr-1 h-3 w-3" />
													<span>{tag._count.projects}</span>
												</div>
											{/if}
											{#if tag._count?.experiences > 0}
												<div class="flex items-center">
													<Briefcase class="mr-1 h-3 w-3" />
													<span>{tag._count.experiences}</span>
												</div>
											{/if}
										</div>
									</div>
								{/if}

								<div class="flex items-center justify-between">
									<span>Created:</span>
									<span>{formatDate(tag.createdAt, true)}</span>
								</div>
							</div>
						</div>
					{/each}
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

<!-- Keep only the create modal -->
{#if showCreateModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="w-full max-w-md rounded-lg bg-white">
			<div class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Create New Tag</h3>

				<form
					id="createTagForm"
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') {
								showCreateModal = false;
								newTagName = '';
								newTagIsTech = false;
								newTagIconUrl = '';
								alert('Tag created successfully!');
								location.reload();
							}
							isCreating = false;
						};
					}}
					class="space-y-4"
				>
					<div>
						<label for="tagName" class="mb-1 block text-sm font-medium text-gray-700">
							Tag Name *
						</label>
						<input
							type="text"
							name="tagName"
							id="tagName"
							required
							bind:value={newTagName}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
							placeholder="e.g., React, JavaScript, Web Development"
						/>
					</div>

					<div>
						<label for="iconUrl" class="mb-1 block text-sm font-medium text-gray-700">
							Icon URL (Optional)
						</label>
						<input
							type="url"
							name="iconUrl"
							id="iconUrl"
							bind:value={newTagIconUrl}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
							placeholder="https://example.com/icon.svg or https://cdn.jsdelivr.net/..."
						/>
						<p class="mt-1 text-xs text-gray-500">
							Use SVG icons for best quality. Try <a
								href="https://cdn.jsdelivr.net/npm/simple-icons@v9/"
								target="_blank"
								class="text-black hover:underline">Simple Icons CDN</a
							> for tech icons.
						</p>

						{#if newTagIconUrl && newTagIconUrl.trim()}
							<div class="mt-2 rounded border bg-gray-50 p-2">
								<div class="mb-1 text-xs text-gray-600">Preview:</div>
								<div class="flex items-center space-x-2">
									<img
										src={newTagIconUrl}
										alt="Icon preview"
										class="h-6 w-6 object-contain"
										on:error={() => {}}
									/>
									<span class="text-sm">{newTagName || 'Tag Name'}</span>
								</div>
							</div>
						{/if}
					</div>

					<div class="flex items-center">
						<input
							type="checkbox"
							name="isTech"
							id="isTech"
							bind:checked={newTagIsTech}
							class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
						/>
						<label for="isTech" class="ml-2 text-sm text-gray-700">
							This is a technology/skill tag
						</label>
					</div>

					<div class="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							on:click={() => (showCreateModal = false)}
							disabled={isCreating}
							class="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							on:click={handleCreateTag}
							disabled={isCreating || !newTagName.trim()}
							class="flex items-center rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
						>
							{#if isCreating}
								<Loader class="mr-2 h-4 w-4 animate-spin" />
								Creating...
							{:else}
								<Plus class="mr-2 h-4 w-4" />
								Create Tag
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
