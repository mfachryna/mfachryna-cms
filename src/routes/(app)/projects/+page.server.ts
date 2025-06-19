import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const technologies = await prisma.tag.findMany({
      where: {
        isTech: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return {
      projects,
      technologies
    };
  } catch (error) {
    console.error('Error loading projects:', error);
    return {
      projects: [],
      technologies: []
    };
  }
};

export const actions = {
  delete: async ({ request }) => {
    try {
      const formData = await request.formData();
      const projectId = Number(formData.get('projectId'));
      
      if (!projectId) {
        return {
          type: 'error',
          message: 'Project ID is required'
        };
      }
      
      await prisma.project.delete({
        where: { id: projectId }
      });
      
      return {
        type: 'success',
        message: 'Project deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        type: 'error',
        message: 'Failed to delete project'
      };
    }
  }
};