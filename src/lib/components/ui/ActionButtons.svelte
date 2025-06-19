<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Eye, Edit, ExternalLink, Trash2, Play, Pause, Archive } from 'lucide-svelte';
  
  export let item: any;
  export let showPreview = true;
  export let showEdit = true;
  export let showView = true;
  export let showDelete = true;
  export let showToggle = false;
  export let showArchive = false;
  export let isPublished = false;
  export let isPaused = false;
  
  const dispatch = createEventDispatcher();
  
  function handlePreview() {
    dispatch('preview', { item });
  }
  
  function handleEdit() {
    dispatch('edit', { item });
  }
  
  function handleView() {
    dispatch('view', { item });
  }
  
  function handleDelete() {
    dispatch('delete', { item });
  }
  
  function handleToggle() {
    dispatch('toggle', { item });
  }
  
  function handleArchive() {
    dispatch('archive', { item });
  }
</script>

<div class="flex items-center space-x-3">
  {#if showPreview}
    <button
      on:click={handlePreview}
      class="text-green-600 hover:text-green-800 transition-colors"
      title="Preview"
    >
      <Eye class="w-4 h-4" />
    </button>
  {/if}
  
  {#if showEdit}
    <button
      on:click={handleEdit}
      class="text-blue-600 hover:text-blue-800 transition-colors"
      title="Edit"
    >
      <Edit class="w-4 h-4" />
    </button>
  {/if}
  
  {#if showView && isPublished}
    <button
      on:click={handleView}
      class="text-purple-600 hover:text-purple-800 transition-colors"
      title="View Live"
    >
      <ExternalLink class="w-4 h-4" />
    </button>
  {/if}
  
  {#if showToggle}
    <button
      on:click={handleToggle}
      class="{isPaused ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'} transition-colors"
      title={isPaused ? 'Resume' : 'Pause'}
    >
      {#if isPaused}
        <Play class="w-4 h-4" />
      {:else}
        <Pause class="w-4 h-4" />
      {/if}
    </button>
  {/if}
  
  {#if showArchive}
    <button
      on:click={handleArchive}
      class="text-gray-600 hover:text-gray-800 transition-colors"
      title="Archive"
    >
      <Archive class="w-4 h-4" />
    </button>
  {/if}
  
  {#if showDelete}
    <button
      on:click={handleDelete}
      class="text-red-600 hover:text-red-800 transition-colors"
      title="Delete"
    >
      <Trash2 class="w-4 h-4" />
    </button>
  {/if}
</div>