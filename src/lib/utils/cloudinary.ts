import {
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET
} from '$env/static/private';
import { createHash } from 'crypto';

export interface CloudinaryResponse {
	public_id: string;
	secure_url: string;
	url: string;
	format: string;
	width: number;
	height: number;
	bytes: number;
}

export interface UploadOptions {
	folder?: string;
	compression?: boolean;
	maxFileSize?: number;
}

export interface TransformationOptions {
	w?: number;
	h?: number;
	c?: string;
	q?: string;
	f?: string;
	[key: string]: any;
}

export interface UploadResult {
	publicId: string;
	url: string;
	width: number;
	height: number;
	bytes: number;
	format: string;
}

export class CloudinaryUploader {
	private cloudName: string;
	private apiKey: string;
	private apiSecret: string;

	constructor() {
		this.cloudName = CLOUDINARY_CLOUD_NAME;
		this.apiKey = CLOUDINARY_API_KEY;
		this.apiSecret = CLOUDINARY_API_SECRET;

		if (!this.cloudName || !this.apiKey || !this.apiSecret) {
			throw new Error('Missing required Cloudinary environment variables');
		}
	}

	async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
		const { folder = '', compression = true, maxFileSize = 10 } = options;

		if (file.size > maxFileSize * 1024 * 1024) {
			throw new Error(`File size exceeds ${maxFileSize}MB limit`);
		}

		if (!file.type.startsWith('image/')) {
			throw new Error('File must be an image');
		}

		const timestamp = Math.round(Date.now() / 1000);

		const signatureParams: Record<string, string | number> = {
			timestamp
		};

		if (folder) {
			signatureParams.folder = folder;
		}

		const signature = this.generateSignature(signatureParams);

		const formData = new FormData();
		formData.append('file', file);
		formData.append('api_key', this.apiKey);
		formData.append('timestamp', timestamp.toString());
		formData.append('signature', signature);

		if (folder) {
			formData.append('folder', folder);
		}

		if (compression) {
			formData.append('quality', 'auto');
			formData.append('fetch_format', 'auto');
		}

		try {
			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
				{
					method: 'POST',
					body: formData
				}
			);

			const responseText = await response.text();

			if (!response.ok) {
				let errorMessage = response.statusText;

				try {
					const errorData = JSON.parse(responseText);
					errorMessage = errorData.error?.message || errorMessage;
				} catch {
					errorMessage = responseText || errorMessage;
				}

				throw new Error(`Cloudinary upload failed: ${errorMessage}`);
			}

			const result: CloudinaryResponse = JSON.parse(responseText);

			return {
				publicId: result.public_id,
				url: result.secure_url,
				width: result.width,
				height: result.height,
				bytes: result.bytes,
				format: result.format
			};
		} catch (error) {
			console.error('❌ Cloudinary upload error:', error);
			throw new Error(`Failed to upload image: ${error.message}`);
		}
	}

	generateTransformationUrl(publicId: string, transformations: TransformationOptions): string {
		const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;

		const transformStr = Object.entries(transformations)
			.map(([key, value]) => `${key}_${value}`)
			.join(',');

		return `${baseUrl}/${transformStr}/${publicId}`;
	}

	generateResponsiveUrls(publicId: string) {
		return {
			large: this.generateTransformationUrl(publicId, {
				w: 1920,
				h: 1080,
				c: 'fill',
				q: 'auto',
				f: 'auto'
			}),
			medium: this.generateTransformationUrl(publicId, {
				w: 1280,
				h: 720,
				c: 'fill',
				q: 'auto',
				f: 'auto'
			}),
			small: this.generateTransformationUrl(publicId, {
				w: 640,
				h: 360,
				c: 'fill',
				q: 'auto',
				f: 'auto'
			}),
			thumbnail: this.generateTransformationUrl(publicId, {
				w: 320,
				h: 180,
				c: 'fill',
				q: 'auto',
				f: 'auto'
			}),
			icon: this.generateTransformationUrl(publicId, {
				w: 64,
				h: 64,
				c: 'fill',
				q: 'auto',
				f: 'auto'
			})
		};
	}

	async deleteImage(publicId: string): Promise<boolean> {
		try {
			const timestamp = Math.round(Date.now() / 1000);
			const params = {
				public_id: publicId,
				timestamp
			};
			const signature = this.generateSignature(params);

			const formData = new FormData();
			formData.append('public_id', publicId);
			formData.append('signature', signature);
			formData.append('api_key', this.apiKey);
			formData.append('timestamp', timestamp.toString());

			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
				{
					method: 'POST',
					body: formData
				}
			);

			const result = await response.json();
			return result.result === 'ok';
		} catch (error) {
			console.error('Failed to delete image:', error);
			return false;
		}
	}

	private generateSignature(params: Record<string, string | number>): string {
		const sortedParams = Object.keys(params)
			.sort()
			.map((key) => `${key}=${params[key]}`)
			.join('&');

		const stringToSign = sortedParams + this.apiSecret;

		const signature = createHash('sha1').update(stringToSign).digest('hex');

		return signature;
	}
}

export const cloudinaryUploader = new CloudinaryUploader();

export function generateFolderPath(model: string, entitySlug: string): string {
	return `${model}/${entitySlug}`;
}
