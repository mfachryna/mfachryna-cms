<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { AlertTriangle, X } from 'lucide-svelte';
  
  export let isOpen: boolean = false;
  export let title: string = 'Confirm Action';
  export let message: string = 'Are you sure you want to proceed?';
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let type: 'danger' | 'warning' | 'info' = 'warning';
  export let isLoading: boolean = false;
  
  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();
  
  function handleConfirm() {
    dispatch('confirm');
  }
  
  function handleCancel() {
    if (!isLoading) {
      dispatch('cancel');
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click={handleCancel}
    on:keydown={handleKeydown}
  >
    <div 
      class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      on:click|stopPropagation
    >
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          {#if type === 'danger'}
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
          {:else if type === 'warning'}
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-yellow-600" />
            </div>
          {:else}
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-blue-600" />
            </div>
          {/if}
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>
        <button
          type="button"
          on:click={handleCancel}
          disabled={isLoading}
          class="ml-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-sm text-gray-600">
          {message}
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          on:click={handleCancel}
          disabled={isLoading}
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          on:click={handleConfirm}
          disabled={isLoading}
          class="px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 disabled:opacity-50
            {type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
             type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 
             'bg-blue-600 hover:bg-blue-700'}"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {/if}
          <span>{confirmText}</span>
        </button>
      </div>
    </div>
  </div>
{/if}