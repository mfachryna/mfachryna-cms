export interface ResizeOptions {
	width: number;
	height: number;
	quality: number;
	format: 'jpeg' | 'png' | 'webp';
}

export interface ImageSizes {
	large: string;
	medium: string;
	small: string;
	thumbnail: string;
	icon: string;
}

export const IMAGE_SIZES: Record<keyof ImageSizes, ResizeOptions> = {
	large: { width: 1920, height: 1080, quality: 0.8, format: 'jpeg' },
	medium: { width: 1280, height: 720, quality: 0.8, format: 'jpeg' },
	small: { width: 640, height: 360, quality: 0.8, format: 'jpeg' },
	thumbnail: { width: 320, height: 180, quality: 0.7, format: 'jpeg' },
	icon: { width: 64, height: 64, quality: 0.7, format: 'jpeg' }
};

export function resizeImage(file: File, options: ResizeOptions): Promise<File> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();

		img.onload = () => {
			const { width, height } = calculateDimensions(
				img.width,
				img.height,
				options.width,
				options.height
			);

			canvas.width = width;
			canvas.height = height;

			if (ctx) {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';

				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const resizedFile = new File([blob], `resized_${file.name}`, {
								type: `image/${options.format}`,
								lastModified: Date.now()
							});
							resolve(resizedFile);
						} else {
							reject(new Error('Failed to create blob'));
						}
					},
					`image/${options.format}`,
					options.quality
				);
			} else {
				reject(new Error('Could not get canvas context'));
			}
		};

		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = URL.createObjectURL(file);
	});
}

function calculateDimensions(
	originalWidth: number,
	originalHeight: number,
	maxWidth: number,
	maxHeight: number
): { width: number; height: number } {
	const aspectRatio = originalWidth / originalHeight;

	let width = maxWidth;
	let height = maxHeight;

	if (originalWidth > originalHeight) {
		height = width / aspectRatio;
		if (height > maxHeight) {
			height = maxHeight;
			width = height * aspectRatio;
		}
	} else {
		width = height * aspectRatio;
		if (width > maxWidth) {
			width = maxWidth;
			height = width / aspectRatio;
		}
	}

	return {
		width: Math.round(width),
		height: Math.round(height)
	};
}

export async function compressImageBeforeUpload(
	file: File,
	targetSize: 'medium' | 'small' = 'medium'
): Promise<File> {
	if (file.size < 1024 * 1024) {
		return file;
	}

	const options = targetSize === 'medium' ? IMAGE_SIZES.medium : IMAGE_SIZES.small;

	try {
		const compressedFile = await resizeImage(file, options);

		return compressedFile;
	} catch (error) {
		console.warn('Failed to compress image, using original:', error);
		return file;
	}
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateFolderPath(model: string, entitySlug: string): string {
	return `${model}/${entitySlug}`;
}
