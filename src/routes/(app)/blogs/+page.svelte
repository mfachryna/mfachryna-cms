<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BlogPreviewModal from '$lib/components/BlogPreviewModal.svelte';
	import {
		Plus,
		Search,
		Filter,
		Edit,
		Trash2,
		Eye,
		Calendar,
		Clock,
		Tag,
		Image,
		TrendingUp,
		FileText,
		MoreVertical,
		Star,
		Globe,
		ExternalLink
	} from 'lucide-svelte';

	export let data;

	let searchQuery = '';
	let filterStatus = 'all';
	let filterFeatured = 'all';
	let sortBy = 'newest';

	let showPreviewModal = false;
	let selectedBlog: any = null;

	$: filteredBlogs = data.blogs
		.filter((blog) => {
			const matchesSearch =
				searchQuery === '' ||
				blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesStatus =
				filterStatus === 'all' ||
				(filterStatus === 'published' && blog.published) ||
				(filterStatus === 'draft' && !blog.published);

			const matchesFeatured =
				filterFeatured === 'all' ||
				(filterFeatured === 'featured' && blog.featured) ||
				(filterFeatured === 'normal' && !blog.featured);

			return matchesSearch && matchesStatus && matchesFeatured;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'title':
					return a.title.localeCompare(b.title);
				case 'newest':
				default:
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
		});

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getReadingTimeText(minutes: number) {
		return minutes === 1 ? '1 min read' : `${minutes} mins read`;
	}

	function getStatusBadgeClass(published: boolean) {
		return published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
	}

	function getStatusText(published: boolean) {
		return published ? 'Published' : 'Draft';
	}

	function createNewBlog() {
		goto('/blogs/new');
	}

	function editBlog(id: number) {
		goto(`/blogs/${id}`);
	}

	function previewBlog(blog: any) {
		selectedBlog = blog;
		showPreviewModal = true;
	}

	function viewBlog(slug: string) {
		window.open(`/blog/${slug}`, '_blank');
	}

	function handlePreviewClose() {
		showPreviewModal = false;
		selectedBlog = null;
	}

	function handlePreviewEdit(event: CustomEvent) {
		editBlog(event.detail.id);
		handlePreviewClose();
	}

	async function deleteBlog(id: number, title: string) {
		if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
			return;
		}

		try {
			const formData = new FormData();
			formData.append('id', id.toString());

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				location.reload();
			} else {
				alert('Failed to delete blog');
			}
		} catch (error) {
			console.error('Error deleting blog:', error);
			alert('Failed to delete blog');
		}
	}
</script>

<svelte:head>
	<title>Blog Management - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Blog Management</h1>
			<p class="mt-1 text-gray-600">Manage your blog posts and articles</p>
		</div>

		<button
			on:click={createNewBlog}
			class="hover:bg-primary/90 flex items-center rounded-lg bg-black px-4 py-2 text-white transition-colors"
		>
			<Plus class="mr-2 h-4 w-4" />
			New Blog Post
		</button>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<div class="rounded-lg border bg-white p-6">
			<div class="flex items-center">
				<FileText class="h-8 w-8 text-blue-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Total Posts</p>
					<p class="text-2xl font-bold text-gray-900">{data.blogs.length}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-white p-6">
			<div class="flex items-center">
				<Globe class="h-8 w-8 text-green-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Published</p>
					<p class="text-2xl font-bold text-gray-900">
						{data.blogs.filter((blog) => blog.published).length}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-white p-6">
			<div class="flex items-center">
				<FileText class="h-8 w-8 text-yellow-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Drafts</p>
					<p class="text-2xl font-bold text-gray-900">
						{data.blogs.filter((blog) => !blog.published).length}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-white p-6">
			<div class="flex items-center">
				<Star class="h-8 w-8 text-purple-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Featured</p>
					<p class="text-2xl font-bold text-gray-900">
						{data.blogs.filter((blog) => blog.featured).length}
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-lg border bg-white p-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search blogs..."
					class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2"
				/>
			</div>

			<select
				bind:value={filterStatus}
				class="focus:ring-primary focus:border-primary rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
			>
				<option value="all">All Status</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>

			<select
				bind:value={filterFeatured}
				class="focus:ring-primary focus:border-primary rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
			>
				<option value="all">All Posts</option>
				<option value="featured">Featured</option>
				<option value="normal">Normal</option>
			</select>

			<select
				bind:value={sortBy}
				class="focus:ring-primary focus:border-primary rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
			>
				<option value="newest">Newest First</option>
				<option value="oldest">Oldest First</option>
				<option value="title">Title A-Z</option>
			</select>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg border bg-white">
		{#if filteredBlogs.length === 0}
			<div class="p-12 text-center">
				<FileText class="mx-auto mb-4 h-12 w-12 text-gray-400" />
				<h3 class="mb-2 text-lg font-medium text-gray-900">
					{searchQuery || filterStatus !== 'all' || filterFeatured !== 'all'
						? 'No blogs found'
						: 'No blog posts yet'}
				</h3>
				<p class="mb-6 text-gray-600">
					{searchQuery || filterStatus !== 'all' || filterFeatured !== 'all'
						? 'Try adjusting your search or filters.'
						: 'Get started by creating your first blog post.'}
				</p>
				{#if !searchQuery && filterStatus === 'all' && filterFeatured === 'all'}
					<button
						on:click={createNewBlog}
						class="bg-primary hover:bg-primary/90 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
					>
						<Plus class="mr-2 h-4 w-4" />
						Create Your First Blog Post
					</button>
				{/if}
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Blog Post
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Status
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Tags
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Created
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each filteredBlogs as blog}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											{#if blog.imageUrl}
												<img
													src={blog.imageUrl}
													alt={blog.title}
													class="h-16 w-16 rounded-lg object-cover"
												/>
											{:else}
												<div
													class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200"
												>
													<Image class="h-6 w-6 text-gray-400" />
												</div>
											{/if}
										</div>

										<div class="min-w-0 flex-1">
											<div class="flex items-center space-x-2">
												<h3 class="truncate text-sm font-medium text-gray-900">
													{blog.title}
												</h3>
												{#if blog.featured}
													<Star class="h-4 w-4 fill-current text-yellow-500" title="Featured" />
												{/if}
											</div>

											{#if blog.description}
												<p class="mt-1 truncate text-sm text-gray-600">
													{blog.description}
												</p>
											{/if}

											<div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
												<span class="flex items-center">
													<Clock class="mr-1 h-3 w-3" />
													{getReadingTimeText(blog.readingTime)}
												</span>
												{#if blog.publishedAt}
													<span class="flex items-center">
														<Calendar class="mr-1 h-3 w-3" />
														Published {formatDate(blog.publishedAt)}
													</span>
												{/if}
											</div>
										</div>
									</div>
								</td>

								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadgeClass(
											blog.published
										)}"
									>
										{getStatusText(blog.published)}
									</span>
								</td>

								<td class="px-6 py-4">
									<div class="flex flex-wrap gap-1">
										{#each blog.tags.slice(0, 3) as tag}
											<span
												class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
											>
												<Tag class="mr-1 h-2 w-2" />
												{tag.name}
											</span>
										{/each}
										{#if blog.tags.length > 3}
											<span class="text-xs text-gray-500">
												+{blog.tags.length - 3} more
											</span>
										{/if}
									</div>
								</td>

								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
									{formatDate(blog.createdAt)}
								</td>

								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<div class="flex items-center space-x-3">
										<button
											on:click={() => previewBlog(blog)}
											class="text-green-600 transition-colors hover:text-green-800"
											title="Preview"
										>
											<Eye class="h-4 w-4" />
										</button>

										<button
											on:click={() => editBlog(blog.id)}
											class="text-blue-600 transition-colors hover:text-blue-800"
											title="Edit"
										>
											<Edit class="h-4 w-4" />
										</button>

										{#if blog.published}
											<button
												on:click={() => viewBlog(blog.slug)}
												class="text-purple-600 transition-colors hover:text-purple-800"
												title="View Live"
											>
												<ExternalLink class="h-4 w-4" />
											</button>
										{/if}

										<button
											on:click={() => deleteBlog(blog.id, blog.title)}
											class="text-red-600 transition-colors hover:text-red-800"
											title="Delete"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	{#if filteredBlogs.length > 0}
		<div class="flex items-center justify-between text-sm text-gray-600">
			<p>
				Showing {filteredBlogs.length} of {data.blogs.length} blog posts
			</p>

			{#if searchQuery || filterStatus !== 'all' || filterFeatured !== 'all'}
				<button
					on:click={() => {
						searchQuery = '';
						filterStatus = 'all';
						filterFeatured = 'all';
					}}
					class="text-primary hover:text-primary/80 transition-colors"
				>
					Clear filters
				</button>
			{/if}
		</div>
	{/if}
</div>

<BlogPreviewModal
	bind:show={showPreviewModal}
	blog={selectedBlog}
	on:close={handlePreviewClose}
	on:edit={handlePreviewEdit}
/>
