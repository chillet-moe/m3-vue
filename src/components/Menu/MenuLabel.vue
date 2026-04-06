<script setup lang="ts">
defineSlots<{
  /** Section label content. */
  default(): any;
}>();
</script>

<template>
  <div class="m3-menu-label">
    <slot />
  </div>
</template>
