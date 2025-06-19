import { prisma } from '$lib/server/auth';

export async function load() {
  try {
    const [blogs, projects, experiences, contacts, recentBlogs] = await Promise.all([
      prisma.blog.count(),
      prisma.project.count(),
      prisma.experience.count(),
      prisma.contact.count(),
      prisma.blog.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          published: true,
          updatedAt: true,
          slug: true
        }
      })
    ]);

    return {
      stats: { blogs, projects, experiences, contacts },
      recentBlogs
    };
  } catch (error) {
    console.error('Dashboard load error:', error);
    return {
      stats: {
        blogs: 0,
        projects: 0,
        experiences: 0,
        contacts: 0
      },
      recentBlogs: []
    };
  }
}