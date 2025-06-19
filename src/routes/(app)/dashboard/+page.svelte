<script lang="ts">
	import {
		FileText,
		Briefcase,
		GraduationCap,
		Mail,
		TrendingUp,
		Users,
		Eye,
		Calendar
	} from 'lucide-svelte';

	export let data;
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="stats-card">
			<div class="flex items-center">
				<div class="rounded-lg bg-blue-100 p-3">
					<FileText class="h-6 w-6 text-blue-600" />
				</div>
				<div class="ml-4 flex-1">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600">Total Blogs</p>
							<p class="text-2xl font-bold text-gray-900">{data.stats.blogs}</p>
						</div>
						<div class="text-right">
							<span class="inline-flex items-center text-sm font-medium text-green-600">
								<TrendingUp class="mr-1 h-4 w-4" />
								+12%
							</span>
							<p class="text-xs text-gray-500">vs last month</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="stats-card">
			<div class="flex items-center">
				<div class="rounded-lg bg-green-100 p-3">
					<Briefcase class="h-6 w-6 text-green-600" />
				</div>
				<div class="ml-4 flex-1">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600">Total Projects</p>
							<p class="text-2xl font-bold text-gray-900">{data.stats.projects}</p>
						</div>
						<div class="text-right">
							<span class="inline-flex items-center text-sm font-medium text-green-600">
								<TrendingUp class="mr-1 h-4 w-4" />
								+5%
							</span>
							<p class="text-xs text-gray-500">vs last month</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="stats-card">
			<div class="flex items-center">
				<div class="rounded-lg bg-purple-100 p-3">
					<GraduationCap class="h-6 w-6 text-purple-600" />
				</div>
				<div class="ml-4 flex-1">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600">Experiences</p>
							<p class="text-2xl font-bold text-gray-900">{data.stats.experiences}</p>
						</div>
						<div class="text-right">
							<span class="inline-flex items-center text-sm font-medium text-blue-600">
								<Calendar class="mr-1 h-4 w-4" />
								Active
							</span>
							<p class="text-xs text-gray-500">timeline</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="stats-card">
			<div class="flex items-center">
				<div class="rounded-lg bg-orange-100 p-3">
					<Mail class="h-6 w-6 text-orange-600" />
				</div>
				<div class="ml-4 flex-1">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600">New Contacts</p>
							<p class="text-2xl font-bold text-gray-900">{data.stats.contacts}</p>
						</div>
						<div class="text-right">
							<span class="inline-flex items-center text-sm font-medium text-red-600">
								<Users class="mr-1 h-4 w-4" />
								Pending
							</span>
							<p class="text-xs text-gray-500">replies</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="card p-6">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">Recent Blogs</h3>
				<a href="/blogs" class="text-primary hover:text-primary/80 text-sm font-medium">
					View All
				</a>
			</div>

			<div class="space-y-4">
				{#each data.recentBlogs as blog}
					<div
						class="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
					>
						<div class="flex-1">
							<h4 class="mb-1 font-medium text-gray-900">{blog.title}</h4>
							<div class="flex items-center space-x-4 text-xs text-gray-500">
								<span class="inline-flex items-center">
									<span
										class="mr-2 h-2 w-2 rounded-full {blog.published
											? 'bg-green-500'
											: 'bg-yellow-500'}"
									></span>
									{blog.published ? 'Published' : 'Draft'}
								</span>
								<span>{new Date(blog.updatedAt).toLocaleDateString()}</span>
							</div>
						</div>
						<a href="/blogs/{blog.id}" class="btn-primary text-xs"> Edit </a>
					</div>
				{/each}
			</div>
		</div>

		<div class="card p-6">
			<h3 class="mb-6 text-lg font-semibold text-gray-900">Quick Actions</h3>

			<div class="grid grid-cols-2 gap-4">
				<a
					href="/blogs/new"
					class="group flex flex-col items-center justify-center rounded-lg bg-blue-50 p-6 transition-colors hover:bg-blue-100"
				>
					<FileText class="mb-2 h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
					<span class="text-sm font-medium text-blue-900">New Blog</span>
				</a>

				<a
					href="/projects/new"
					class="group flex flex-col items-center justify-center rounded-lg bg-green-50 p-6 transition-colors hover:bg-green-100"
				>
					<Briefcase
						class="mb-2 h-8 w-8 text-green-600 transition-transform group-hover:scale-110"
					/>
					<span class="text-sm font-medium text-green-900">New Project</span>
				</a>

				<a
					href="/experiences/new"
					class="group flex flex-col items-center justify-center rounded-lg bg-purple-50 p-6 transition-colors hover:bg-purple-100"
				>
					<GraduationCap
						class="mb-2 h-8 w-8 text-purple-600 transition-transform group-hover:scale-110"
					/>
					<span class="text-sm font-medium text-purple-900">Add Experience</span>
				</a>

				<a
					href="/contacts"
					class="group flex flex-col items-center justify-center rounded-lg bg-orange-50 p-6 transition-colors hover:bg-orange-100"
				>
					<Mail class="mb-2 h-8 w-8 text-orange-600 transition-transform group-hover:scale-110" />
					<span class="text-sm font-medium text-orange-900">View Messages</span>
				</a>
			</div>
		</div>
	</div>

	<div class="card p-6">
		<h3 class="mb-6 text-lg font-semibold text-gray-900">Recent Activity</h3>

		<div class="space-y-4">
			<div class="flex items-start space-x-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
				>
					<FileText class="h-4 w-4 text-blue-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-gray-900">
						<span class="font-medium">Blog post</span> "Introduction to SvelteKit" was published
					</p>
					<p class="text-xs text-gray-500">2 hours ago</p>
				</div>
			</div>

			<div class="flex items-start space-x-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100"
				>
					<Briefcase class="h-4 w-4 text-green-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-gray-900">
						<span class="font-medium">Project</span> "E-commerce Platform" was updated
					</p>
					<p class="text-xs text-gray-500">5 hours ago</p>
				</div>
			</div>

			<div class="flex items-start space-x-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100"
				>
					<Mail class="h-4 w-4 text-orange-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-gray-900">
						<span class="font-medium">Contact form</span> submission received from John Doe
					</p>
					<p class="text-xs text-gray-500">1 day ago</p>
				</div>
			</div>
		</div>
	</div>
</div>
