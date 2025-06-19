import { prisma } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        tags: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return {
      blogs
    };
  } catch (error) {
    console.error('Failed to load blogs:', error);
    return {
      blogs: []
    };
  }
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id) {
      return fail(400, { error: 'Blog ID is required' });
    }

    try {
      await prisma.blog.delete({
        where: { id: Number(id) }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete blog:', error);
      return fail(500, { error: 'Failed to delete blog post' });
    }
  }
};