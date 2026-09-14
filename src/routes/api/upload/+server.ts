import { json } from '@sveltejs/kit';
import { cloudinaryUploader } from '$lib/utils/cloudinary';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Defence in depth: hooks.server.ts already gates /api, but these
	// endpoints spend Cloudinary quota and delete assets, so re-check here.
	const authorized =
		Boolean(locals.user) || /^Bearer\s+.+/i.test(request.headers.get('authorization') ?? '');
	if (!authorized) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const folder = formData.get('folder') as string;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		if (!file.type.startsWith('image/')) {
			return json({ error: 'Invalid file type' }, { status: 400 });
		}

		if (!folder) {
			return json({ error: 'Folder path is required' }, { status: 400 });
		}

		const result = await cloudinaryUploader.uploadImage(file, {
			folder,
			compression: true,
			maxFileSize: 10
		});

		const sizes = cloudinaryUploader.generateResponsiveUrls(result.publicId);

		return json({
			success: true,
			public_id: result.publicId,
			secure_url: result.url,
			sizes,
			original: {
				width: result.width,
				height: result.height,
				bytes: result.bytes,
				format: result.format
			}
		});
	} catch (error: any) {
		console.error('❌ Upload error:', error);
		return json({ error: 'Upload failed', details: error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { publicId } = await request.json();

		if (!publicId) {
			return json({ error: 'Public ID is required' }, { status: 400 });
		}

		const deleted = await cloudinaryUploader.deleteImage(publicId);

		if (deleted) {
			return json({ success: true, publicId });
		} else {
			return json({ success: true, publicId, message: 'Image not found (may already be deleted)' });
		}
	} catch (error: any) {
		console.error('❌ Delete error:', error);
		return json({ error: 'Delete failed', details: error.message }, { status: 500 });
	}
};
