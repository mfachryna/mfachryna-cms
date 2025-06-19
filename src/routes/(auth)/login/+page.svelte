<script lang="ts">
  import { enhance } from '$app/forms';
  import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-svelte';

  export let form;
  export let data;

  let showPassword = false;
</script>

<svelte:head>
  <title>Admin Login</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900">Admin Portal</h1>
      <p class="mt-2 text-gray-600">Sign in to your account</p>
    </div>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form method="POST" use:enhance class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              value={form?.data?.email ?? ''}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svelte:component 
                this={showPassword ? EyeOff : Eye} 
                class="h-4 w-4 text-gray-400 hover:text-gray-500" 
              />
            </button>
          </div>
        </div>

        {#if form?.error}
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <AlertCircle class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">{form.error}</p>
              </div>
            </div>
          </div>
        {/if}

        <div>
          <button
            type="submit"
            class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <LogIn class="w-4 h-4 mr-2" />
            Sign in
          </button>
        </div>
      </form>

      <!-- Only show the "Create account" link if there are NO users -->
      {#if !data.hasUsers}
        <div class="mt-6">
          <div class="text-center">
            <p class="text-xs text-gray-500">
              Don't have an account? 
              <a href="/setup" class="font-medium text-blue-600 hover:text-blue-500">
                Create one
              </a>
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>