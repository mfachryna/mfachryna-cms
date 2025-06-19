<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Upload, X, Image, Loader, Plus, Trash2 } from 'lucide-svelte';

	export let currentImageUrl: string = '';
	export let currentImages: Array<{ url: string; publicId: string }> = [];
	export let label: string = 'Upload Image';
	export let accept: string = 'image/*';
	export let folder: string = '';
	export let multiple: boolean = false;
	export let maxSize: number = 10;
	export let maxFiles: number = 10;
	export let disabled: boolean = false;
	export let enableDelete: boolean = true;

	const dispatch = createEventDispatcher<{
		upload: {
			url: string;
			publicId: string;
			sizes: any;
			metadata: any;
		};
		uploadMultiple: {
			images: Array<{
				url: string;
				publicId: string;
				sizes: any;
				metadata: any;
			}>;
		};
		remove: { url: string; publicId: string };
		removeMultiple: { index: number; url: string; publicId: string };
		error: { message: string };
	}>();

	let isUploading = false;
	let isDeleting = false;
	let dragOver = false;
	let fileInput: HTMLInputElement;
	let uploadProgress: string = '';

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files && files.length > 0) {
			await uploadFiles(Array.from(files));
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			await uploadFiles(Array.from(files));
		}
	}

	async function uploadFiles(files: File[]) {
		if (disabled) return;

		if (multiple && currentImages.length + files.length > maxFiles) {
			dispatch('error', {
				message: `Cannot upload more than ${maxFiles} files. Currently have ${currentImages.length} files.`
			});
			return;
		}

		if (!multiple && files.length > 1) {
			dispatch('error', {
				message: 'Only one file is allowed for single upload.'
			});
			return;
		}

		const uploadedImages: Array<{
			url: string;
			publicId: string;
			sizes: any;
			metadata: any;
		}> = [];

		isUploading = true;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			uploadProgress = multiple ? `Uploading ${i + 1} of ${files.length}...` : 'Uploading...';

			if (file.size > maxSize * 1024 * 1024) {
				dispatch('error', {
					message: `File ${file.name} is too large. Max size is ${maxSize}MB.`
				});
				continue;
			}

			if (!file.type.startsWith('image/')) {
				dispatch('error', {
					message: `File ${file.name} is not a valid image.`
				});
				continue;
			}

			try {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('folder', folder);

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Upload failed');
				}

				const result = await response.json();

				const uploadedImage = {
					url: result.secure_url,
					publicId: result.public_id,
					sizes: result.sizes,
					metadata: result.original
				};

				if (multiple) {
					uploadedImages.push(uploadedImage);
				} else {
					dispatch('upload', uploadedImage);
				}
			} catch (error) {
				console.error('Upload error:', error);
				dispatch('error', {
					message: `Failed to upload ${file.name}: ${error.message}`
				});
			}
		}

		if (multiple && uploadedImages.length > 0) {
			dispatch('uploadMultiple', { images: uploadedImages });
		}

		isUploading = false;
		uploadProgress = '';

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
	}

	async function removeImage() {
		if (!enableDelete || isDeleting) return;

		try {
			isDeleting = true;

			const publicId = extractPublicIdFromUrl(currentImageUrl);

			if (publicId) {
				const response = await fetch('/api/upload', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ publicId })
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to delete image');
				}
			}

			dispatch('remove', { url: currentImageUrl, publicId });
		} catch (error) {
			console.error('❌ Delete error:', error);
			dispatch('error', {
				message: `Failed to delete image: ${error.message}`
			});
		} finally {
			isDeleting = false;
		}
	}

	async function removeMultipleImage(index: number) {
		if (!enableDelete || isDeleting) return;

		const image = currentImages[index];
		if (!image) return;

		try {
			isDeleting = true;

			const response = await fetch('/api/upload', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicId: image.publicId })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete image');
			}

			dispatch('removeMultiple', {
				index,
				url: image.url,
				publicId: image.publicId
			});
		} catch (error) {
			console.error('❌ Delete error:', error);
			dispatch('error', {
				message: `Failed to delete image: ${error.message}`
			});
		} finally {
			isDeleting = false;
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

<div class="space-y-4">
	<label class="block text-sm font-medium text-gray-700">
		{label}
		{#if multiple}
			<span class="ml-1 text-xs text-gray-500">
				({currentImages.length}/{maxFiles} files)
			</span>
		{/if}
	</label>

	{#if !multiple && currentImageUrl}
		<div class="group relative inline-block">
			<img src={currentImageUrl} alt="Uploaded" class="h-32 w-32 rounded-lg border object-cover" />
			{#if enableDelete}
				<button
					type="button"
					on:click={removeImage}
					disabled={isUploading || isDeleting}
					class="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
					title="Delete image from Cloudinary"
				>
					{#if isDeleting}
						<Loader class="h-3 w-3 animate-spin" />
					{:else}
						<Trash2 class="h-3 w-3" />
					{/if}
				</button>
			{/if}
		</div>
	{/if}

	{#if multiple && currentImages.length > 0}
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each currentImages as image, index}
				<div class="group relative">
					<img
						src={image.url}
						alt="Uploaded {index + 1}"
						class="h-24 w-full rounded-lg border object-cover"
					/>
					{#if enableDelete}
						<button
							type="button"
							on:click={() => removeMultipleImage(index)}
							disabled={isUploading || isDeleting}
							class="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
							title="Delete image from Cloudinary"
						>
							{#if isDeleting}
								<Loader class="h-2 w-2 animate-spin" />
							{:else}
								<Trash2 class="h-2 w-2" />
							{/if}
						</button>
					{/if}
					<div
						class="bg-opacity-50 absolute right-1 bottom-1 rounded bg-black px-1 text-xs text-white"
					>
						{index + 1}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div
		class="rounded-lg border-2 border-dashed p-6 text-center transition-colors {dragOver
			? 'border-primary bg-primary/5'
			: 'border-gray-300'} {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer hover:border-gray-400'}"
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
		on:click={() => !disabled && !isUploading && fileInput.click()}
	>
		{#if isUploading}
			<div class="flex flex-col items-center">
				<Loader class="text-primary mb-2 h-8 w-8 animate-spin" />
				<p class="text-sm text-gray-600">{uploadProgress}</p>
			</div>
		{:else}
			<div class="flex flex-col items-center">
				{#if multiple}
					<Plus class="mb-2 h-8 w-8 text-gray-400" />
					<p class="text-sm text-gray-600">
						{currentImages.length > 0 ? 'Add more images' : 'Click to upload or drag and drop'}
					</p>
					<p class="mt-1 text-xs text-gray-500">
						Select multiple files (Max: {maxFiles} files, {maxSize}MB each)
					</p>
				{:else}
					{#if currentImageUrl}
						<Image class="mb-2 h-8 w-8 text-gray-400" />
						<p class="text-sm text-gray-600">Click or drag to replace image</p>
					{:else}
						<Upload class="mb-2 h-8 w-8 text-gray-400" />
						<p class="text-sm text-gray-600">Click to upload or drag and drop</p>
					{/if}
					<p class="mt-1 text-xs text-gray-500">
						Max file size: {maxSize}MB
					</p>
				{/if}
			</div>
		{/if}
	</div>

	<input
		type="file"
		bind:this={fileInput}
		on:change={handleFileSelect}
		{accept}
		{multiple}
		disabled={disabled || isUploading}
		class="hidden"
	/>
</div>
