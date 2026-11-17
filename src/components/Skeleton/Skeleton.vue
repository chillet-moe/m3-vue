<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

export type SkeletonProps = {
  /** Element tag used for the skeleton root. */
  as?: string;

  /** Loading placeholder animation. */
  animation?: 'pulse' | 'wave' | 'none';
};

const { as = 'div', animation = 'pulse' } = defineProps<SkeletonProps>();
// Inert controls still participate in form submission and validation unless disabled.
const controlTag = computed(() => {
  const tag = as.toLowerCase();
  return /^(button|fieldset|input|optgroup|option|select|textarea)$/.test(tag) ? tag : undefined;
});

function resolveType(type: unknown) {
  // A disabled submit control can still become the form's default button.
  if (controlTag.value === 'button' || (controlTag.value === 'input' && /^(submit|image)$/i.test(String(type)))) {
    return 'button';
  }

  return type;
}
</script>

<template>
  <component
    :is="as"
    v-bind="$attrs"
    class="m3-skeleton"
    data-scope="skeleton"
    data-part="root"
    :data-animation="animation"
    :disabled="controlTag ? true : $attrs.disabled"
    :type="resolveType($attrs.type)"
    aria-hidden="true"
    inert
  />
</template>

<style src="./Skeleton.css"></style>
