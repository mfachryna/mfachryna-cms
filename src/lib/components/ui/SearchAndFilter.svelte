<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, Filter, X } from 'lucide-svelte';
  
  export let searchPlaceholder = 'Search...';
  export let searchValue = '';
  export let filterOptions: Array<{value: string, label: string}> = [];
  export let selectedFilter = 'all';
  export let showSearch = true;
  export let showFilter = true;
  
  const dispatch = createEventDispatcher();
  
  function handleSearchInput(event: Event) {
    searchValue = (event.target as HTMLInputElement).value;
    dispatch('search', { query: searchValue });
  }
  
  function handleFilterChange(event: Event) {
    selectedFilter = (event.target as HTMLSelectElement).value;
    dispatch('filter', { value: selectedFilter });
  }
  
  function clearSearch() {
    searchValue = '';
    dispatch('search', { query: '' });
  }
</script>

<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
  <div class="flex flex-col md:flex-row gap-4">
    {#if showSearch}
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          bind:value={searchValue}
          on:input={handleSearchInput}
          placeholder={searchPlaceholder}
          class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {#if searchValue}
          <button
            on:click={clearSearch}
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X class="w-4 h-4" />
          </button>
        {/if}
      </div>
    {/if}
    
    {#if showFilter && filterOptions.length > 0}
      <div class="relative">
        <select
          bind:value={selectedFilter}
          on:change={handleFilterChange}
          class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {#each filterOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <Filter class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    {/if}
  </div>
</div>