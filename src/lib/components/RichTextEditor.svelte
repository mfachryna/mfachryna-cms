<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Bold,
		Italic,
		Underline,
		Strikethrough,
		Link,
		List,
		ListOrdered,
		Quote,
		Image,
		Code,
		Code2,
		Undo,
		Redo,
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignJustify,
		Upload,
		Clipboard,
		Loader,
		Type,
		Palette,
		Highlighter,
		Table,
		Minus,
		MoreHorizontal,
		ChevronDown,
		Youtube,
		Link2,
		Subscript,
		Superscript
	} from 'lucide-svelte';

	export let content = '';
	export let placeholder = 'Start writing...';
	export let folder = 'editor';

	let editor: any;
	let editorElement: HTMLElement;
	let showImageDialog = false;
	let showLinkDialog = false;
	let showTableDialog = false;
	let showVideoDialog = false;
	let showColorPicker = false;
	let showHighlightPicker = false;

	let imageUrl = '';
	let linkUrl = '';
	let linkText = '';
	let videoUrl = '';
	let isUploading = false;
	let uploadProgress = '';
	let fileInput: HTMLInputElement;

	let currentFontSize = '16';
	let currentLineHeight = '1.6';
	let currentTextColor = '#000000';
	let currentHighlightColor = '#ffff00';

	const fontSizes = [
		{ label: 'Tiny', value: '12' },
		{ label: 'Small', value: '14' },
		{ label: 'Normal', value: '16' },
		{ label: 'Large', value: '18' },
		{ label: 'Huge', value: '24' },
		{ label: 'Giant', value: '32' }
	];

	const lineHeights = [
		{ label: 'Tight', value: '1.25' },
		{ label: 'Normal', value: '1.5' },
		{ label: 'Relaxed', value: '1.75' },
		{ label: 'Loose', value: '2' }
	];

	const headingLevels = [
		{ label: 'Paragraph', value: 'paragraph' },
		{ label: 'Heading 1', value: 'heading', level: 1 },
		{ label: 'Heading 2', value: 'heading', level: 2 },
		{ label: 'Heading 3', value: 'heading', level: 3 },
		{ label: 'Heading 4', value: 'heading', level: 4 },
		{ label: 'Heading 5', value: 'heading', level: 5 },
		{ label: 'Heading 6', value: 'heading', level: 6 }
	];

	const colors = [
		'#000000',
		'#374151',
		'#6B7280',
		'#9CA3AF',
		'#EF4444',
		'#F97316',
		'#EAB308',
		'#22C55E',
		'#3B82F6',
		'#8B5CF6',
		'#EC4899',
		'#F43F5E'
	];

	const highlightColors = [
		'#FEF3C7',
		'#FEE2E2',
		'#DBEAFE',
		'#D1FAE5',
		'#E0E7FF',
		'#F3E8FF',
		'#FCE7F3',
		'#FFEDD5'
	];

	onMount(async () => {
		const { Editor } = await import('@tiptap/core');
		const { StarterKit } = await import('@tiptap/starter-kit');
		const { Image } = await import('@tiptap/extension-image');
		const { Link } = await import('@tiptap/extension-link');
		const { Placeholder } = await import('@tiptap/extension-placeholder');
		const { TextAlign } = await import('@tiptap/extension-text-align');
		const { Underline } = await import('@tiptap/extension-underline');
		const { TextStyle } = await import('@tiptap/extension-text-style');
		const { Color } = await import('@tiptap/extension-color');
		const { Highlight } = await import('@tiptap/extension-highlight');
		const { FontFamily } = await import('@tiptap/extension-font-family');
		const { Subscript } = await import('@tiptap/extension-subscript');
		const { Superscript } = await import('@tiptap/extension-superscript');
		const { Table } = await import('@tiptap/extension-table');
		const { TableRow } = await import('@tiptap/extension-table-row');
		const { TableHeader } = await import('@tiptap/extension-table-header');
		const { TableCell } = await import('@tiptap/extension-table-cell');
		const { Youtube } = await import('@tiptap/extension-youtube');
		const { Extension } = await import('@tiptap/core');

		const FontSize = Extension.create({
			name: 'fontSize',

			addOptions() {
				return {
					types: ['textStyle']
				};
			},

			addGlobalAttributes() {
				return [
					{
						types: this.options.types,
						attributes: {
							fontSize: {
								default: null,
								parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ''),
								renderHTML: (attributes) => {
									if (!attributes.fontSize) {
										return {};
									}
									return {
										style: `font-size: ${attributes.fontSize}px`
									};
								}
							}
						}
					}
				];
			},

			addCommands() {
				return {
					setFontSize:
						(fontSize) =>
						({ chain }) => {
							return chain().setMark('textStyle', { fontSize }).run();
						},
					unsetFontSize:
						() =>
						({ chain }) => {
							return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
						}
				};
			}
		});

		const LineHeight = Extension.create({
			name: 'lineHeight',

			addOptions() {
				return {
					types: ['heading', 'paragraph']
				};
			},

			addGlobalAttributes() {
				return [
					{
						types: this.options.types,
						attributes: {
							lineHeight: {
								default: null,
								parseHTML: (element) => element.style.lineHeight || null,
								renderHTML: (attributes) => {
									if (!attributes.lineHeight) {
										return {};
									}
									return {
										style: `line-height: ${attributes.lineHeight}`
									};
								}
							}
						}
					}
				];
			},

			addCommands() {
				return {
					setLineHeight:
						(lineHeight) =>
						({ tr, state, dispatch }) => {
							const { selection } = state;
							const { from, to } = selection;

							tr.doc.nodesBetween(from, to, (node, pos) => {
								if (this.options.types.includes(node.type.name)) {
									tr.setNodeMarkup(pos, undefined, {
										...node.attrs,
										lineHeight
									});
								}
							});

							if (dispatch) dispatch(tr);
							return true;
						},
					unsetLineHeight:
						() =>
						({ tr, state, dispatch }) => {
							const { selection } = state;
							const { from, to } = selection;

							tr.doc.nodesBetween(from, to, (node, pos) => {
								if (this.options.types.includes(node.type.name)) {
									tr.setNodeMarkup(pos, undefined, {
										...node.attrs,
										lineHeight: null
									});
								}
							});

							if (dispatch) dispatch(tr);
							return true;
						}
				};
			}
		});

		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6]
					}
				}),
				Image.configure({
					HTMLAttributes: {
						class: 'max-w-full h-auto rounded-lg shadow-sm my-4 cursor-pointer'
					},
					allowBase64: true
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-blue-600 underline hover:text-blue-800'
					}
				}),
				Placeholder.configure({
					placeholder
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph']
				}),
				Underline,
				TextStyle,
				Color.configure({
					types: ['textStyle']
				}),
				Highlight.configure({
					multicolor: true
				}),
				FontFamily.configure({
					types: ['textStyle']
				}),
				FontSize,
				LineHeight,
				Subscript,
				Superscript,
				Table.configure({
					resizable: true
				}),
				TableRow,
				TableHeader,
				TableCell,
				Youtube.configure({
					controls: false,
					nocookie: true
				})
			],
			content,
			onUpdate: ({ editor }) => {
				content = editor.getHTML();
				updateCurrentStyles();
			},
			onSelectionUpdate: ({ editor }) => {
				updateCurrentStyles();
			},
			editorProps: {
				attributes: {
					class: 'prose max-w-none focus:outline-none min-h-[400px] p-4'
				},
				handlePaste: (view, event, slice) => {
					const items = Array.from(event.clipboardData?.items || []);

					for (const item of items) {
						if (item.type.indexOf('image') === 0) {
							event.preventDefault();
							const file = item.getAsFile();
							if (file) {
								handleImageUpload(file);
							}
							return true;
						}
					}

					return false;
				},
				handleDrop: (view, event, slice, moved) => {
					const files = Array.from(event.dataTransfer?.files || []);
					const imageFiles = files.filter((file) => file.type.startsWith('image/'));

					if (imageFiles.length > 0) {
						event.preventDefault();
						imageFiles.forEach((file) => handleImageUpload(file));
						return true;
					}

					return false;
				},
				handleClick: (view, pos, event) => {
					const target = event.target as HTMLElement;
					if (target.tagName === 'IMG') {
						event.preventDefault();
						handleImageClick(target as HTMLImageElement);
						return true;
					}
					return false;
				},
				handleKeyDown: (view, event) => {
					if (event.key === 'Delete' || event.key === 'Backspace') {
						const { state } = view;
						const { selection } = state;

						if (selection.node && selection.node.type.name === 'image') {
							const imageUrl = selection.node.attrs.src;
							const publicId = extractPublicIdFromUrl(imageUrl);

							if (publicId && !imageUrl.startsWith('data:')) {
								deleteImageFromCloudinary(publicId);
							}

							return false;
						}
					}
					return false;
				}
			}
		});

		if (editorElement) {
			editorElement.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
		if (editorElement) {
			editorElement.removeEventListener('keydown', handleKeydown);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
			event.preventDefault();
			showImageDialog = true;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			showLinkDialog = true;
		}
	}

	function updateCurrentStyles() {
		if (!editor) return;

		const textStyleAttrs = editor.getAttributes('textStyle');
		currentFontSize = textStyleAttrs.fontSize || '16';
		currentTextColor = textStyleAttrs.color || '#000000';

		const { selection } = editor.state;
		const { $from } = selection;
		const node = $from.node($from.depth);

		if (node && ['paragraph', 'heading'].includes(node.type.name)) {
			currentLineHeight = node.attrs.lineHeight || '1.6';
		}
	}

	function setFontSize(size: string) {
		if (editor) {
			editor.chain().focus().setFontSize(size).run();
			currentFontSize = size;
		}
	}

	function setLineHeight(height: string) {
		if (editor) {
			editor.chain().focus().setLineHeight(height).run();
			currentLineHeight = height;
		}
	}

	function setTextColor(color: string) {
		if (editor) {
			editor.chain().focus().setColor(color).run();
			currentTextColor = color;
			showColorPicker = false;
		}
	}

	function setHighlight(color: string) {
		if (editor) {
			editor.chain().focus().setHighlight({ color }).run();
			currentHighlightColor = color;
			showHighlightPicker = false;
		}
	}

	function setHeading(type: string, level?: number) {
		if (!editor) return;

		if (type === 'paragraph') {
			editor.chain().focus().setParagraph().run();
		} else if (type === 'heading' && level) {
			editor.chain().focus().setHeading({ level }).run();
		}
	}

	function insertTable() {
		if (editor) {
			editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
			showTableDialog = false;
		}
	}

	function addColumnBefore() {
		if (editor) {
			editor.chain().focus().addColumnBefore().run();
		}
	}

	function addColumnAfter() {
		if (editor) {
			editor.chain().focus().addColumnAfter().run();
		}
	}

	function deleteColumn() {
		if (editor) {
			editor.chain().focus().deleteColumn().run();
		}
	}

	function addRowBefore() {
		if (editor) {
			editor.chain().focus().addRowBefore().run();
		}
	}

	function addRowAfter() {
		if (editor) {
			editor.chain().focus().addRowAfter().run();
		}
	}

	function deleteRow() {
		if (editor) {
			editor.chain().focus().deleteRow().run();
		}
	}

	function deleteTable() {
		if (editor) {
			editor.chain().focus().deleteTable().run();
		}
	}

	function insertVideo() {
		if (videoUrl && editor) {
			editor
				.chain()
				.focus()
				.setYoutubeVideo({
					src: videoUrl,
					width: 640,
					height: 480
				})
				.run();
			videoUrl = '';
			showVideoDialog = false;
		}
	}

	function setLink() {
		if (linkUrl && editor) {
			if (linkText) {
				editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
			} else {
				editor.chain().focus().setLink({ href: linkUrl }).run();
			}
			linkUrl = '';
			linkText = '';
			showLinkDialog = false;
		}
	}

	function insertImage() {
		if (imageUrl && editor) {
			editor.chain().focus().setImage({ src: imageUrl }).run();
			imageUrl = '';
			showImageDialog = false;
		}
	}

	function insertHorizontalRule() {
		if (editor) {
			editor.chain().focus().setHorizontalRule().run();
		}
	}

	function handleImageClick(imgElement: HTMLImageElement) {
		const rect = imgElement.getBoundingClientRect();

		const deleteOverlay = document.createElement('div');
		deleteOverlay.className =
			'fixed z-50 bg-red-500 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-red-600 transition-colors';
		deleteOverlay.style.top = `${rect.top + window.scrollY - 10}px`;
		deleteOverlay.style.left = `${rect.right + window.scrollX - 10}px`;
		deleteOverlay.innerHTML = `
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    `;

		document.body.appendChild(deleteOverlay);

		deleteOverlay.addEventListener('click', async () => {
			if (confirm('Delete this image?')) {
				try {
					const imageUrl = imgElement.src;
					const publicId = extractPublicIdFromUrl(imageUrl);

					if (publicId && !imageUrl.startsWith('data:')) {
						await deleteImageFromCloudinary(publicId);
					}

					const { state } = editor.view;
					const pos = editor.view.posAtDOM(imgElement, 0);
					const $pos = state.doc.resolve(pos);
					const node = $pos.nodeAfter;

					if (node) {
						const tr = state.tr.delete(pos, pos + node.nodeSize);
						editor.view.dispatch(tr);
					}
				} catch (error) {
					console.error('Failed to delete image:', error);
					alert('Failed to delete image');
				}
			}

			deleteOverlay.remove();
		});

		function handleClickOutside(event: MouseEvent) {
			if (!deleteOverlay.contains(event.target as Node) && event.target !== imgElement) {
				deleteOverlay.remove();
				document.removeEventListener('click', handleClickOutside);
			}
		}

		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);

		setTimeout(() => {
			if (deleteOverlay.parentNode) {
				deleteOverlay.remove();
				document.removeEventListener('click', handleClickOutside);
			}
		}, 5000);
	}

	function extractPublicIdFromUrl(url: string): string {
		if (!url || url.startsWith('data:')) return '';

		try {
			const urlParts = url.split('/');
			const uploadIndex = urlParts.findIndex((part) => part === 'upload');

			if (uploadIndex === -1) return '';

			const afterUpload = urlParts.slice(uploadIndex + 1);
			const publicIdParts = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;

			return publicIdParts.join('/').replace(/\.[^/.]+$/, '');
		} catch (error) {
			console.error('Error extracting public ID:', error);
			return '';
		}
	}

	async function deleteImageFromCloudinary(publicId: string) {
		try {
			const response = await fetch('/api/upload', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicId })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete image');
			}

			const result = await response.json();
		} catch (error) {
			console.error('❌ Failed to delete image from Cloudinary:', error);
		}
	}

	function createImagePreview(file: File): Promise<string> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				resolve(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		});
	}

	async function handleImageUpload(file: File) {
		if (!file || !file.type.startsWith('image/')) {
			alert('Please select a valid image file');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			alert('Image file is too large. Maximum size is 10MB.');
			return;
		}

		const tempImageId = `temp-${Date.now()}`;

		try {
			const previewUrl = await createImagePreview(file);
			if (editor) {
				editor
					.chain()
					.focus()
					.setImage({
						src: previewUrl,
						alt: file.name,
						'data-temp-id': tempImageId,
						class: 'max-w-full h-auto rounded-lg shadow-sm my-4 opacity-75 relative cursor-pointer'
					})
					.run();

				setTimeout(() => {
					const imgElement = document.querySelector(`img[data-temp-id="${tempImageId}"]`);
					if (imgElement) {
						const overlay = document.createElement('div');
						overlay.className =
							'absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg';
						overlay.innerHTML = `
              <div class="bg-white rounded-full p-2 shadow-lg">
                <svg class="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            `;

						const parent = imgElement.parentElement;
						if (parent) {
							parent.style.position = 'relative';
							parent.style.display = 'inline-block';
							parent.appendChild(overlay);
						}
					}
				}, 50);
			}

			isUploading = true;
			uploadProgress = 'Uploading image...';

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

			setTimeout(() => {
				const imgElement = document.querySelector(
					`img[data-temp-id="${tempImageId}"]`
				) as HTMLImageElement;
				if (imgElement) {
					const overlay = imgElement.parentElement?.querySelector('div');
					if (overlay) {
						overlay.remove();
					}

					imgElement.src = result.secure_url;
					imgElement.removeAttribute('data-temp-id');
					imgElement.classList.remove('opacity-75');
					imgElement.classList.add('opacity-100');

					const successOverlay = document.createElement('div');
					successOverlay.className =
						'absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg';
					successOverlay.innerHTML = `
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          `;

					const parent = imgElement.parentElement;
					if (parent) {
						parent.appendChild(successOverlay);

						setTimeout(() => {
							successOverlay.remove();
						}, 2000);
					}
				}
			}, 100);

			uploadProgress = 'Image uploaded successfully!';

			setTimeout(() => {
				uploadProgress = '';
			}, 2000);
		} catch (error) {
			console.error('Upload error:', error);

			const imgElement = document.querySelector(`img[data-temp-id="${tempImageId}"]`);
			if (imgElement && imgElement.parentElement) {
				imgElement.parentElement.remove();
			}

			alert(`Failed to upload image: ${error.message}`);
			uploadProgress = '';
		} finally {
			isUploading = false;
		}
	}

	async function uploadImageFromFile(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (!files?.length) return;

		for (const file of Array.from(files)) {
			await handleImageUpload(file);
		}

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function triggerFileUpload() {
		fileInput?.click();
	}

	async function pasteFromClipboard() {
		try {
			const clipboardItems = await navigator.clipboard.read();

			for (const clipboardItem of clipboardItems) {
				for (const type of clipboardItem.types) {
					if (type.startsWith('image/')) {
						const blob = await clipboardItem.getType(type);
						const file = new File([blob], 'pasted-image.png', { type });
						await handleImageUpload(file);
						return;
					}
				}
			}

			alert('No image found in clipboard');
		} catch (error) {
			console.error('Clipboard error:', error);
			alert('Failed to access clipboard. Try pasting directly with Ctrl+V');
		}
	}

	$: isActive = (name: string, attrs?: any) => {
		if (!editor) return false;
		if (attrs) {
			return editor.isActive(name, attrs);
		}
		return editor.isActive(name);
	};
</script>

<div class="overflow-hidden rounded-lg border border-gray-300">
	<div class="border-b border-gray-300 bg-gray-50 p-3">
		<div class="flex flex-wrap items-center gap-1">
			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<div class="group relative">
					<button
						type="button"
						class="flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-100"
					>
						<Type class="mr-1 h-4 w-4" />
						Heading
						<ChevronDown class="ml-1 h-3 w-3" />
					</button>
					<div
						class="invisible absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-gray-300 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100"
					>
						{#each headingLevels as heading}
							<button
								type="button"
								on:click={() => setHeading(heading.value, heading.level)}
								class="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 {heading.value ===
									'paragraph' && isActive('paragraph')
									? 'bg-blue-50 text-blue-600'
									: heading.value === 'heading' && isActive('heading', { level: heading.level })
										? 'bg-blue-50 text-blue-600'
										: ''}"
							>
								{heading.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="group relative ml-2">
					<button
						type="button"
						class="flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-100"
					>
						{currentFontSize}px
						<ChevronDown class="ml-1 h-3 w-3" />
					</button>
					<div
						class="invisible absolute top-full left-0 z-10 mt-1 w-24 rounded-lg border border-gray-300 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100"
					>
						{#each fontSizes as size}
							<button
								type="button"
								on:click={() => setFontSize(size.value)}
								class="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 {currentFontSize ===
								size.value
									? 'bg-blue-50 text-blue-600'
									: ''}"
							>
								{size.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="group relative ml-2">
					<button
						type="button"
						class="flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-100"
					>
						LH
						<ChevronDown class="ml-1 h-3 w-3" />
					</button>
					<div
						class="invisible absolute top-full left-0 z-10 mt-1 w-32 rounded-lg border border-gray-300 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100"
					>
						{#each lineHeights as height}
							<button
								type="button"
								on:click={() => setLineHeight(height.value)}
								class="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 {currentLineHeight ===
								height.value
									? 'bg-blue-50 text-blue-600'
									: ''}"
							>
								{height.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleBold().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('bold')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Bold (Ctrl+B)"
				>
					<Bold class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleItalic().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('italic')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Italic (Ctrl+I)"
				>
					<Italic class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleUnderline().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('underline')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Underline (Ctrl+U)"
				>
					<Underline class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleStrike().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('strike')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Strikethrough"
				>
					<Strikethrough class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleSubscript().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('subscript')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Subscript"
				>
					<Subscript class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleSuperscript().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('superscript')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Superscript"
				>
					<Superscript class="h-4 w-4" />
				</button>
			</div>

			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<div class="relative">
					<button
						type="button"
						on:click={() => (showColorPicker = !showColorPicker)}
						class="rounded p-2 transition-colors hover:bg-gray-200"
						title="Text Color"
					>
						<div class="flex flex-col items-center">
							<Palette class="h-4 w-4" />
							<div
								class="mt-0.5 h-1 w-4 rounded"
								style="background-color: {currentTextColor}"
							></div>
						</div>
					</button>
					{#if showColorPicker}
						<div
							class="absolute top-full left-0 z-20 mt-2 rounded-lg border border-gray-300 bg-white p-3 shadow-lg"
						>
							<div class="mb-3 grid grid-cols-4 gap-2">
								{#each colors as color}
									<button
										type="button"
										on:click={() => setTextColor(color)}
										class="h-6 w-6 rounded border border-gray-300 transition-transform hover:scale-110"
										style="background-color: {color}"
										title={color}
									></button>
								{/each}
							</div>
							<input
								type="color"
								bind:value={currentTextColor}
								on:change={(e) => setTextColor(e.target.value)}
								class="h-8 w-full rounded border border-gray-300"
							/>
						</div>
					{/if}
				</div>

				<div class="relative">
					<button
						type="button"
						on:click={() => (showHighlightPicker = !showHighlightPicker)}
						class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('highlight')
							? 'bg-blue-200 text-blue-800'
							: ''}"
						title="Highlight"
					>
						<div class="flex flex-col items-center">
							<Highlighter class="h-4 w-4" />
							<div
								class="mt-0.5 h-1 w-4 rounded"
								style="background-color: {currentHighlightColor}"
							></div>
						</div>
					</button>
					{#if showHighlightPicker}
						<div
							class="absolute top-full left-0 z-20 mt-2 rounded-lg border border-gray-300 bg-white p-3 shadow-lg"
						>
							<div class="mb-3 grid grid-cols-4 gap-2">
								{#each highlightColors as color}
									<button
										type="button"
										on:click={() => setHighlight(color)}
										class="h-6 w-6 rounded border border-gray-300 transition-transform hover:scale-110"
										style="background-color: {color}"
										title={color}
									></button>
								{/each}
							</div>
							<button
								type="button"
								on:click={() => editor?.chain().focus().unsetHighlight().run()}
								class="w-full rounded bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200"
							>
								Remove Highlight
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleBulletList().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('bulletList')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Bullet List"
				>
					<List class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleOrderedList().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('orderedList')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Numbered List"
				>
					<ListOrdered class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleBlockquote().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('blockquote')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Quote"
				>
					<Quote class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleCodeBlock().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('codeBlock')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Code Block"
				>
					<Code2 class="h-4 w-4" />
				</button>
			</div>

			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<button
					type="button"
					on:click={() => editor?.chain().focus().setTextAlign('left').run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive({ textAlign: 'left' })
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Align Left"
				>
					<AlignLeft class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().setTextAlign('center').run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive({ textAlign: 'center' })
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Align Center"
				>
					<AlignCenter class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().setTextAlign('right').run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive({ textAlign: 'right' })
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Align Right"
				>
					<AlignRight class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().setTextAlign('justify').run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive({ textAlign: 'justify' })
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Justify"
				>
					<AlignJustify class="h-4 w-4" />
				</button>
			</div>

			<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
				<button
					type="button"
					on:click={triggerFileUpload}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Upload Image"
					disabled={isUploading}
				>
					{#if isUploading}
						<Loader class="h-4 w-4 animate-spin" />
					{:else}
						<Upload class="h-4 w-4" />
					{/if}
				</button>
				<button
					type="button"
					on:click={pasteFromClipboard}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Paste Image from Clipboard"
					disabled={isUploading}
				>
					<Clipboard class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => (showImageDialog = true)}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Insert Image URL"
				>
					<Image class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => (showLinkDialog = true)}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('link')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Insert Link (Ctrl+K)"
				>
					<Link2 class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => (showVideoDialog = true)}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Insert YouTube Video"
				>
					<Youtube class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => (showTableDialog = true)}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Insert Table"
				>
					<Table class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={insertHorizontalRule}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Horizontal Rule"
				>
					<Minus class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().toggleCode().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200 {isActive('code')
						? 'bg-blue-200 text-blue-800'
						: ''}"
					title="Inline Code"
				>
					<Code class="h-4 w-4" />
				</button>
			</div>

			{#if isActive('table')}
				<div class="mr-3 flex items-center border-r border-gray-300 pr-3">
					<div class="group relative">
						<button
							type="button"
							class="flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-100"
						>
							<Table class="mr-1 h-4 w-4" />
							Table
							<ChevronDown class="ml-1 h-3 w-3" />
						</button>
						<div
							class="invisible absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-gray-300 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100"
						>
							<button
								type="button"
								on:click={addColumnBefore}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
								>Add Column Before</button
							>
							<button
								type="button"
								on:click={addColumnAfter}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
								>Add Column After</button
							>
							<button
								type="button"
								on:click={deleteColumn}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Delete Column</button
							>
							<button
								type="button"
								on:click={addRowBefore}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Add Row Before</button
							>
							<button
								type="button"
								on:click={addRowAfter}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Add Row After</button
							>
							<button
								type="button"
								on:click={deleteRow}
								class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Delete Row</button
							>
							<hr class="my-1" />
							<button
								type="button"
								on:click={deleteTable}
								class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-100"
								>Delete Table</button
							>
						</div>
					</div>
				</div>
			{/if}

			<div class="flex items-center">
				<button
					type="button"
					on:click={() => editor?.chain().focus().undo().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Undo (Ctrl+Z)"
				>
					<Undo class="h-4 w-4" />
				</button>
				<button
					type="button"
					on:click={() => editor?.chain().focus().redo().run()}
					class="rounded p-2 transition-colors hover:bg-gray-200"
					title="Redo (Ctrl+Y)"
				>
					<Redo class="h-4 w-4" />
				</button>
			</div>
		</div>

		{#if uploadProgress}
			<div class="mt-2 flex items-center text-xs text-blue-600">
				{#if isUploading}
					<Loader class="mr-1 h-3 w-3 animate-spin" />
				{:else}
					<span class="text-green-600">✓</span>
				{/if}
				{uploadProgress}
			</div>
		{/if}
	</div>

	<div bind:this={editorElement} class="relative min-h-[400px] bg-white">
		<div
			class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
			id="drop-zone"
		>
			<div
				class="flex h-full items-center justify-center border-4 border-dashed border-blue-400 bg-blue-50"
			>
				<div class="text-center">
					<Upload class="mx-auto mb-2 h-12 w-12 text-blue-500" />
					<p class="font-medium text-blue-600">Drop images here to upload</p>
				</div>
			</div>
		</div>
	</div>
</div>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	on:change={uploadImageFromFile}
	class="hidden"
	multiple
/>

{#if showLinkDialog}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h3 class="mb-4 text-lg font-semibold">Insert Link</h3>

			<div class="space-y-4">
				<div>
					<label class="mb-2 block text-sm font-medium text-gray-700">URL</label>
					<input
						type="url"
						bind:value={linkUrl}
						placeholder="https://example.com"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium text-gray-700">Link Text (optional)</label>
					<input
						type="text"
						bind:value={linkText}
						placeholder="Link text"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={() => {
						showLinkDialog = false;
						linkUrl = '';
						linkText = '';
					}}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={setLink}
					disabled={!linkUrl}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					Insert Link
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showVideoDialog}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h3 class="mb-4 text-lg font-semibold">Insert YouTube Video</h3>

			<div class="space-y-4">
				<div>
					<label class="mb-2 block text-sm font-medium text-gray-700">YouTube URL</label>
					<input
						type="url"
						bind:value={videoUrl}
						placeholder="https://www.youtube.com/watch?v=..."
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={() => {
						showVideoDialog = false;
						videoUrl = '';
					}}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={insertVideo}
					disabled={!videoUrl}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					Insert Video
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showTableDialog}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h3 class="mb-4 text-lg font-semibold">Insert Table</h3>

			<div class="text-center">
				<p class="mb-4 text-gray-600">Insert a 3x3 table with header row</p>
			</div>

			<div class="flex justify-end space-x-3">
				<button
					type="button"
					on:click={() => (showTableDialog = false)}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={insertTable}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Insert Table
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showImageDialog}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h3 class="mb-4 text-lg font-semibold">Insert Image URL</h3>

			<div class="space-y-4">
				<div>
					<label class="mb-2 block text-sm font-medium text-gray-700">Image URL</label>
					<input
						type="url"
						bind:value={imageUrl}
						placeholder="https://example.com/image.jpg"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div class="text-center text-sm text-gray-500">
					<p>💡 <strong>Pro tips:</strong></p>
					<ul class="mt-2 space-y-1 text-left">
						<li>• Paste images directly with <kbd class="rounded bg-gray-100 px-1">Ctrl+V</kbd></li>
						<li>• Drag & drop images into the editor</li>
						<li>• Use the upload button for local files</li>
					</ul>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={() => {
						showImageDialog = false;
						imageUrl = '';
					}}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={insertImage}
					disabled={!imageUrl}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					Insert
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showColorPicker || showHighlightPicker}
	<div
		class="fixed inset-0 z-10"
		on:click={() => {
			showColorPicker = false;
			showHighlightPicker = false;
		}}
	></div>
{/if}

<style>
	:global(.ProseMirror) {
		outline: none;
	}

	:global(.ProseMirror img) {
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	:global(.ProseMirror img:hover) {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	:global(.ProseMirror img[data-temp-id]) {
		transition: opacity 0.3s ease;
	}

	:global(.ProseMirror img.opacity-75) {
		filter: brightness(0.9);
	}

	:global(.ProseMirror img.opacity-100) {
		transition:
			opacity 0.3s ease,
			filter 0.3s ease;
	}

	:global(.ProseMirror img::after) {
		content: '✕';
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px;
		height: 20px;
		background: rgba(220, 38, 38, 0.8);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}

	:global(.ProseMirror img:hover::after) {
		opacity: 1;
	}

	:global(.ProseMirror table) {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 1rem 0;
	}

	:global(.ProseMirror table td, .ProseMirror table th) {
		border: 1px solid #ccc;
		box-sizing: border-box;
		min-width: 1em;
		padding: 0.5rem;
		position: relative;
		vertical-align: top;
	}

	:global(.ProseMirror table th) {
		background-color: #f3f4f6;
		font-weight: bold;
		text-align: left;
	}

	:global(.ProseMirror .selectedCell) {
		background: rgba(200, 200, 255, 0.4);
	}

	:global(.ProseMirror pre) {
		background: #0f172a;
		color: #e2e8f0;
		font-family:
			'JetBrainsMono', 'SFMono-Regular', 'Menlo', 'Consolas', 'DejaVu Sans Mono', monospace;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	:global(.ProseMirror code) {
		background-color: rgba(97, 97, 97, 0.1);
		border-radius: 0.25rem;
		color: #374151;
		font-size: 0.85em;
		padding: 0.25em 0.4em;
	}

	:global(.ProseMirror blockquote) {
		border-left: 4px solid #e5e7eb;
		margin: 1.5rem 0;
		padding-left: 1rem;
		font-style: italic;
	}

	:global(.ProseMirror hr) {
		border: none;
		border-top: 2px solid #e5e7eb;
		margin: 2rem 0;
	}

	:global(.ProseMirror .youtube-wrapper) {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
		max-width: 100%;
		margin: 1rem 0;
	}

	:global(.ProseMirror .youtube-wrapper iframe) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	kbd {
		font-family: monospace;
		font-size: 0.875em;
	}
</style>
