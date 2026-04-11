<script setup lang="ts">
defineSlots<{
  /** Section label content. */
  default(): any;
}>();
</script>

<template>
  <div class="m3-menu-label" data-scope="menu" data-part="label">
    <slot />
  </div>
</template>
