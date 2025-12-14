<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import TagManager from '$lib/components/TagManager.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import {
		Save,
		ArrowLeft,
		Calendar,
		Briefcase,
		Building,
		MapPin,
		Settings,
		FileText,
		CheckCircle,
		Plus,
		Trash2,
		Loader
	} from 'lucide-svelte';

	export let data;
	export let form;

	let isSubmitting = false;
	let isFormLoading = false;
	let selectedTags: number[] = data.experience?.tags?.map((t) => t.id) || [];
	let showSubmitModal = false;
	let showCancelModal = false;
	let content = data.experience?.content || '';
	let highlights: string[] = data.experience?.highlights || [''];

	let currentTitle = data.experience?.title || '';
	let currentRole = data.experience?.role || '';
	let currentCompany = data.experience?.company || '';
	let currentLocation = data.experience?.location || '';
	let currentDescription = data.experience?.description || '';
	let initialDescription = data.experience?.description || '';

	let currentStartDate = data.experience?.startDate
		? new Date(data.experience.startDate).toISOString().split('T')[0]
		: '';
	let currentEndDate = data.experience?.endDate
		? new Date(data.experience.endDate).toISOString().split('T')[0]
		: '';
	let currentIsCurrent = !data.experience?.endDate || false;
	let currentIsHidden = data.experience?.isHidden || false;

	let initialTitle = data.experience?.title || '';
	let initialRole = data.experience?.role || '';
	let initialCompany = data.experience?.company || '';
	let initialLocation = data.experience?.location || '';

	let initialContent = data.experience?.content || '';
	let initialStartDate = data.experience?.startDate
		? new Date(data.experience.startDate).toISOString().split('T')[0]
		: '';
	let initialEndDate = data.experience?.endDate
		? new Date(data.experience.endDate).toISOString().split('T')[0]
		: '';
	let initialIsCurrent = !data.experience?.endDate || false;
	let initialIsHidden = data.experience?.isHidden || false;

	let initialHighlights = data.experience?.highlights || [''];
	let initialTags = data.experience?.tags?.map((t) => t.id) || [];
	let hasUnsavedChanges = false;

	$: isEditing = !!data.experience;
	$: pageTitle = `Edit: ${data.experience?.title}`;

	onMount(() => {
		updateChangeDetection();
	});

	function updateChangeDetection() {
		if (!browser) {
			hasUnsavedChanges = false;
			return;
		}

		hasUnsavedChanges =
			currentTitle !== initialTitle ||
			currentRole !== initialRole ||
			currentCompany !== initialCompany ||
			currentLocation !== initialLocation ||
			currentDescription !== initialDescription ||
			currentStartDate !== initialStartDate ||
			currentEndDate !== initialEndDate ||
			currentIsCurrent !== initialIsCurrent ||
			currentIsHidden !== initialIsHidden ||
			JSON.stringify(highlights.filter((h) => h.trim())) !==
				JSON.stringify(initialHighlights.filter((h) => h.trim())) ||
			JSON.stringify(selectedTags.sort()) !== JSON.stringify(initialTags.sort());
	}

	$: if (browser) {
		updateChangeDetection();
	}

	function handleTitleChange(event: Event) {
		currentTitle = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleRoleChange(event: Event) {
		currentRole = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleCompanyChange(event: Event) {
		currentCompany = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleLocationChange(event: Event) {
		currentLocation = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleContentChange() {
		updateChangeDetection();
	}

	function handleStartDateChange(event: Event) {
		currentStartDate = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleEndDateChange(event: Event) {
		currentEndDate = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleIsCurrentChange(event: Event) {
		currentIsCurrent = (event.target as HTMLInputElement).checked;
		if (currentIsCurrent) {
			currentEndDate = '';
		}
		updateChangeDetection();
	}

	function handleIsHiddenChange(event: Event) {
		currentIsHidden = (event.target as HTMLInputElement).checked;
		updateChangeDetection();
	}

	function handleTagsChange(event: CustomEvent) {
		selectedTags = event.detail.selectedTags;
		updateChangeDetection();
	}

	function addHighlight() {
		highlights = [...highlights, ''];
		updateChangeDetection();
	}

	function removeHighlight(index: number) {
		highlights = highlights.filter((_, i) => i !== index);
		updateChangeDetection();
	}

	function handleHighlightChange(index: number, event: Event) {
		const value = (event.target as HTMLTextAreaElement).value;
		highlights[index] = value;
		highlights = [...highlights];
		updateChangeDetection();
	}

	function handleSubmit() {
		if (hasUnsavedChanges) {
			showSubmitModal = true;
		}
	}

	function confirmSubmit() {
		showSubmitModal = false;
		isSubmitting = true;

		if (browser) {
			const form = document.getElementById('experienceForm') as HTMLFormElement;
			if (form) {
				form.submit();
			}
		}
	}

	function handleCancel() {
		if (hasUnsavedChanges) {
			showCancelModal = true;
		} else {
			goto('/experiences');
		}
	}

	function confirmCancel() {
		showCancelModal = false;
		goto('/experiences');
	}

	function handleDescriptionChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		currentDescription = target.value;
		checkForChanges();
	}

	function checkForChanges() {
		hasUnsavedChanges =
			currentTitle !== initialTitle ||
			currentRole !== initialRole ||
			currentCompany !== initialCompany ||
			currentLocation !== initialLocation ||
			currentDescription !== initialDescription ||
			currentStartDate !== initialStartDate ||
			currentEndDate !== initialEndDate ||
			currentIsCurrent !== initialIsCurrent ||
			currentIsHidden !== initialIsHidden ||
			content !== initialContent ||
			!arraysEqual(highlights, initialHighlights) ||
			!arraysEqual(selectedTags, initialTags);
	}

	function arraysEqual(a: any[], b: any[]) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
</script>

<svelte:head>
	<title>{pageTitle} - Admin</title>
</svelte:head>


{#if isFormLoading}
	<div class="bg-opacity-50 fixed inset-0 z-40 flex items-center justify-center bg-black">
		<div class="flex items-center space-x-3 rounded-lg bg-white p-6">
			<Loader class="h-6 w-6 animate-spin text-blue-600" />
			<span class="text-gray-900">Loading...</span>
		</div>
	</div>
{/if}


<ConfirmationModal
	isOpen={showSubmitModal}
	title="Update Experience"
	message="Are you sure you want to update this experience?"
	confirmText="Update"
	on:confirm={confirmSubmit}
	on:cancel={() => (showSubmitModal = false)}
/>


<ConfirmationModal
	isOpen={showCancelModal}
	title="Discard Changes"
	message="You have unsaved changes. Are you sure you want to leave without saving?"
	confirmText="Discard"
	cancelText="Stay"
	confirmClass="bg-red-600 hover:bg-red-700"
	on:confirm={confirmCancel}
	on:cancel={() => (showCancelModal = false)}
/>

<div class="space-y-6">
	
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<button on:click={handleCancel} class="rounded-lg p-2 transition-colors hover:bg-gray-100">
				<ArrowLeft class="h-5 w-5" />
			</button>
			<div>
				<h1 class="flex items-center text-2xl font-bold text-gray-900">
					<Briefcase class="mr-3 h-6 w-6 text-blue-600" />
					{pageTitle}
				</h1>
				<p class="mt-1 text-gray-600">Update your work experience details</p>
				{#if hasUnsavedChanges}
					<p class="mt-1 text-sm text-orange-600">● Unsaved changes</p>
				{/if}
			</div>
		</div>
	</div>

	
	<form
		id="experienceForm"
		method="POST"
		action="?/save"
		use:enhance={() => {
			isFormLoading = true;
			return async ({ result, update }) => {
				isFormLoading = false;
				isSubmitting = false;

				if (result.type === 'redirect') {
					goto(result.location);
				} else if (result.type === 'success') {
					goto('/experiences');
				} else {
					await update();
				}
			};
		}}
		class="space-y-6"
	>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			
			<div class="space-y-6 lg:col-span-2">
				
				<div class="card space-y-4 p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Settings class="mr-2 h-5 w-5" />
						Basic Information
					</h3>

					<div>
						<label for="title" class="mb-2 block text-sm font-medium text-gray-700">
							Experience Title *
						</label>
						<input
							type="text"
							name="title"
							id="title"
							required
							bind:value={currentTitle}
							on:input={handleTitleChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Senior Frontend Developer"
						/>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="role" class="mb-2 block text-sm font-medium text-gray-700">
								Job Role *
							</label>
							<input
								type="text"
								name="role"
								id="role"
								required
								bind:value={currentRole}
								on:input={handleRoleChange}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., Frontend Developer"
							/>
						</div>

						<div>
							<label for="company" class="mb-2 block text-sm font-medium text-gray-700">
								Company *
							</label>
							<input
								type="text"
								name="company"
								id="company"
								required
								bind:value={currentCompany}
								on:input={handleCompanyChange}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., Tech Company Inc."
							/>
						</div>
					</div>

					<div>
						<label for="location" class="mb-2 block text-sm font-medium text-gray-700">
							Location *
						</label>
						<input
							type="text"
							name="location"
							id="location"
							required
							bind:value={currentLocation}
							on:input={handleLocationChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., San Francisco, CA or Remote"
						/>
					</div>

					<div>
						<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
							Short Description
						</label>
						<textarea
							name="description"
							id="description"
							rows="3"
							value={currentDescription}
							on:input={handleDescriptionChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="Brief summary of your role and key responsibilities..."
						></textarea>
						<p class="mt-1 text-xs text-gray-500">
							A short summary that will be shown in lists and previews
						</p>
					</div>
				</div>

				
				<div class="card p-6">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="flex items-center text-lg font-medium text-gray-900">
							<CheckCircle class="mr-2 h-5 w-5" />
							Key Achievements & Responsibilities
						</h3>
						<button
							type="button"
							on:click={addHighlight}
							class="flex items-center space-x-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
						>
							<Plus class="h-3 w-3" />
							<span>Add</span>
						</button>
					</div>

					<div class="space-y-3">
						{#each highlights as highlight, index}
							<div class="flex items-start space-x-3">
								<div
									class="mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
								>
									<span class="text-xs font-medium text-blue-700">{index + 1}</span>
								</div>
								<div class="flex-1">
									<textarea
										name="highlights"
										value={highlight}
										on:input={(e) => handleHighlightChange(index, e)}
										rows="2"
										class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
										placeholder="Describe a key achievement or responsibility..."
									></textarea>
								</div>
								{#if highlights.length > 1}
									<button
										type="button"
										on:click={() => removeHighlight(index)}
										class="mt-2 flex-shrink-0 rounded p-1 text-red-600 transition-colors hover:bg-red-50"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								{/if}
							</div>
						{/each}
					</div>

					<p class="mt-3 text-xs text-gray-500">
						Add your key achievements, responsibilities, and impact in this role.
					</p>
				</div>

				
				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<FileText class="mr-2 h-5 w-5" />
						Additional Details
					</h3>
					<div id="content-editor">
						<RichTextEditor
							bind:content
							placeholder="Add any additional details about your role, projects worked on, etc..."
							on:update={handleContentChange}
						/>
					</div>
					<input type="hidden" name="content" bind:value={content} />
					<p class="mt-2 text-xs text-gray-500">
						Optional: Add more detailed information about your role, specific projects, etc.
					</p>
				</div>
			</div>

			
			<div class="space-y-6">
				
				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Calendar class="mr-2 h-5 w-5" />
						Duration
					</h3>

					<div class="space-y-4">
						<div>
							<label for="startDate" class="mb-1 block text-sm font-medium text-gray-700">
								Start Date *
							</label>
							<input
								type="date"
								name="startDate"
								id="startDate"
								required
								bind:value={currentStartDate}
								on:input={handleStartDateChange}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div class="flex items-center">
							<input
								type="checkbox"
								name="isCurrent"
								id="isCurrent"
								bind:checked={currentIsCurrent}
								on:change={handleIsCurrentChange}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label for="isCurrent" class="ml-2 text-sm text-gray-700">
								I currently work here
							</label>
						</div>

						{#if !currentIsCurrent}
							<div>
								<label for="endDate" class="mb-1 block text-sm font-medium text-gray-700">
									End Date
								</label>
								<input
									type="date"
									name="endDate"
									id="endDate"
									bind:value={currentEndDate}
									on:input={handleEndDateChange}
									class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						{/if}

						<div class="flex items-center pt-2">
							<input
								type="checkbox"
								name="isHidden"
								id="isHidden"
								bind:checked={currentIsHidden}
								on:change={handleIsHiddenChange}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label for="isHidden" class="ml-2 text-sm text-gray-700">
								Hide this experience
							</label>
						</div>
					</div>
				</div>

				
				<TagManager
					bind:tags={data.tags}
					bind:selectedTags
					title="Technologies & Skills"
					techOnly={false}
					createAction="?/createTag"
					on:change={handleTagsChange}
				>
					<svelte:fragment slot="hidden-inputs" let:selectedTags>
						{#each selectedTags as tagId}
							<input type="hidden" name="tagIds" value={tagId} />
						{/each}
					</svelte:fragment>
				</TagManager>

				
				<div class="card p-6">
					<div class="space-y-3">
						<button
							type="button"
							on:click={handleSubmit}
							disabled={isSubmitting || isFormLoading || !hasUnsavedChanges}
							class="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
						>
							{#if isSubmitting || isFormLoading}
								<Loader class="mr-2 h-4 w-4 animate-spin" />
								{isSubmitting ? 'Updating...' : 'Loading...'}
							{:else}
								<Save class="mr-2 h-4 w-4" />
								Update Experience
							{/if}
						</button>

						<button
							type="button"
							on:click={handleCancel}
							disabled={isSubmitting || isFormLoading}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
						>
							Cancel
						</button>
					</div>

					{#if !hasUnsavedChanges}
						<p class="mt-2 text-center text-xs text-gray-500">No changes to save</p>
					{/if}
				</div>
			</div>
		</div>

		{#if form?.success}
			<div class="rounded-lg border border-green-200 bg-green-50 p-4">
				<p class="text-sm text-green-600">
					✅ {form.message || 'Experience updated successfully!'}
				</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-600">❌ {form.error}</p>
			</div>
		{/if}
	</form>
</div>
