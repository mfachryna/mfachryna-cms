<script lang="ts">
  import { Calendar, Clock, User, Eye, Tag as TagIcon } from 'lucide-svelte';
  
  export let date: string | null = null;
  export let readingTime: number | null = null;
  export let views: number | null = null;
  export let author: string | null = null;
  export let tags: any[] = [];
  export let textColor = 'text-gray-500';
  export let size = 'text-sm';
  
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function getReadingTimeText(minutes: number) {
    return minutes === 1 ? '1 min read' : `${minutes} mins read`;
  }
</script>

<div class="flex flex-wrap items-center gap-4 {size} {textColor}">
  {#if author}
    <div class="flex items-center">
      <User class="w-4 h-4 mr-1" />
      <span>{author}</span>
    </div>
  {/if}
  
  {#if date}
    <div class="flex items-center">
      <Calendar class="w-4 h-4 mr-1" />
      <span>{formatDate(date)}</span>
    </div>
  {/if}
  
  {#if readingTime}
    <div class="flex items-center">
      <Clock class="w-4 h-4 mr-1" />
      <span>{getReadingTimeText(readingTime)}</span>
    </div>
  {/if}
  
  {#if views}
    <div class="flex items-center">
      <Eye class="w-4 h-4 mr-1" />
      <span>{views} views</span>
    </div>
  {/if}
  
  {#if tags.length > 0}
    <div class="flex items-center">
      <TagIcon class="w-4 h-4 mr-1" />
      <span>{tags.length} tag{tags.length !== 1 ? 's' : ''}</span>
    </div>
  {/if}
</div>