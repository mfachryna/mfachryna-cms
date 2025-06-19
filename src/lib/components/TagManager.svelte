<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';
	import { Tag, Plus, X, Loader } from 'lucide-svelte';

	export let tags: any[] = [];
	export let selectedTags: number[] = [];
	export let title = 'Tags';
	export let allowTechToggle = true;
	export let techOnly = false;
	export let createAction = '?/createTag';

	const dispatch = createEventDispatcher();

	let tagSearchQuery = '';
	let isAddingTag = false;
	let tagError = '';
	let tagSuccess = '';
	let showNewTagInput = false;
	let newTagName = '';
	let newTagIsTech = false;
	let tagForm: HTMLFormElement;

	$: filteredTags = tags.filter((tag) => {
		const matchesSearch = tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase());
		const matchesTechFilter = !techOnly || tag.isTech;
		return matchesSearch && matchesTechFilter;
	});

	function toggleTag(tagId: number) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
		dispatch('change', { selectedTags });
	}

	function handleTagKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			tagSearchQuery = '';
		}
	}

	function handleTagSubmit() {
		return async ({ result, update }) => {
			isAddingTag = false;

			if (result.type === 'success') {
				const newTag = result.data?.tag;
				if (newTag) {
					tags = [...tags, newTag];
					selectedTags = [...selectedTags, newTag.id];
					dispatch('tagCreated', { tag: newTag });
					dispatch('change', { selectedTags });
				}

				newTagName = '';
				newTagIsTech = false;
				showNewTagInput = false;
				tagSuccess = result.data?.message || `Tag "${newTag?.name}" created successfully!`;
				tagError = '';

				setTimeout(() => {
					tagSuccess = '';
				}, 3000);
			} else if (result.type === 'failure') {
				tagError = result.data?.error || 'Failed to create tag';
				tagSuccess = '';
			}

			if (tagForm) {
				tagForm.reset();
			}
		};
	}

	function closeNewTagForm() {
		showNewTagInput = false;
		newTagName = '';
		newTagIsTech = false;
		tagError = '';
		tagSuccess = '';
		isAddingTag = false;
	}

	function openNewTagForm() {
		showNewTagInput = true;
		tagError = '';
		tagSuccess = '';
		isAddingTag = false;
	}
</script>

<div class="card p-6">
	<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
		<Tag class="mr-2 h-5 w-5" />
		{title}
		<span class="ml-2 text-xs text-gray-500">({selectedTags.length} selected)</span>
	</h3>

	<div class="mb-4">
		<input
			type="text"
			bind:value={tagSearchQuery}
			placeholder="Search tags..."
			on:keydown={handleTagKeydown}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	{#if tagSuccess}
		<div class="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-600">
			✅ {tagSuccess}
		</div>
	{/if}

	{#if tagError}
		<div class="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
			❌ {tagError}
		</div>
	{/if}

	<div class="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-gray-50 p-2">
		{#if filteredTags.length === 0}
			<p class="py-4 text-center text-sm text-gray-500">
				{tagSearchQuery ? `No tags found for "${tagSearchQuery}"` : 'No tags available'}
			</p>
		{:else}
			{#each filteredTags as tag}
				<label
					class="flex cursor-pointer items-center rounded p-2 transition-colors hover:bg-white"
				>
					<input
						type="checkbox"
						value={tag.id}
						checked={selectedTags.includes(tag.id)}
						on:change={() => toggleTag(tag.id)}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span class="ml-3 flex flex-1 items-center text-sm text-gray-700">
						<Tag class="mr-1 h-3 w-3 text-gray-400" />
						{tag.name}
						{#if tag.isTech}
							<span class="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
								>Tech</span
							>
						{/if}
					</span>
					{#if selectedTags.includes(tag.id)}
						<span class="text-xs text-blue-600">✓</span>
					{/if}
				</label>
			{/each}
		{/if}
	</div>

	{#if showNewTagInput}
		<div class="mt-4 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
			<div class="flex items-center justify-between">
				<h4 class="text-sm font-medium text-blue-900">Add New Tag</h4>
				<button
					type="button"
					on:click={closeNewTagForm}
					class="text-blue-600 hover:text-blue-800"
					disabled={isAddingTag}
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<form
				bind:this={tagForm}
				method="POST"
				action={createAction}
				use:enhance={handleTagSubmit}
				on:submit={() => {
					isAddingTag = true;
					tagError = '';
					tagSuccess = '';
				}}
			>
				<input
					type="text"
					name="tagName"
					bind:value={newTagName}
					placeholder="Enter tag name..."
					disabled={isAddingTag}
					class="mb-3 w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
					required
				/>

				<div class="flex items-center justify-between">
					{#if allowTechToggle}
						<label class="flex items-center text-sm text-blue-700">
							<input
								type="checkbox"
								name="isTech"
								bind:checked={newTagIsTech}
								disabled={isAddingTag}
								class="mr-2 h-3 w-3 rounded border-blue-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
							/>
							<span>Technology tag</span>
						</label>
					{:else}
						<input type="hidden" name="isTech" value={techOnly} />
						<div></div>
					{/if}

					<button
						type="submit"
						disabled={!newTagName.trim() || isAddingTag}
						class="flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isAddingTag}
							<Loader class="mr-1 h-3 w-3 animate-spin" />
							Adding...
						{:else}
							<Plus class="mr-1 h-3 w-3" />
							Add Tag
						{/if}
					</button>
				</div>
			</form>
		</div>
	{:else}
		<button
			type="button"
			on:click={openNewTagForm}
			class="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-blue-600 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
		>
			<Plus class="mr-1 h-4 w-4" />
			Add New Tag
		</button>
	{/if}

	{#if selectedTags.length > 0}
		<div class="mt-4 rounded-lg bg-gray-50 p-2">
			<p class="mb-2 text-xs text-gray-600">Selected tags:</p>
			<div class="flex flex-wrap gap-1">
				{#each selectedTags as tagId}
					{@const tag = tags.find((t) => t.id === tagId)}
					{#if tag}
						<span
							class="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
						>
							{tag.name}
							<button
								type="button"
								on:click={() => toggleTag(tagId)}
								class="ml-1 text-blue-600 hover:text-blue-800"
							>
								<X class="h-3 w-3" />
							</button>
						</span>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<slot name="hidden-inputs" {selectedTags}>
		{#each selectedTags as tagId}
			<input type="hidden" name="tagIds" value={tagId} />
		{/each}
	</slot>
</div>
