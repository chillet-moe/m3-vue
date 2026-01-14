<script setup lang="ts">
</script>

<template>
  <div class="variant-layout">
    <slot />
  </div>
</template>

<style scoped>
.variant-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>
