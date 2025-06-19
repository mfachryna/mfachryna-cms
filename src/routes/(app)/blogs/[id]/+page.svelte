<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import {
		Save,
		Eye,
		ArrowLeft,
		Calendar,
		Tag,
		Image,
		X,
		Plus,
		Clock,
		TrendingUp,
		Star,
		Loader
	} from 'lucide-svelte';
	import { generateFolderPath } from '$lib/utils/imageResize';

	export let data;
	export let form;

	function handleTagKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			tagSearchQuery = '';
		}
	}

	let isSubmitting = false;
	let isFormLoading = false;
	let selectedTags: number[] = data.blog?.tags?.map((t) => t.id) || [];
	let newTagName = '';
	let newTagIsTech = false;
	let showNewTagInput = false;
	let featuredImageUrl = data.blog?.imageUrl || '';
	let featuredImagePublicId = '';
	let featuredImageSizes: any = {};
	let showSubmitModal = false;
	let showCancelModal = false;
	let content = data.blog?.content || '';

	let currentTitle = data.blog?.title || '';
	let currentDescription = data.blog?.description || '';
	let currentSlug = data.blog?.slug || '';

	let initialTitle = data.blog?.title || '';
	let initialDescription = data.blog?.description || '';
	let initialContent = data.blog?.content || '';
	let initialFeaturedImage = data.blog?.imageUrl || '';
	let initialAdditionalImages = data.blog?.images || [];
	let hasUnsavedChanges = false;

	$: isEditing = !data.isNew;
	$: pageTitle = isEditing ? `Edit: ${data.blog?.title}` : 'Create New Blog Post';
	$: folderPath = generateFolderPath('blogs', data.blog?.slug || 'new-blog');

	onMount(() => {
		initialTitle = data.blog?.title || '';
		initialDescription = data.blog?.description || '';
		initialContent = data.blog?.content || '';
		initialFeaturedImage = data.blog?.imageUrl || '';
		initialAdditionalImages = data.blog?.images || [];

		updateChangeDetection();
	});

	function updateChangeDetection() {
		if (!browser) {
			hasUnsavedChanges = false;
			return;
		}

		if (!data.blog) {
			hasUnsavedChanges = !!(
				currentTitle ||
				currentDescription ||
				content ||
				featuredImageUrl ||
				additionalImages.length
			);
			return;
		}

		const titleInput = document.getElementById('title') as HTMLInputElement;
		const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;

		const titleValue = titleInput?.value || currentTitle;
		const descriptionValue = descriptionInput?.value || currentDescription;

		hasUnsavedChanges =
			titleValue !== initialTitle ||
			descriptionValue !== initialDescription ||
			content !== initialContent ||
			featuredImageUrl !== initialFeaturedImage ||
			JSON.stringify(additionalImages) !== JSON.stringify(initialAdditionalImages);
	}

	$: if (browser) {
		updateChangeDetection();
	}

	function handleTitleChange(event: Event) {
		currentTitle = (event.target as HTMLInputElement).value;
		updateSlug(event);
		updateChangeDetection();
	}

	function handleDescriptionChange(event: Event) {
		currentDescription = (event.target as HTMLTextAreaElement).value;
		updateChangeDetection();
	}

	function handleContentChange() {
		updateChangeDetection();
	}

	let tagSearchQuery = '';
	let isAddingTag = false;
	let tagError = '';
	let tagSuccess = '';

	$: filteredTags = data.tags.filter((tag) =>
		tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
	);

	function toggleTag(tagId: number) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
		updateChangeDetection();
	}

	async function addNewTag() {
		if (!newTagName.trim()) return;

		try {
			isAddingTag = true;
			tagError = '';
			tagSuccess = '';

			const formData = new FormData();
			formData.append('tagName', newTagName.trim());
			formData.append('isTech', newTagIsTech.toString());

			const response = await fetch(window.location.pathname + '?/createTag', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				const newTag = result.tag;
				data.tags = [...data.tags, newTag];
				selectedTags = [...selectedTags, newTag.id];
				newTagName = '';
				newTagIsTech = false;
				showNewTagInput = false;
				tagSuccess = result.message || `Tag "${newTag.name}" created successfully!`;

				setTimeout(() => {
					tagSuccess = '';
				}, 3000);
			} else {
				tagError = result.error || 'Failed to create tag';
			}
		} catch (error) {
			console.error('Error creating tag:', error);
			tagError = 'Failed to create tag. Please try again.';
		} finally {
			isAddingTag = false;
		}
	}

	function handleTagSubmit() {
		return async ({ result, update }) => {
			isAddingTag = false;

			if (result.type === 'success') {
				const newTag = result.data.tag;
				data.tags = [...data.tags, newTag];
				selectedTags = [...selectedTags, newTag.id];
				newTagName = '';
				newTagIsTech = false;
				showNewTagInput = false;
				tagSuccess = result.data.message || `Tag "${newTag.name}" created successfully!`;
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

	let featuredImageUrls: Record<string, string> = {};
	let additionalImageSets: Array<Record<string, string>> = [];

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

	function handleAdditionalImageUpload(event: CustomEvent) {
		additionalImages = [...additionalImages, event.detail.sizes.medium];
		updateChangeDetection();
	}

	function handleImageError(event: CustomEvent) {
		console.error('Image upload error:', event.detail.message);
	}

	function generateSlug(title: string) {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	function updateSlug(event: Event) {
		if (!browser) return;

		const title = (event.target as HTMLInputElement).value;
		const slugInput = document.getElementById('slug') as HTMLInputElement;
		if (slugInput && !isEditing) {
			slugInput.value = generateSlug(title);
		}
	}

	function estimateReadingTime(content: string): number {
		const wordsPerMinute = 200;
		const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
		return Math.ceil(words / wordsPerMinute);
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
			const form = document.getElementById('blogForm') as HTMLFormElement;
			if (form) {
				form.submit();
			}
		}
	}

	function handleCancel() {
		if (hasUnsavedChanges) {
			showCancelModal = true;
		} else {
			goto('/blogs');
		}
	}

	function confirmCancel() {
		showCancelModal = false;
		goto('/blogs');
	}

	$: estimatedReadingTime = estimateReadingTime(content);

	let additionalImages: Array<{ url: string; publicId: string }> =
		data.blog?.images?.map((img) => ({
			url: img.url || img,
			publicId: img.publicId || extractPublicIdFromUrl(img.url || img)
		})) || [];

	function handleMultipleImageUpload(event: CustomEvent) {
		additionalImages = [...additionalImages, ...event.detail.images];
		updateChangeDetection();
	}

	function handleRemoveMultipleImage(event: CustomEvent) {
		const { index } = event.detail;
		additionalImages = additionalImages.filter((_, i) => i !== index);
		updateChangeDetection();
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
			<Loader class="text-primary h-6 w-6 animate-spin" />
			<span class="text-gray-900">Loading...</span>
		</div>
	</div>
{/if}

<ConfirmationModal
	bind:isOpen={showSubmitModal}
	title={isEditing ? 'Update Blog Post' : 'Create Blog Post'}
	message={isEditing
		? 'Are you sure you want to update this blog post?'
		: 'Are you sure you want to create this blog post?'}
	confirmText={isEditing ? 'Update' : 'Create'}
	type="info"
	isLoading={isSubmitting}
	on:confirm={confirmSubmit}
	on:cancel={() => (showSubmitModal = false)}
/>

<ConfirmationModal
	bind:isOpen={showCancelModal}
	title="Discard Changes"
	message="You have unsaved changes. Are you sure you want to leave without saving?"
	confirmText="Discard"
	cancelText="Stay"
	type="warning"
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
				<h1 class="text-2xl font-bold text-gray-900">{pageTitle}</h1>
				<p class="mt-1 text-gray-600">
					{isEditing ? 'Update your blog post' : 'Create a new blog post'}
				</p>
				{#if hasUnsavedChanges}
					<p class="mt-1 text-sm text-orange-600">● Unsaved changes</p>
				{/if}
			</div>
		</div>

		<div class="flex items-center space-x-3">
			{#if isEditing}
				<a
					href="/blogs/{data.blog.id}/preview"
					class="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
				>
					<Eye class="h-4 w-4" />
					<span>Preview</span>
				</a>
			{/if}
		</div>
	</div>

	<form
		id="blogForm"
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
					await update();
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
					<div>
						<label for="title" class="mb-2 block text-sm font-medium text-gray-700">
							Title *
						</label>
						<input
							type="text"
							name="title"
							id="title"
							required
							value={data.blog?.title || ''}
							on:input={handleTitleChange}
							class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
							placeholder="Enter blog title..."
						/>
					</div>

					<div>
						<label for="slug" class="mb-2 block text-sm font-medium text-gray-700"> Slug * </label>
						<input
							type="text"
							name="slug"
							id="slug"
							required
							value={data.blog?.slug || ''}
							class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
							placeholder="blog-post-slug"
						/>
						<p class="mt-1 text-xs text-gray-500">
							URL: /blog/<span class="font-mono">{data.blog?.slug || 'blog-post-slug'}</span>
						</p>
					</div>
				</div>

				<div class="card p-6">
					<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
						Description *
					</label>
					<textarea
						name="description"
						id="description"
						required
						rows="3"
						value={data.blog?.description || ''}
						on:input={handleDescriptionChange}
						class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
						placeholder="Brief description for SEO and social sharing..."
					></textarea>
					<p class="mt-1 text-xs text-gray-500">
						This will be used for SEO meta description and social sharing.
					</p>
				</div>

				<div class="card p-6">
					<div class="mb-2 flex items-center justify-between">
						<label for="content-editor" class="block text-sm font-medium text-gray-700">
							Content *
						</label>
						<div class="flex items-center text-xs text-gray-500">
							<Clock class="mr-1 h-3 w-3" />
							~{estimatedReadingTime} min read
						</div>
					</div>
					<div id="content-editor">
						<RichTextEditor
							bind:content
							placeholder="Start writing your blog post..."
							on:update={handleContentChange}
						/>
					</div>
					<input type="hidden" name="content" bind:value={content} />
				</div>
			</div>

			<div class="space-y-6">
				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<TrendingUp class="mr-2 h-5 w-5" />
						Publish Settings
					</h3>

					<div class="space-y-4">
						<div class="flex items-center">
							<input
								type="checkbox"
								name="published"
								id="published"
								checked={data.blog?.published || false}
								class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
							/>
							<label for="published" class="ml-2 text-sm text-gray-700">
								Publish immediately
							</label>
						</div>

						<div class="flex items-center">
							<input
								type="checkbox"
								name="featured"
								id="featured"
								checked={data.blog?.featured || false}
								class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
							/>
							<label for="featured" class="ml-2 flex items-center text-sm text-gray-700">
								<Star class="mr-1 h-3 w-3" />
								Featured post
							</label>
						</div>

						<div>
							<label for="readingTime" class="mb-1 block text-sm font-medium text-gray-700">
								Reading Time (minutes)
							</label>
							<input
								type="number"
								name="readingTime"
								id="readingTime"
								min="1"
								value={data.blog?.readingTime || estimatedReadingTime}
								class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2"
								placeholder="Auto-calculated"
							/>
						</div>
					</div>
				</div>

				<div class="card p-6">
					<ImageUpload
						label="Featured Image"
						currentImageUrl={featuredImageUrl}
						folder={folderPath}
						multiple={false}
						maxSize={10}
						on:upload={handleFeaturedImageUpload}
						on:remove={handleFeaturedImageRemove}
						on:error={handleImageError}
					/>
					<input type="hidden" name="imageUrl" bind:value={featuredImageUrl} />
					<input type="hidden" name="imagePublicId" bind:value={featuredImagePublicId} />
					{#if featuredImageSizes.medium}
						<input type="hidden" name="imageSizes" value={JSON.stringify(featuredImageSizes)} />
					{/if}
				</div>

				<div class="card p-6">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Additional Images</h3>

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
				</div>

				<div class="card p-6">
					<h3 class="mb-4 flex items-center text-lg font-medium text-gray-900">
						<Tag class="mr-2 h-5 w-5" />
						Tags
						<span class="ml-2 text-xs text-gray-500">({selectedTags.length} selected)</span>
					</h3>

					<div class="mb-4">
						<input
							type="text"
							bind:value={tagSearchQuery}
							placeholder="Search tags..."
							on:keydown={handleTagKeydown}
							class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2"
						/>
					</div>

					{#if tagSuccess}
						<div
							class="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-600"
						>
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
										class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
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
										<span class="text-primary text-xs">✓</span>
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
									on:click={() => {
										showNewTagInput = false;
										newTagName = '';
										newTagIsTech = false;
										tagError = '';
										tagSuccess = '';
										isAddingTag = false;
									}}
									class="text-blue-600 hover:text-blue-800"
									disabled={isAddingTag}
								>
									<X class="h-4 w-4" />
								</button>
							</div>

							<form
								bind:this={tagForm}
								method="POST"
								action="?/createTag"
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
							on:click={() => {
								showNewTagInput = true;
								tagError = '';
								tagSuccess = '';
								isAddingTag = false;
							}}
							class="text-primary border-primary hover:bg-primary/5 mt-4 flex w-full items-center justify-center rounded-lg border border-dashed px-3 py-2 text-sm transition-colors"
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
									{@const tag = data.tags.find((t) => t.id === tagId)}
									{#if tag}
										<span
											class="bg-primary/10 text-primary inline-flex items-center rounded px-2 py-1 text-xs"
										>
											{tag.name}
											<button
												type="button"
												on:click={() => toggleTag(tagId)}
												class="text-primary/70 hover:text-primary ml-1"
											>
												<X class="h-3 w-3" />
											</button>
										</span>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					{#each selectedTags as tagId}
						<input type="hidden" name="tagIds" value={tagId} />
					{/each}
				</div>

				<div class="card p-6">
					<div class="space-y-3">
						<button
							type="button"
							on:click={handleSubmit}
							disabled={isSubmitting || isFormLoading}
							class="btn-primary flex w-full items-center justify-center disabled:opacity-50"
						>
							{#if isSubmitting || isFormLoading}
								<Loader class="mr-2 h-4 w-4 animate-spin" />
								{isSubmitting ? 'Saving...' : 'Loading...'}
							{:else}
								<Save class="mr-2 h-4 w-4" />
								{isEditing ? 'Update' : 'Create'} Blog Post
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
				<p class="text-sm text-green-600">✅ {form.message || 'Blog post saved successfully!'}</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-600">❌ {form.error}</p>
			</div>
		{/if}
	</form>

	<form method="POST" action="?/createTag" style="display: none;" id="tagForm">
		<input type="text" name="tagName" bind:value={newTagName} />
		<input type="checkbox" name="isTech" bind:checked={newTagIsTech} />
	</form>
</div>
