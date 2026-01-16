<script lang="ts" setup>
import { Story, Variant } from 'histoire';

const props = defineProps<{
  story: Story;
  variant?: Variant;
}>();

function hasWrapper() {
  return props.story.meta?.wrapper !== false && props.variant?.meta?.wrapper !== false;
}
</script>

<template>
  <template v-if="!hasWrapper()">
    <slot />
  </template>
  <div v-else class="global-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.global-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>
