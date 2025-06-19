<script lang="ts">
  import { enhance } from '$app/forms';
  import { 
    User, 
    Lock, 
    Save,
    Eye,
    EyeOff,
    Check,
    X
  } from 'lucide-svelte';

  export let data;
  export let form;

  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;
</script>

<div class="max-w-4xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
    <p class="text-gray-600 mt-2">Manage your account settings</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    <!-- Profile Settings -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center mb-4">
        <User class="w-5 h-5 mr-2 text-gray-600" />
        <h2 class="text-xl font-semibold">Profile Information</h2>
      </div>
      
      <form method="POST" action="?/updateProfile" use:enhance class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={data.user?.name || ''}
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={data.user?.email || ''}
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save class="w-4 h-4 mr-2" />
            Save Profile
          </button>
        </div>
      </form>
    </div>

    <!-- Change Password -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center mb-4">
        <Lock class="w-5 h-5 mr-2 text-gray-600" />
        <h2 class="text-xl font-semibold">Change Password</h2>
      </div>
      
      <form method="POST" action="?/changePassword" use:enhance class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <div class="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              name="currentPassword"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              on:click={() => showCurrentPassword = !showCurrentPassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svelte:component this={showCurrentPassword ? EyeOff : Eye} class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              required
              minlength="8"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              on:click={() => showNewPassword = !showNewPassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svelte:component this={showNewPassword ? EyeOff : Eye} class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <div class="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              on:click={() => showConfirmPassword = !showConfirmPassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svelte:component this={showConfirmPassword ? EyeOff : Eye} class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Lock class="w-4 h-4 mr-2" />
            Update Password
          </button>
        </div>
      </form>
    </div>

  </div>
</div>

<!-- Success/Error Messages -->
{#if form?.success}
  <div class="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
    <Check class="w-5 h-5 mr-2" />
    {form.message}
  </div>
{/if}

{#if form?.error}
  <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
    <X class="w-5 h-5 mr-2" />
    {form.error}
  </div>
{/if}