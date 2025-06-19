<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import {
		Save,
		ArrowLeft,
		Tag,
		Code,
		Hash,
		Trash2,
		Loader,
		AlertTriangle,
		Image,
		Globe
	} from 'lucide-svelte';

	export let data;
	export let form;

	let isSubmitting = false;
	let isDeleting = false;
	let showDeleteModal = false;
	let showSaveModal = false;
	let showCancelModal = false;

	let currentName = data.tag?.name || '';
	let currentIsTech = data.tag?.isTech || false;
	let currentIconUrl = data.tag?.iconUrl || '';

	let initialName = data.tag?.name || '';
	let initialIsTech = data.tag?.isTech || false;
	let initialIconUrl = data.tag?.iconUrl || '';
	let hasUnsavedChanges = false;

	$: pageTitle = `Edit Tag: ${data.tag?.name}`;
	$: canDelete = data.tag?.usageCount === 0;

	function updateChangeDetection() {
		if (!browser) {
			hasUnsavedChanges = false;
			return;
		}

		hasUnsavedChanges =
			currentName !== initialName ||
			currentIsTech !== initialIsTech ||
			currentIconUrl !== initialIconUrl;
	}

	onMount(() => {
		updateChangeDetection();
	});

	$: if (browser) {
		updateChangeDetection();
	}

	function handleNameChange(event: Event) {
		currentName = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleIsTechChange(event: Event) {
		currentIsTech = (event.target as HTMLInputElement).checked;
		updateChangeDetection();
	}

	function handleIconUrlChange(event: Event) {
		currentIconUrl = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleSubmit() {
		if (hasUnsavedChanges) {
			showSaveModal = true;
		}
	}

	function confirmSave() {
		showSaveModal = false;
		isSubmitting = true;

		if (browser) {
			const form = document.getElementById('tagForm') as HTMLFormElement;
			if (form) {
				form.submit();
			}
		}
	}

	function handleDirectSave() {
		isSubmitting = true;
		if (browser) {
			const form = document.getElementById('tagForm') as HTMLFormElement;
			if (form) {
				form.submit();
			}
		}
	}

	function handleCancel() {
		if (hasUnsavedChanges) {
			showCancelModal = true;
		} else {
			goto('/tags');
		}
	}

	function confirmCancel() {
		showCancelModal = false;
		goto('/tags');
	}

	function handleDelete() {
		showDeleteModal = true;
	}

	function confirmDelete() {
		showDeleteModal = false;
		isDeleting = true;

		if (browser) {
			const deleteForm = document.getElementById('deleteForm') as HTMLFormElement;
			if (deleteForm) {
				deleteForm.submit();
			}
		}
	}

	function handleIconError(event: Event) {
		console.log('Icon failed to load');
	}
</script>

<svelte:head>
	<title>{pageTitle} - Admin</title>
</svelte:head>

<ConfirmationModal
	isOpen={showSaveModal}
	title="Update Tag"
	message="Are you sure you want to update this tag?"
	confirmText="Update"
	on:confirm={confirmSave}
	on:cancel={() => (showSaveModal = false)}
/>

<ConfirmationModal
	isOpen={showCancelModal}
	title="Discard Changes"
	message="You have unsaved changes. Are you sure you want to leave without saving?"
	confirmText="Discard"
	cancelText="Stay"
	on:confirm={confirmCancel}
	on:cancel={() => (showCancelModal = false)}
/>

<ConfirmationModal
	isOpen={showDeleteModal}
	title="Delete Tag"
	message="Are you sure you want to delete '{data.tag?.name}'? This action cannot be undone."
	confirmText="Delete"
	on:confirm={confirmDelete}
	on:cancel={() => (showDeleteModal = false)}
/>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<button on:click={handleCancel} class="rounded-lg p-2 transition-colors hover:bg-gray-100">
				<ArrowLeft class="h-5 w-5" />
			</button>
			<div>
				<h1 class="flex items-center text-2xl font-bold text-gray-900">
					{#if currentIconUrl && currentIconUrl.trim()}
						<img
							src={currentIconUrl}
							alt={currentName}
							class="mr-3 h-6 w-6 object-contain"
							on:error={handleIconError}
						/>
					{:else}
						<Tag class="mr-3 h-6 w-6 text-purple-600" />
					{/if}
					{pageTitle}
				</h1>
				<p class="mt-1 text-gray-600">Update tag details and properties</p>
				{#if hasUnsavedChanges}
					<p class="mt-1 text-sm text-orange-600">● Unsaved changes</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<div class="card space-y-6 p-6">
				<h2 class="text-lg font-semibold text-gray-900">Tag Details</h2>

				<form
					id="tagForm"
					method="POST"
					action="?/save"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;

							if (result.type === 'redirect') {
								goto(result.location);
							} else if (result.type === 'success') {
								goto('/tags');
							} else {
								await update();
							}
						};
					}}
					class="space-y-6"
				>
					<div>
						<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
							Tag Name *
						</label>
						<input
							type="text"
							name="name"
							id="name"
							required
							bind:value={currentName}
							on:input={handleNameChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
							placeholder="e.g., React, JavaScript, Web Development"
						/>
					</div>

					<div>
						<label for="iconUrl" class="mb-2 block text-sm font-medium text-gray-700">
							Icon URL (Optional)
						</label>
						<input
							type="url"
							name="iconUrl"
							id="iconUrl"
							bind:value={currentIconUrl}
							on:input={handleIconUrlChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
							placeholder="https://example.com/icon.svg or https://cdn.jsdelivr.net/..."
						/>
						<p class="mt-1 text-xs text-gray-500">
							Use SVG icons for best quality. Try <a
								href="https://cdn.jsdelivr.net/npm/simple-icons@v9/"
								target="_blank"
								class="text-purple-600 hover:underline">Simple Icons CDN</a
							> for tech icons.
						</p>

						{#if currentIconUrl && currentIconUrl.trim()}
							<div class="mt-3 rounded border bg-gray-50 p-3">
								<div class="mb-2 text-xs text-gray-600">Icon Preview:</div>
								<div class="flex items-center space-x-3">
									<img
										src={currentIconUrl}
										alt="Icon preview"
										class="h-8 w-8 rounded border object-contain"
										on:error={handleIconError}
									/>
									<div>
										<div class="font-medium text-gray-900">{currentName || 'Tag Name'}</div>
										<div class="text-xs text-gray-500">
											{currentIsTech ? 'Technology Tag' : 'General Tag'}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div>
						<div class="flex items-start">
							<div class="flex h-5 items-center">
								<input
									type="checkbox"
									name="isTech"
									id="isTech"
									bind:checked={currentIsTech}
									on:change={handleIsTechChange}
									class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</div>
							<div class="ml-3">
								<label for="isTech" class="text-sm font-medium text-gray-700">
									Technology Tag
								</label>
								<p class="text-sm text-gray-500">
									Mark this as a technology or skill tag for better categorization
								</p>
							</div>
						</div>
					</div>

					{#if data.tag?.usageCount > 0}
						<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
							<h3 class="mb-2 text-sm font-medium text-blue-900">Current Usage</h3>
							<div class="space-y-2 text-sm text-blue-800">
								{#if data.tag._count?.blogs > 0}
									<div>
										• Used in {data.tag._count.blogs} blog{data.tag._count.blogs !== 1 ? 's' : ''}
									</div>
								{/if}
								{#if data.tag._count?.projects > 0}
									<div>
										• Used in {data.tag._count.projects} project{data.tag._count.projects !== 1
											? 's'
											: ''}
									</div>
								{/if}
								{#if data.tag._count?.experiences > 0}
									<div>
										• Used in {data.tag._count.experiences} experience{data.tag._count
											.experiences !== 1
											? 's'
											: ''}
									</div>
								{/if}
							</div>
						</div>
					{/if}

					{#if form?.success}
						<div class="rounded-lg border border-green-200 bg-green-50 p-4">
							<p class="text-sm text-green-600">✅ {form.message || 'Tag updated successfully!'}</p>
						</div>
					{/if}

					{#if form?.error}
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<p class="text-sm text-red-600">❌ {form.error}</p>
						</div>
					{/if}
				</form>
			</div>
		</div>

		<div class="space-y-6">
			<div class="card p-6">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Actions</h3>

				<div class="space-y-3">
					<button
						type="button"
						on:click={handleDirectSave}
						disabled={isSubmitting || !hasUnsavedChanges}
						class="flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
					>
						{#if isSubmitting}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
							Updating...
						{:else}
							<Save class="mr-2 h-4 w-4" />
							Update Tag
						{/if}
					</button>


					<button
						type="button"
						on:click={handleCancel}
						disabled={isSubmitting}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
				</div>

				{#if !hasUnsavedChanges}
					<p class="mt-2 text-center text-xs text-gray-500">No changes to save</p>
				{/if}
			</div>

			<div class="card p-6">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Tag Information</h3>

				<div class="space-y-3 text-sm">
					<div class="flex items-center justify-between">
						<span class="text-gray-600">Type:</span>
						<div class="flex items-center">
							{#if data.tag?.isTech}
								<Code class="mr-1 h-4 w-4 text-blue-600" />
								<span class="text-blue-600">Technology</span>
							{:else}
								<Hash class="mr-1 h-4 w-4 text-purple-600" />
								<span class="text-purple-600">General</span>
							{/if}
						</div>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-600">Has Icon:</span>
						<div class="flex items-center">
							{#if data.tag?.iconUrl && data.tag.iconUrl.trim()}
								<Image class="mr-1 h-4 w-4 text-green-600" />
								<span class="text-green-600">Yes</span>
							{:else}
								<Image class="mr-1 h-4 w-4 text-gray-400" />
								<span class="text-gray-400">No</span>
							{/if}
						</div>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-600">Total Usage:</span>
						<span class="font-medium">{data.tag?.usageCount || 0} times</span>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-600">Created:</span>
						<span>{new Date(data.tag?.createdAt).toLocaleDateString()}</span>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-600">Updated:</span>
						<span>{new Date(data.tag?.updatedAt).toLocaleDateString()}</span>
					</div>
				</div>
			</div>

			{#if data.tag?.iconUrl && data.tag.iconUrl.trim()}
				<div class="card p-6">
					<h3 class="mb-4 text-lg font-semibold text-gray-900">Current Icon</h3>
					<div class="flex items-center space-x-3 rounded bg-gray-50 p-3">
						<img
							src={data.tag.iconUrl}
							alt={data.tag.name}
							class="h-10 w-10 rounded border object-contain"
							on:error={handleIconError}
						/>
						<div>
							<div class="font-medium text-gray-900">{data.tag.name}</div>
							<div class="text-xs break-all text-gray-500">{data.tag.iconUrl}</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="card border-red-200 p-6">
				<h3 class="mb-4 text-lg font-semibold text-red-900">Danger Zone</h3>

				{#if canDelete}
					<button
						type="button"
						on:click={handleDelete}
						disabled={isDeleting}
						class="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
					>
						{#if isDeleting}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
							Deleting...
						{:else}
							<Trash2 class="mr-2 h-4 w-4" />
							Delete Tag
						{/if}
					</button>

					<p class="mt-2 text-xs text-gray-500">
						This tag is not being used and can be safely deleted.
					</p>
				{:else}
					<div class="rounded-lg border border-orange-200 bg-orange-50 p-3">
						<div class="flex items-start">
							<AlertTriangle class="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-orange-600" />
							<div>
								<p class="text-sm font-medium text-orange-800">Cannot delete</p>
								<p class="mt-1 text-xs text-orange-700">
									This tag is being used by {data.tag?.usageCount} item(s). Remove it from all content
									first.
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<form
	id="deleteForm"
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result, update }) => {
			isDeleting = false;

			if (result.type === 'redirect') {
				goto(result.location);
			} else if (result.type === 'success') {
				goto('/tags');
			} else {
				await update();
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="id" value={data.tag?.id} />
</form>
