<script setup lang="ts">
export type SkeletonProps = {
  /** Element tag used for the skeleton root. */
  as?: string;

  /** Loading placeholder animation. */
  animation?: 'pulse' | 'wave' | 'none';
};

const props = withDefaults(defineProps<SkeletonProps>(), {
  as: 'div',
  animation: 'pulse',
});
</script>

<template>
  <component
    :is="props.as"
    class="m3-skeleton"
    data-scope="skeleton"
    data-part="root"
    :data-animation="props.animation"
    aria-hidden="true"
  />
</template>

<style src="./Skeleton.css"></style>
