import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        tags: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return {
      experiences
    };
  } catch (error) {
    console.error('Error loading experiences:', error);
    return {
      experiences: []
    };
  }
};

export const actions: Actions = {
  delete: async ({ request }) => {
    try {
      const formData = await request.formData();
      const id = Number(formData.get('id'));

      if (!id) {
        return fail(400, {
          error: 'Experience ID is required'
        });
      }

      await prisma.experience.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Experience deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting experience:', error);
      return fail(500, {
        error: 'Failed to delete experience'
      });
    }
  }
};