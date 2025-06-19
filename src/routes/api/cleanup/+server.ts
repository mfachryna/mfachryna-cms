import { json } from '@sveltejs/kit';
import { cloudinaryUploader } from '$lib/utils/cloudinary';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { publicIds } = await request.json();

		if (!Array.isArray(publicIds)) {
			return json({ error: 'publicIds must be an array' }, { status: 400 });
		}

		const results = [];
		for (const publicId of publicIds) {
			try {
				const deleted = await cloudinaryUploader.deleteImage(publicId);
				results.push({ publicId, deleted });
			} catch (error) {
				console.error('Failed to delete:', publicId, error);
				results.push({ publicId, deleted: false, error: error.message });
			}
		}

		return json({ success: true, results });
	} catch (error: any) {
		console.error('❌ Cleanup error:', error);
		return json({ error: 'Cleanup failed', details: error.message }, { status: 500 });
	}
};
