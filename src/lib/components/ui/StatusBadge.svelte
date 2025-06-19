<script lang="ts">
  export let status: 'draft' | 'published' | 'featured' | 'archived' | 'in-progress' | 'completed' | 'paused';
  export let size: 'sm' | 'md' | 'lg' = 'sm';
  
  $: sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  $: statusClasses = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    featured: 'bg-purple-100 text-purple-800',
    archived: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800'
  };
  
  $: classes = `inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${statusClasses[status]}`;
</script>

<span class={classes}>
  <slot>
    {#if status === 'draft'}
      Draft
    {:else if status === 'published'}
      Published
    {:else if status === 'featured'}
      ⭐ Featured
    {:else if status === 'archived'}
      Archived
    {:else if status === 'in-progress'}
      In Progress
    {:else if status === 'completed'}
      Completed
    {:else if status === 'paused'}
      Paused
    {/if}
  </slot>
</span>