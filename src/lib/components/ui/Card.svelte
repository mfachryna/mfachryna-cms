<script lang="ts">
  export let padding = 'p-6';
  export let shadow = 'shadow-sm';
  export let rounded = 'rounded-lg';
  export let background = 'bg-white';
  export let border = 'border border-gray-200';
  export let hover = '';
  
  $: classes = `${background} ${border} ${rounded} ${shadow} ${padding} ${hover}`.trim();
</script>

<div class={classes}>
  <slot />
</div>