<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import TagManager from '$lib/components/TagManager.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import {
		Save,
		Eye,
		ArrowLeft,
		Calendar,
		Code,
		Globe,
		Github,
		Star,
		Loader,
		FolderOpen,
		Link,
		Image,
		Settings,
		FileText,
		Images,
		Clock
	} from 'lucide-svelte';
	import { generateFolderPath } from '$lib/utils/imageResize';

	export let data;
	export let form;

	let isSubmitting = false;
	let isFormLoading = false;
	let selectedTags: number[] = data.project?.tags?.map((t) => t.id) || [];
	let featuredImageUrl = data.project?.imageUrl || '';
	let thumbnailImageUrl = data.project?.thumbnailUrl || '';
	let featuredImagePublicId = '';
	let featuredImageSizes: any = {};
	let showSubmitModal = false;
	let showCancelModal = false;
	let content = data.project?.content || '';

	let additionalImages: Array<{ url: string; publicId: string }> =
		data.project?.images?.map((img) => ({
			url: img.url || img,
			publicId: img.publicId || extractPublicIdFromUrl(img.url || img)
		})) || [];

	let currentTitle = data.project?.title || '';
	let currentSubtitle = data.project?.subtitle || '';
	let currentDescription = data.project?.description || '';
	let currentLiveUrl = data.project?.liveUrl || '';
	let currentGithubUrl = data.project?.githubUrl || '';
	let currentOrder = data.project?.order || 1;
	let currentFeatured = data.project?.featured || false;

	let initialTitle = data.project?.title || '';
	let initialSubtitle = data.project?.subtitle || '';
	let initialDescription = data.project?.description || '';
	let initialContent = data.project?.content || '';
	let initialLiveUrl = data.project?.liveUrl || '';
	let initialGithubUrl = data.project?.githubUrl || '';
	let initialOrder = data.project?.order || 1;
	let initialFeatured = data.project?.featured || false;
	let initialFeaturedImage = data.project?.imageUrl || '';
	let initialThumbnailImage = data.project?.thumbnailUrl || '';
	let initialAdditionalImages = additionalImages.slice();
	let initialTags = data.project?.tags?.map((t) => t.id) || [];
	let hasUnsavedChanges = false;

	$: isEditing = !data.isNew;
	$: pageTitle = isEditing ? `Edit: ${data.project?.title}` : 'Create New Project';
	$: folderPath = generateFolderPath('projects', data.project?.title || 'new-project');

	onMount(() => {
		initialTitle = data.project?.title || '';
		initialSubtitle = data.project?.subtitle || '';
		initialDescription = data.project?.description || '';
		initialContent = data.project?.content || '';
		initialLiveUrl = data.project?.liveUrl || '';
		initialGithubUrl = data.project?.githubUrl || '';
		initialOrder = data.project?.order || 1;
		initialFeatured = data.project?.featured || false;
		initialFeaturedImage = data.project?.imageUrl || '';
		initialThumbnailImage = data.project?.thumbnailUrl || '';
		initialAdditionalImages = additionalImages.slice();
		initialTags = data.project?.tags?.map((t) => t.id) || [];

		updateChangeDetection();
	});

	function updateChangeDetection() {
		if (!browser) {
			hasUnsavedChanges = false;
			return;
		}

		if (!data.project) {
			hasUnsavedChanges = !!(
				currentTitle ||
				currentDescription ||
				content ||
				featuredImageUrl ||
				thumbnailImageUrl ||
				additionalImages.length ||
				selectedTags.length
			);
			return;
		}

		const titleInput = document.getElementById('title') as HTMLInputElement;
		const subtitleInput = document.getElementById('subtitle') as HTMLInputElement;
		const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
		const liveUrlInput = document.getElementById('liveUrl') as HTMLInputElement;
		const githubUrlInput = document.getElementById('githubUrl') as HTMLInputElement;
		const orderInput = document.getElementById('order') as HTMLInputElement;
		const featuredInput = document.getElementById('featured') as HTMLInputElement;

		const titleValue = titleInput?.value || currentTitle;
		const subtitleValue = subtitleInput?.value || currentSubtitle;
		const descriptionValue = descriptionInput?.value || currentDescription;
		const liveUrlValue = liveUrlInput?.value || currentLiveUrl;
		const githubUrlValue = githubUrlInput?.value || currentGithubUrl;
		const orderValue = Number(orderInput?.value) || currentOrder;
		const featuredValue = featuredInput?.checked || currentFeatured;

		hasUnsavedChanges =
			titleValue !== initialTitle ||
			subtitleValue !== initialSubtitle ||
			descriptionValue !== initialDescription ||
			content !== initialContent ||
			liveUrlValue !== initialLiveUrl ||
			githubUrlValue !== initialGithubUrl ||
			orderValue !== initialOrder ||
			featuredValue !== initialFeatured ||
			featuredImageUrl !== initialFeaturedImage ||
			thumbnailImageUrl !== initialThumbnailImage ||
			JSON.stringify(additionalImages) !== JSON.stringify(initialAdditionalImages) ||
			JSON.stringify(selectedTags.sort()) !== JSON.stringify(initialTags.sort());
	}

	$: if (browser) {
		updateChangeDetection();
	}

	function handleTitleChange(event: Event) {
		currentTitle = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleSubtitleChange(event: Event) {
		currentSubtitle = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleDescriptionChange(event: Event) {
		currentDescription = (event.target as HTMLTextAreaElement).value;
		updateChangeDetection();
	}

	function handleContentChange() {
		updateChangeDetection();
	}

	function handleLiveUrlChange(event: Event) {
		currentLiveUrl = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleGithubUrlChange(event: Event) {
		currentGithubUrl = (event.target as HTMLInputElement).value;
		updateChangeDetection();
	}

	function handleOrderChange(event: Event) {
		currentOrder = Number((event.target as HTMLInputElement).value);
		updateChangeDetection();
	}

	function handleFeaturedChange(event: Event) {
		currentFeatured = (event.target as HTMLInputElement).checked;
		updateChangeDetection();
	}

	function handleTagsChange(event: CustomEvent) {
		selectedTags = event.detail.selectedTags;
		updateChangeDetection();
	}

	function handleThumbnailImageUpload(event: CustomEvent) {
		thumbnailImageUrl = event.detail.url;
		updateChangeDetection();
	}

	function handleThumbnailImageRemove() {
		thumbnailImageUrl = '';
		updateChangeDetection();
	}

	function handleFeaturedImageUpload(event: CustomEvent) {
		featuredImageUrl = event.detail.url;
		featuredImagePublicId = event.detail.publicId;
		featuredImageSizes = event.detail.sizes;
		updateChangeDetection();
	}

	function handleFeaturedImageRemove() {
		featuredImageUrl = '';
		featuredImagePublicId = '';
		featuredImageSizes = {};
		updateChangeDetection();
	}

	function handleMultipleImageUpload(event: CustomEvent) {
		additionalImages = [...additionalImages, ...event.detail.images];
		updateChangeDetection();
	}

	function handleRemoveMultipleImage(event: CustomEvent) {
		const { index } = event.detail;
		additionalImages = additionalImages.filter((_, i) => i !== index);
		updateChangeDetection();
	}

	function handleImageError(event: CustomEvent) {
		console.error('Image upload error:', event.detail.message);
	}

	function estimateReadingTime(content: string): number {
		const wordsPerMinute = 200;
		const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
		return Math.ceil(words / wordsPerMinute);
	}

	$: estimatedReadingTime = estimateReadingTime(content);

	function handleSubmit() {
		if (hasUnsavedChanges || !isEditing) {
			showSubmitModal = true;
		}
	}

	function confirmSubmit() {
		showSubmitModal = false;
		isSubmitting = true;

		if (browser) {
			const form = document.getElementById('projectForm') as HTMLFormElement;
			if (form) {
				form.submit();
			}
		}
	}

	function handleCancel() {
		if (hasUnsavedChanges) {
			showCancelModal = true;
		} else {
			goto('/projects');
		}
	}

	function confirmCancel() {
		showCancelModal = false;
		goto('/projects');
	}

	function previewProject() {
		if (currentLiveUrl) {
			window.open(currentLiveUrl, '_blank');
		}
	}

	function viewGithub() {
		if (currentGithubUrl) {
			window.open(currentGithubUrl, '_blank');
		}
	}

	function extractPublicIdFromUrl(url: string): string {
		if (!url) return '';

		const urlParts = url.split('/');
		const uploadIndex = urlParts.findIndex((part) => part === 'upload');

		if (uploadIndex === -1) return '';

		const afterUpload = urlParts.slice(uploadIndex + 1);
		const publicIdParts = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;

		return publicIdParts.join('/').replace(/\.[^/.]+$/, '');
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
	title={isEditing ? 'Update Project' : 'Create Project'}
	message={isEditing
		? 'Are you sure you want to update this project?'
		: 'Are you sure you want to create this project?'}
	confirmText={isEditing ? 'Update' : 'Create'}
	type="info"
	on:confirm={confirmSubmit}
	on:cancel={() => (showSubmitModal = false)}
/>

<ConfirmationModal
	isOpen={showCancelModal}
	title="Discard Changes"
	message="You have unsaved changes. Are you sure you want to leave without saving?"
	confirmText="Discard"
	cancelText="Stay"
	type="danger"
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
					<FolderOpen class="mr-3 h-6 w-6 text-blue-600" />
					{pageTitle}
				</h1>
				<p class="mt-1 text-gray-600">
					{isEditing ? 'Update your project details' : 'Create a new portfolio project'}
				</p>
				{#if hasUnsavedChanges}
					<p class="mt-1 text-sm text-orange-600">● Unsaved changes</p>
				{/if}
			</div>
		</div>

		<div class="flex items-center space-x-3">
			{#if currentLiveUrl}
				<button
					on:click={previewProject}
					class="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
				>
					<Globe class="h-4 w-4" />
					<span>Live Demo</span>
				</button>
			{/if}

			{#if currentGithubUrl}
				<button
					on:click={viewGithub}
					class="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
				>
					<Github class="h-4 w-4" />
					<span>GitHub</span>
				</button>
			{/if}
		</div>
	</div>

	<form
		id="projectForm"
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
					goto('/projects');
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
							Project Title *
						</label>
						<input
							type="text"
							name="title"
							id="title"
							required
							value={data.project?.title || ''}
							on:input={handleTitleChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="Enter project title..."
						/>
					</div>

					<div>
						<label for="subtitle" class="mb-2 block text-sm font-medium text-gray-700">
							Subtitle
						</label>
						<input
							type="text"
							name="subtitle"
							id="subtitle"
							value={data.project?.subtitle || ''}
							on:input={handleSubtitleChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="Brief subtitle or tagline..."
						/>
					</div>

					<div>
						<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
							Description *
						</label>
						<textarea
							name="description"
							id="description"
							required
							rows="4"
							value={data.project?.description || ''}
							on:input={handleDescriptionChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="Describe your project, its features, and technologies used..."
						></textarea>
					</div>
				</div>

				<div class="card p-6">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="flex items-center text-lg font-medium text-gray-900">
							<FileText class="mr-2 h-5 w-5" />
							Project Details
						</h3>
						{#if content}
							<div class="flex items-center text-xs text-gray-500">
								<Clock class="mr-1 h-3 w-3" />
								~{estimatedReadingTime} min read
							</div>
						{/if}
					</div>
					<div id="content-editor">
						<RichTextEditor
							bind:content
							placeholder="Describe your project in detail, technical challenges, solutions, etc..."
							on:update={handleContentChange}
						/>
					</div>
					<input type="hidden" name="content" bind:value={content} />
					<p class="mt-2 text-xs text-gray-500">
						Detailed project documentation, technical specs, development process, etc.
					</p>
				</div>

				<div class="card space-y-4 p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Link class="mr-2 h-5 w-5" />
						Project Links
					</h3>

					<div>
						<label for="liveUrl" class="mb-2 block text-sm font-medium text-gray-700">
							<Globe class="mr-1 inline h-4 w-4" />
							Live Demo URL
						</label>
						<input
							type="url"
							name="liveUrl"
							id="liveUrl"
							value={data.project?.liveUrl || ''}
							on:input={handleLiveUrlChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="https://your-project.com"
						/>
					</div>

					<div>
						<label for="githubUrl" class="mb-2 block text-sm font-medium text-gray-700">
							<Github class="mr-1 inline h-4 w-4" />
							GitHub Repository
						</label>
						<input
							type="url"
							name="githubUrl"
							id="githubUrl"
							value={data.project?.githubUrl || ''}
							on:input={handleGithubUrlChange}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="https://github.com/username/repository"
						/>
					</div>
				</div>

				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Images class="mr-2 h-5 w-5" />
						Project Screenshots
						{#if additionalImages.length > 0}
							<span class="ml-2 text-xs text-gray-500">({additionalImages.length} images)</span>
						{/if}
					</h3>

					<ImageUpload
						label="Additional Images"
						currentImages={additionalImages}
						folder={folderPath + '/gallery'}
						multiple={true}
						maxFiles={20}
						maxSize={10}
						on:uploadMultiple={handleMultipleImageUpload}
						on:removeMultiple={handleRemoveMultipleImage}
						on:error={(e) => console.error(e.detail.message)}
					/>

					<input
						type="hidden"
						name="additionalImagesJson"
						value={JSON.stringify(additionalImages)}
					/>

					<p class="mt-2 text-xs text-gray-500">
						Upload screenshots, mockups, or other visuals that showcase your project.
					</p>
				</div>
			</div>

			<div class="space-y-6">
				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Settings class="mr-2 h-5 w-5" />
						Project Settings
					</h3>

					<div class="space-y-4">
						<div class="flex items-center">
							<input
								type="checkbox"
								name="featured"
								id="featured"
								checked={data.project?.featured || false}
								on:change={handleFeaturedChange}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label for="featured" class="ml-2 flex items-center text-sm text-gray-700">
								<Star class="mr-1 h-3 w-3" />
								Featured project
							</label>
						</div>

						<div>
							<label for="order" class="mb-1 block text-sm font-medium text-gray-700">
								Display Order
							</label>
							<input
								type="number"
								name="order"
								id="order"
								min="1"
								value={data.project?.order || 1}
								on:input={handleOrderChange}
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="1"
							/>
							<p class="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
						</div>
					</div>
				</div>

				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Image class="mr-2 h-5 w-5" />
						Featured Image
					</h3>

					<ImageUpload
						currentImageUrl={featuredImageUrl}
						folder={folderPath}
						multiple={false}
						maxSize={10}
						on:upload={handleFeaturedImageUpload}
						on:remove={handleFeaturedImageRemove}
						on:error={handleImageError}
					/>
					<input type="hidden" name="imageUrl" bind:value={featuredImageUrl} />


					<p class="mt-2 text-xs text-gray-500">
						Main project image displayed in listings and headers.
					</p>
				</div>

				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Image class="mr-2 h-5 w-5" />
						Thumbnail Image
					</h3>

					<ImageUpload
						currentImageUrl={thumbnailImageUrl}
						folder={folderPath}
						multiple={false}
						maxSize={10}
						on:upload={handleThumbnailImageUpload}
						on:remove={handleThumbnailImageRemove}
						on:error={handleImageError}
					/>
					<input type="hidden" name="thumbnailUrl" bind:value={thumbnailImageUrl} />


					<p class="mt-2 text-xs text-gray-500">
						Thumbnail project image displayed in listings and headers.
					</p>
				</div>

				<TagManager
					bind:tags={data.tags}
					bind:selectedTags
					title="Technologies"
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
							disabled={isSubmitting || isFormLoading}
							class="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
						>
							{#if isSubmitting || isFormLoading}
								<Loader class="mr-2 h-4 w-4 animate-spin" />
								{isSubmitting ? 'Saving...' : 'Loading...'}
							{:else}
								<Save class="mr-2 h-4 w-4" />
								{isEditing ? 'Update' : 'Create'} Project
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
				</div>
			</div>
		</div>

		{#if form?.success}
			<div class="rounded-lg border border-green-200 bg-green-50 p-4">
				<p class="text-sm text-green-600">✅ {form.message || 'Project saved successfully!'}</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-600">❌ {form.error}</p>
			</div>
		{/if}
	</form>
</div>
