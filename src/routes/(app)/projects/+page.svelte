<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import ActionButtons from '$lib/components/ui/ActionButtons.svelte';
	import SearchAndFilter from '$lib/components/ui/SearchAndFilter.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import {
		Plus,
		FolderOpen,
		Calendar,
		Clock,
		ExternalLink,
		Github,
		Code,
		Palette,
		Globe,
		TrendingUp,
		Star,
		Archive,
		Play,
		Pause
	} from 'lucide-svelte';
	import ProjectPreviewModal from '$lib/components/ProjectPreviewModal.svelte';

	export let data;
	export let form;

	let searchQuery = '';
	let filterFeatured = 'all';
	let filterTech = 'all';
	let sortBy = 'newest';

	let showDeleteModal = false;
	let projectToDelete: any = null;
	let showPreviewModal = false;
	let selectedProject: any = null;

	$: featuredOptions = [
		{ value: 'all', label: 'All Projects' },
		{ value: 'featured', label: 'Featured Only' },
		{ value: 'regular', label: 'Regular Only' }
	];

	$: techOptions = [
		{ value: 'all', label: 'All Technologies' },
		...data.technologies.map((tech) => ({ value: tech.id.toString(), label: tech.name }))
	];

	$: filteredProjects = data.projects
		.filter((project) => {
			const matchesSearch =
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesFeatured =
				filterFeatured === 'all' ||
				(filterFeatured === 'featured' && project.featured) ||
				(filterFeatured === 'regular' && !project.featured);

			const matchesTech =
				filterTech === 'all' ||
				project.tags.some((tag) => tag.isTech && tag.id.toString() === filterTech);

			return matchesSearch && matchesFeatured && matchesTech;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'title':
					return a.title.localeCompare(b.title);
				case 'order':
					return a.order - b.order;
				default:
					return 0;
			}
		});

	$: getTechTags = (project: any) => project.tags.filter((tag: any) => tag.isTech);

	function createNewProject() {
		goto('/projects/new');
	}

	function editProject(project: any) {
		goto(`/projects/${project.id}`);
	}

	function viewProject(project: any) {
		if (project.liveUrl) {
			window.open(project.liveUrl, '_blank');
		}
	}

	function viewGithub(project: any) {
		if (project.githubUrl) {
			window.open(project.githubUrl, '_blank');
		}
	}

	function confirmDelete(project: any) {
		projectToDelete = project;
		showDeleteModal = true;
	}

	function handleDeleteConfirm() {
		if (projectToDelete) {
			const formData = new FormData();
			formData.append('projectId', projectToDelete.id.toString());

			fetch('?/delete', {
				method: 'POST',
				body: formData
			}).then(() => {
				window.location.reload();
			});
		}

		showDeleteModal = false;
		projectToDelete = null;
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function previewProject(project: any) {
		selectedProject = project;
		showPreviewModal = true;
	}

	function deleteProject(project: any) {
		projectToDelete = project;
		showDeleteModal = true;
	}

	function handlePreviewEdit(event: CustomEvent) {
		const { project } = event.detail;
		editProject(project.id);
	}

	function handleFilterChange(event: CustomEvent) {
		selectedFilter = event.detail.value;
	}
</script>

<svelte:head>
	<title>Projects - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center text-2xl font-bold text-gray-900">
				<FolderOpen class="mr-3 h-6 w-6 text-blue-600" />
				Projects
			</h1>
			<p class="mt-1 text-gray-600">Manage your portfolio projects</p>
		</div>

		<button
			on:click={createNewProject}
			class="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			<Plus class="mr-2 h-4 w-4" />
			New Project
		</button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
		<Card padding="p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
						<FolderOpen class="h-4 w-4 text-blue-600" />
					</div>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Total Projects</p>
					<p class="text-2xl font-semibold text-gray-900">{data.projects.length}</p>
				</div>
			</div>
		</Card>

		<Card padding="p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
						<Star class="h-4 w-4 text-purple-600" />
					</div>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Featured</p>
					<p class="text-2xl font-semibold text-gray-900">
						{data.projects.filter((p) => p.featured).length}
					</p>
				</div>
			</div>
		</Card>

		<Card padding="p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
						<Globe class="h-4 w-4 text-green-600" />
					</div>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Live Projects</p>
					<p class="text-2xl font-semibold text-gray-900">
						{data.projects.filter((p) => p.liveUrl).length}
					</p>
				</div>
			</div>
		</Card>

		<Card padding="p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
						<Github class="h-4 w-4 text-gray-600" />
					</div>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Open Source</p>
					<p class="text-2xl font-semibold text-gray-900">
						{data.projects.filter((p) => p.githubUrl).length}
					</p>
				</div>
			</div>
		</Card>
	</div>

	<SearchAndFilter
		searchPlaceholder="Search projects..."
		bind:searchValue={searchQuery}
		filterOptions={featuredOptions}
		bind:selectedFilter={filterFeatured}
	/>

	<Card padding="p-4">
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="flex-1">
				<select
					bind:value={filterTech}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
				>
					{#each techOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<select
					bind:value={sortBy}
					class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
				>
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
					<option value="title">Title A-Z</option>
					<option value="order">Display Order</option>
				</select>
			</div>
		</div>
	</Card>

	{#if filteredProjects.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project}
				<Card hover="hover:shadow-md transition-shadow">
					<div class="relative mb-4">
						{#if project.imageUrl}
							<img
								src={project.imageUrl}
								alt={project.title}
								class="h-48 w-full rounded-lg object-cover"
							/>
						{:else}
							<div
								class="flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
							>
								<Code class="h-12 w-12 text-white" />
							</div>
						{/if}

						{#if project.featured}
							<div class="absolute top-3 left-3">
								<StatusBadge status="featured" />
							</div>
						{/if}

						<div
							class="bg-opacity-50 absolute top-3 right-3 rounded bg-black px-2 py-1 text-xs text-white"
						>
							#{project.order}
						</div>
					</div>

					<div class="space-y-3">
						<div>
							<h3 class="mb-1 text-lg font-semibold text-gray-900">{project.title}</h3>
							{#if project.subtitle}
								<p class="mb-2 text-sm text-gray-600">{project.subtitle}</p>
							{/if}
							<p class="line-clamp-3 text-sm text-gray-600">{project.description}</p>
						</div>

						{#if getTechTags(project).length > 0}
							<div class="flex flex-wrap gap-2">
								{#each getTechTags(project).slice(0, 3) as tech}
									<span
										class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
									>
										{tech.name}
									</span>
								{/each}
								{#if getTechTags(project).length > 3}
									<span
										class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
									>
										+{getTechTags(project).length - 3} more
									</span>
								{/if}
							</div>
						{/if}

						<div class="flex items-center justify-between text-xs text-gray-500">
							<div class="flex items-center">
								<Calendar class="mr-1 h-3 w-3" />
								{formatDate(project.createdAt)}
							</div>

							<div class="flex items-center space-x-3">
								{#if project.liveUrl}
									<button
										on:click={() => viewProject(project)}
										class="flex items-center text-blue-600 hover:text-blue-800"
										title="View Live"
									>
										<Globe class="mr-1 h-3 w-3" />
										Live
									</button>
								{/if}

								{#if project.githubUrl}
									<button
										on:click={() => viewGithub(project)}
										class="flex items-center text-gray-600 hover:text-gray-800"
										title="View GitHub"
									>
										<Github class="mr-1 h-3 w-3" />
										Code
									</button>
								{/if}
							</div>
						</div>

						<div class="border-t border-gray-200 pt-3">
							<ActionButtons
								item={project}
								showPreview={true}
								showView={!!project.liveUrl}
								showToggle={false}
								on:edit={() => editProject(project)}
								on:view={() => viewProject(project)}
								on:delete={() => confirmDelete(project)}
								on:preview={() => previewProject(project)}
							/>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{:else}
		<Card padding="p-12">
			<div class="text-center">
				<FolderOpen class="mx-auto mb-4 h-12 w-12 text-gray-400" />
				<h3 class="mb-2 text-lg font-medium text-gray-900">No projects found</h3>
				<p class="mb-6 text-gray-600">
					{searchQuery || filterFeatured !== 'all' || filterTech !== 'all'
						? 'Try adjusting your search or filters'
						: 'Get started by creating your first project'}
				</p>
				{#if !searchQuery && filterFeatured === 'all' && filterTech === 'all'}
					<button
						on:click={createNewProject}
						class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<Plus class="mr-2 h-4 w-4" />
						Create Project
					</button>
				{/if}
			</div>
		</Card>
	{/if}
</div>

<ConfirmationModal
	isOpen={showDeleteModal}
	title="Delete Project"
	message="Are you sure you want to delete '{projectToDelete?.title}'? This action cannot be undone."
	confirmText="Delete"
	confirmClass="bg-red-600 hover:bg-red-700"
	on:confirm={handleDeleteConfirm}
	on:cancel={() => (showDeleteModal = false)}
>
	<form
		method="POST"
		action="?/delete"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				showDeleteModal = false;
				projectToDelete = null;
			};
		}}
	>
		<input type="hidden" name="id" value={projectToDelete?.id} />
	</form>
</ConfirmationModal>

<ProjectPreviewModal
	bind:show={showPreviewModal}
	bind:project={selectedProject}
	on:edit={handlePreviewEdit}
	on:close={() => {
		showPreviewModal = false;
		selectedProject = null;
	}}
/>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
