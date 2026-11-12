<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

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

const tag = computed(() => props.as.toLowerCase());
// Inert controls still participate in form submission and validation unless disabled.
const isFormControl = computed(() => /^(button|fieldset|input|optgroup|option|select|textarea)$/.test(tag.value));

function resolveType(type: unknown) {
  // A disabled submit control can still become the form's default button.
  if (tag.value === 'button' || (tag.value === 'input' && /^(submit|image)$/i.test(String(type)))) {
    return 'button';
  }

  return type;
}
</script>

<template>
  <component
    :is="props.as"
    v-bind="$attrs"
    class="m3-skeleton"
    data-scope="skeleton"
    data-part="root"
    :data-animation="props.animation"
    :disabled="isFormControl ? true : $attrs.disabled"
    :type="resolveType($attrs.type)"
    aria-hidden="true"
    inert
  />
</template>

<style src="./Skeleton.css"></style>
