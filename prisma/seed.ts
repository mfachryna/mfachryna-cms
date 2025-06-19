import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is not set');
	process.exit(1);
}

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: DATABASE_URL
		}
	}
});

async function main() {
	try {
		console.log('Cleaning existing data...');
		await prisma.tag.deleteMany({});
		await prisma.experience.deleteMany({});

		console.log('Seeding database...');

		console.log('Creating experiences...');

		await prisma.experience.create({
			data: {
				title: 'Officer Development Program IT',
				role: 'Trainee',
				company: 'PT. Bank Syariah Indonesia Tbk.',
				location: 'Jakarta, Indonesia | On-site',
				startDate: new Date('2025-12-01'),
				content: 'Learning about banking operation, corporate finance, leadership and other',
				highlights: [
					'Training in banking operations and corporate finance',
					'Developing leadership skills through structured program',
					'Learning Islamic banking principles and applications'
				],
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Banking' },
							create: {
								name: 'Banking',
								iconUrl: '/images/tags/icon/banking.svg',
								isTech: false
							}
						},
						{
							where: { name: 'Leadership' },
							create: {
								name: 'Leadership',
								iconUrl: '/images/tags/icon/leadership.svg',
								isTech: false
							}
						}
					]
				}
			}
		});

		await prisma.experience.create({
			data: {
				title: 'Software Engineer',
				role: 'Backend',
				company: 'PT. Suitmedia Kreasi Indonesia',
				location: 'Jakarta, Indonesia | Full-Time',
				startDate: new Date('2023-04-01'),
				content:
					'Working as a backend engineer on multiple client projects for companies including PT Eigerindo Multi Produk Industri, PT Kustodian Sentral Efek Indonesia, Dompet Dhuafa, Danone Indonesia, and ITB.',
				highlights: [
					'Managed five maintenance projects and one developmental phase project',
					'Resolved 40% of bugs or adjustments ahead of estimated time, demonstrating proactive problem-solving skills and efficiency',
					'Implemented strategies to address performance issues, resulting in a notable 20% enhancement in system performance, optimizing overall functionality and user experience',
					'Warehouse Management System (May 2023 - Jan 2025): Maintained and enhanced functionality of existing application; developed new functionality for stock movement across stores',
					'Company Profile (May 2023 - June 2023): Designed and developed interactive company profile using Laravel and MySQL with multilingual support',
					'Crowdfunding Application (Oct 2023 - Feb 2024): Maintained and fixed bugs in backend API built with Laravel and CMS web app built with Nuxt.js',
					'Admission App (Mar 2023 - Present): Developing API and CMS Web App using Laravel and MySQL',
					'Ride-sharing Mobile Application (Nov 2024 - Present): Maintaining application built with Laravel and MySQL',
					'Product Management and Traceability Website (Nov 2022 - Sep 2024): Maintained application built with Laravel and MySQL'
				],
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Project Management' },
							create: {
								name: 'Project Management',
								iconUrl: '/images/tags/icon/project-management.svg',
								isTech: false
							}
						},
						{
							where: { name: 'Nuxt.js' },
							create: {
								name: 'Nuxt.js',
								iconUrl: '/images/tags/icon/nuxtjs.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Vue.js' },
							create: {
								name: 'Vue.js',
								iconUrl: '/images/tags/icon/vue.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.experience.create({
			data: {
				title: 'Software Engineer Intern',
				role: 'Backend',
				company: 'PT. Suitmedia Kreasi Indonesia',
				location: 'Jakarta, Indonesia | Internship',
				startDate: new Date('2022-02-01'),
				endDate: new Date('2022-07-31'),
				content:
					'Interned as a backend developer for an omnichannel application with focus on loyalty programs.',
				highlights: [
					'Engaged in three complete sprint cycles for the development of an omnichannel application, specifically focusing on the creation of a loyalty program',
					'84% of project features delivered clearly and on time or ahead of schedule, ensuring prompt project completion and client satisfaction',
					'89% of project issues and adjustments solved on time or ahead of schedule, ensuring project maintainability and client satisfaction',
					'Produced clear technical documentation and smoothly transitioned projects to clients, facilitating seamless knowledge transfer and operational readiness',
					'Loyalty Website (Jul 2022 - Jan 2024): Developed using agile methodologies and Laravel PHP framework as part of an omni-channel system',
					'Designed robust data storage architecture using MySQL, implementing optimizations to improve retrieval speed',
					'Integrated with Order Management System and Point of Sale for point conversion and voucher utilization',
					'Implemented sophisticated dashboard with complex calculations for auditing and data visualization',
					'Created detailed technical documentation and managed successful application handover'
				],
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Documentation' },
							create: {
								name: 'Documentation',
								iconUrl: '/images/tags/icon/documentation.svg',
								isTech: false
							}
						},
						{
							where: { name: 'Project Management' },
							create: {
								name: 'Project Management',
								iconUrl: '/images/tags/icon/project-management.svg',
								isTech: false
							}
						}
					]
				}
			}
		});

		await prisma.experience.create({
			data: {
				title: 'Laboratory Assistant',
				role: 'Teaching Assistant',
				company: 'Faculty of Computer Science Brawijaya University',
				location: 'Malang, Indonesia | Part-Time',
				startDate: new Date('2021-02-01'),
				endDate: new Date('2022-12-31'),
				content: 'Assisted with teaching and grading multiple computer science courses.',
				highlights: [
					'Taught and graded a 36-person class about Software Engineering',
					'Taught and graded a 34-person class about Algorithms and Data Structure using Java',
					'Taught and graded a 37-person class about Basic Operating Systems',
					'Taught and graded a 38-person class about Basic Programming'
				],
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Teaching' },
							create: {
								name: 'Teaching',
								iconUrl: '/images/tags/icon/teaching.svg',
								isTech: false
							}
						},
						{
							where: { name: 'Java' },
							create: {
								name: 'Java',
								iconUrl: '/images/tags/icon/java.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		console.log('Creating projects...');

		await prisma.project.create({
			data: {
				title: 'Personal Portfolio',
				subtitle: 'Interactive developer portfolio',
				description:
					'Built with SvelteKit and TailwindCSS, this portfolio website showcases my projects and professional experience. Features include server-side rendering, responsive design, dark/light mode, animation effects, and a custom CMS integration with Prisma ORM. The site is optimized for SEO and demonstrates modern front-end development practices.',
				imageUrl: '/images/projects/cover/personal-portfolio.webp',
				thumbnailUrl: '/images/projects/thumbnail/personal-portfolio.webp',
				githubUrl: 'https://github.com/mfachryna/frontend-fe',
				liveUrl: 'https://mfachryna.vercel.app',
				featured: true,
				order: 1,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'SvelteKit' },
							create: {
								name: 'SvelteKit',
								iconUrl: '/images/tags/icon/sveltekit.svg',
								isTech: true
							}
						},
						{
							where: { name: 'TypeScript' },
							create: {
								name: 'TypeScript',
								iconUrl: '/images/tags/icon/typescript.svg',
								isTech: true
							}
						},
						{
							where: { name: 'TailwindCSS' },
							create: {
								name: 'TailwindCSS',
								iconUrl: '/images/tags/icon/tailwind.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Prisma' },
							create: {
								name: 'Prisma',
								iconUrl: '/images/tags/icon/prisma.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Frontend' },
							create: {
								name: 'Frontend',
								iconUrl: '/images/tags/icon/frontend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Omnichannel Loyalty Platform',
				subtitle: 'Customer rewards and engagement system',
				description:
					'Developed using agile methodologies and Laravel PHP framework as part of an omni-channel system. Designed robust data storage architecture using MySQL with optimizations for improved retrieval speed. Integrated with Order Management System and Point of Sale for point conversion, voucher utilization and transaction data visualization. Implemented a sophisticated dashboard with complex calculations for auditing and data analytics.',
				imageUrl: '/images/projects/cover/omnichannel-loyalty-platform.webp',
				thumbnailUrl: '/images/projects/thumbnail/omnichannel-loyalty-platform.webp',
				featured: true,
				order: 2,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Documentation' },
							create: {
								name: 'Documentation',
								iconUrl: '/images/tags/icon/documentation.svg',
								isTech: false
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Warehouse Management System',
				subtitle: 'Retail inventory tracking solution',
				description:
					'Maintained and enhanced functionality of existing application while developing new features for stock movement across stores. Implemented transaction system to locate goods in alternative stores for Point of Sales service and Order Management system. Fixed bugs and optimized performance for better user experience.',
				imageUrl: '/images/projects/cover/warehouse-management-system.webp',
				thumbnailUrl: '/images/projects/thumbnail/warehouse-management-system.webp',
				featured: true,
				order: 3,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Upskilling Go Project',
				subtitle: 'Backend microservices with performance testing',
				description:
					'Developed simple backend applications including banking, shopping, and social media platforms using go-chi framework and PostgreSQL database. Conducted load testing with K6 to ensure optimal performance. Implemented CI/CD for deployment using AWS Elastic Container Registry and Elastic Container Service through GitHub Actions.',
				imageUrl: '/images/projects/cover/upskilling-go-project.webp',
				thumbnailUrl: '/images/projects/thumbnail/upskilling-go-project.webp',
				githubUrl: 'https://github.com/mfachryna/go-upskilling',
				featured: true,
				order: 4,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Go' },
							create: {
								name: 'Go',
								iconUrl: '/images/tags/icon/go.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PostgreSQL' },
							create: {
								name: 'PostgreSQL',
								iconUrl: '/images/tags/icon/postgresql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'AWS' },
							create: {
								name: 'AWS',
								iconUrl: '/images/tags/icon/aws.svg',
								isTech: true
							}
						},
						{
							where: { name: 'CI/CD' },
							create: {
								name: 'CI/CD',
								iconUrl: '/images/tags/icon/cicd.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Docker' },
							create: {
								name: 'Docker',
								iconUrl: '/images/tags/icon/docker.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Testing' },
							create: {
								name: 'Testing',
								iconUrl: '/images/tags/icon/testing.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'KPI App for Teachers',
				subtitle: 'Performance management system',
				description:
					'Conducted full Waterfall Model development to build a teacher performance evaluation application. Built using Laravel Livewire and MySQL for efficient data handling. Deployed the application to a Virtual Private Server (VPS) and performed comprehensive Unit Testing and Compatibility Testing to ensure project stability.',
				imageUrl: '/images/projects/cover/kpi-app-for-teachers.webp',
				thumbnailUrl: '/images/projects/thumbnail/kpi-app-for-teachers.webp',
				githubUrl: 'https://github.com/mfachryna/kpi-teacher',
				order: 5,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Livewire' },
							create: {
								name: 'Livewire',
								iconUrl: '/images/tags/icon/livewire.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'VPS' },
							create: {
								name: 'VPS',
								iconUrl: '/images/tags/icon/vps.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Testing' },
							create: {
								name: 'Testing',
								iconUrl: '/images/tags/icon/testing.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Notion-GCalendar Sync',
				subtitle: 'Productivity automation tool',
				description:
					'Developed a productivity application that synchronizes records from Notion tables to Google Calendar. Built using Go language for efficient processing and API integration. The tool automates calendar management for improved productivity and time management.',
				imageUrl: '/images/projects/cover/notion-gcalendar-sync.webp',
				thumbnailUrl: '/images/projects/thumbnail/notion-gcalendar-sync.webp',
				githubUrl: 'https://github.com/mfachryna/notion-gcalendar',
				order: 6,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Go' },
							create: {
								name: 'Go',
								iconUrl: '/images/tags/icon/go.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Crowdfunding Platform',
				subtitle: 'Digital fundraising solution',
				description:
					'Maintained and fixed bugs in a crowdfunding application, working on both the backend API built with Laravel PHP framework and the CMS Web app built with Nuxt.js. Improved system stability and performance while ensuring seamless user experience for donors and campaign managers.',
				imageUrl: '/images/projects/cover/crowdfunding-platform.webp',
				thumbnailUrl: '/images/projects/thumbnail/crowdfunding-platform.webp',
				order: 7,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Nuxt.js' },
							create: {
								name: 'Nuxt.js',
								iconUrl: '/images/tags/icon/nuxtjs.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Vue.js' },
							create: {
								name: 'Vue.js',
								iconUrl: '/images/tags/icon/vue.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Multilingual Company Profile',
				subtitle: 'Corporate website with translation support',
				description:
					'Designed and developed an interactive company profile using Laravel PHP framework. Implemented robust data architecture with MySQL and optimization techniques to improve retrieval speed. Added multilingual support with translations for international accessibility.',
				imageUrl: '/images/projects/cover/multilingual-company-profile.webp',
				thumbnailUrl: '/images/projects/thumbnail/multilingual-company-profile.webp',
				order: 8,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Frontend' },
							create: {
								name: 'Frontend',
								iconUrl: '/images/tags/icon/frontend.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Admission Application',
				subtitle: 'Student enrollment management system',
				description:
					'Developed API and CMS Web App using Laravel PHP framework and MySQL database. The system manages the student admission process, application tracking, and enrollment management for educational institutions.',
				imageUrl: '/images/projects/cover/admission-application.webp',
				thumbnailUrl: '/images/projects/thumbnail/admission-application.webp',
				order: 9,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		await prisma.project.create({
			data: {
				title: 'Ride-sharing Platform',
				subtitle: 'Transportation service application',
				description:
					'Maintained and fixed bugs for a ride-sharing application built with Laravel PHP framework and MySQL database. Improved app stability, performance, and user experience for both riders and drivers.',
				imageUrl: '/images/projects/cover/ride-sharing-platform.webp',
				thumbnailUrl: '/images/projects/thumbnail/ride-sharing-platform.webp',
				order: 10,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'API Development' },
							create: {
								name: 'API Development',
								iconUrl: '/images/tags/icon/api-development.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		
		await prisma.project.create({
			data: {
				title: 'Product Traceability System',
				subtitle: 'Supply chain management solution',
				description:
					'Maintained and fixed bugs for a product management and traceability application built with Laravel PHP framework and MySQL database. The system tracks products throughout the supply chain, ensuring quality control and compliance with regulations.',
				imageUrl: '/images/projects/cover/product-traceability-system.webp',
				thumbnailUrl: '/images/projects/thumbnail/product-traceability-system.webp',
				order: 11,
				featured: false,
				tags: {
					connectOrCreate: [
						{
							where: { name: 'Laravel' },
							create: {
								name: 'Laravel',
								iconUrl: '/images/tags/icon/laravel.svg',
								isTech: true
							}
						},
						{
							where: { name: 'MySQL' },
							create: {
								name: 'MySQL',
								iconUrl: '/images/tags/icon/mysql.svg',
								isTech: true
							}
						},
						{
							where: { name: 'PHP' },
							create: {
								name: 'PHP',
								iconUrl: '/images/tags/icon/php.svg',
								isTech: true
							}
						},
						{
							where: { name: 'Backend' },
							create: {
								name: 'Backend',
								iconUrl: '/images/tags/icon/backend.svg',
								isTech: true
							}
						}
					]
				}
			}
		});

		console.log('Creating blog posts...');

		const blogPosts = [
			// {
			// 	title: '',
			// 	slug: '',
			// 	description: '',
			// 	excerpt:
			// 		'',
			// 	content: ``,
			// 	published: true,
			// 	publishedAt: new Date('2023-11-15'),
			// 	imageUrl: '/images/blogs/cover/blogs.webp',
			// 	tags: {
			// 		connectOrCreate: [
			// 			{
			// 				where: { name: 'React' },
			// 				create: {
			// 					name: 'React',
			// 					iconUrl: '/images/tags/icon/react.svg',
			// 					isTech: true
			// 				}
			// 			},
			// 			{
			// 				where: { name: 'Performance' },
			// 				create: {
			// 					name: 'Performance',
			// 					iconUrl: '/images/tags/icon/performance.svg',
			// 					isTech: false
			// 				}
			// 			},
			// 			{
			// 				where: { name: 'Frontend' },
			// 				create: {
			// 					name: 'Frontend',
			// 					iconUrl: '/images/tags/icon/frontend.svg',
			// 					isTech: true
			// 				}
			// 			}
			// 		]
			// 	}
			// },
		];

		for (const blog of blogPosts) {
			await prisma.blog.create({
				data: blog
			});
		}

		console.log(`Created ${blogPosts.length} blog posts`);

		console.log('Database seeding completed.');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}

main()
	.then(async () => {
		console.log('Disconnecting from database...');
		await prisma.$disconnect();
		console.log('Successfully disconnected');
		process.exit(0);
	})
	.catch(async (e) => {
		console.error('Fatal error during seeding:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
