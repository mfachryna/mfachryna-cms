<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		LayoutDashboard,
		FileText,
		Briefcase,
		GraduationCap,
		Tags,
		Mail,
		Settings,
		ChevronLeft,
		Menu,
		Bell,
		Search,
		User,
		LogOut
	} from 'lucide-svelte';

	export let data;

	let sidebarCollapsed = false;
	let showProfileDropdown = false;


	$: navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
		{ name: 'Blogs', href: '/blogs', icon: FileText, badge: null },
		{ name: 'Projects', href: '/projects', icon: Briefcase, badge: null },
		{ name: 'Experiences', href: '/experiences', icon: GraduationCap, badge: null },
		{ name: 'Tags', href: '/tags', icon: Tags, badge: null },
		{ 
			name: 'Contacts', 
			href: '/contacts', 
			icon: Mail, 
			badge: data.newContactsCount > 0 ? data.newContactsCount.toString() : null 
		},
		{ name: 'Settings', href: '/settings', icon: Settings, badge: null }
	];

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function handleClickOutside() {
		showProfileDropdown = false;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-50 transition-all duration-300 {sidebarCollapsed
			? 'w-16'
			: 'w-64'} border-r border-gray-200 bg-white"
	>
		<!-- Sidebar Header -->
		<div class="flex h-16 items-center justify-between px-4">
			{#if !sidebarCollapsed}
				<h1 class="text-xl font-semibold text-gray-900">Admin Panel</h1>
			{/if}
			<button
				on:click={toggleSidebar}
				class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
			>
				<ChevronLeft class="h-5 w-5 {sidebarCollapsed ? 'rotate-180' : ''} transition-transform" />
			</button>
		</div>

		<!-- Navigation -->
		<nav class="mt-8 px-4">
			<ul class="space-y-1">
				{#each navigation as item}
					<li>
						<a
							href={item.href}
							class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname === item.href ||
							($page.url.pathname.startsWith(item.href) && item.href !== '/dashboard')
								? 'bg-blue-50 text-blue-700'
								: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}"
						>
							<svelte:component
								this={item.icon}
								class="h-5 w-5 {sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0"
							/>
							{#if !sidebarCollapsed}
								<span>{item.name}</span>
								{#if item.badge}
									<span class="ml-auto rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
										{item.badge}
									</span>
								{/if}
							{:else if item.badge}
								<!-- Show badge as a dot when sidebar is collapsed -->
								<span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<!-- Main Content -->
	<div class="transition-all duration-300 {sidebarCollapsed ? 'ml-16' : 'ml-64'}">
		<!-- Top Header -->
		<header class="border-b border-gray-200 bg-white">
			<div class="flex h-16 items-center justify-between px-6">
				<div class="flex items-center">
					<button 
						on:click={toggleSidebar}
						class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
					>
						<Menu class="h-5 w-5" />
					</button>
				</div>

				<div class="flex items-center space-x-4">
					<!-- Search -->
					<div class="relative hidden md:block">
						<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search..."
							class="w-80 rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Notifications -->
					<div class="relative">
						<button 
							class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 relative"
							title="Notifications"
						>
							<Bell class="h-5 w-5" />
							{#if data.totalNotifications > 0}
								<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
									{data.totalNotifications > 99 ? '99+' : data.totalNotifications}
								</span>
							{/if}
						</button>
					</div>

					<!-- Profile Dropdown -->
					<div class="relative">
						<button
							on:click={() => showProfileDropdown = !showProfileDropdown}
							class="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
						>
							<div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
								<User class="h-4 w-4 text-white" />
							</div>
							<span class="ml-2 text-sm font-medium text-gray-900 hidden sm:block">
								{data.user?.name}
							</span>
						</button>

						{#if showProfileDropdown}
							<div class="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
								<div class="p-3 border-b border-gray-100">
									<p class="text-sm font-medium text-gray-900">{data.user?.name}</p>
									<p class="text-sm text-gray-500">{data.user?.email}</p>
								</div>
								<div class="p-1">
									<a
										href="/settings"
										class="flex items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
									>
										<Settings class="mr-2 h-4 w-4" />
										Settings
									</a>
									<form method="POST" action="/logout" use:enhance>
										<button
											type="submit"
											class="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
										>
											<LogOut class="mr-2 h-4 w-4" />
											Sign out
										</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="p-6">
			<slot />
		</main>
	</div>
</div>

{#if showProfileDropdown}
	<div
		class="fixed inset-0 z-40"
		on:click={handleClickOutside}
		on:keydown={(e) => e.key === 'Escape' && (showProfileDropdown = false)}
		role="button"
		tabindex="0"
	></div>
{/if}
