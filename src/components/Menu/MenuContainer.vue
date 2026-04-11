<script setup lang="ts">
defineSlots<{
  /** Menu section content, such as labels, items, and dividers. */
  default(): any;
}>();
</script>

<template>
  <div role="presentation" class="m3-menu-container" data-scope="menu" data-part="container">
    <slot />
  </div>
</template>
