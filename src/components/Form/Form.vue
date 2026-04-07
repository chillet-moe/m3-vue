<script setup lang="ts">
export type FormProps = {
  /** Optional accessible name for the form. */
  ariaLabel?: string;
};

defineProps<FormProps>();
</script>

<template>
  <form :class="'m3-form'" :aria-label="ariaLabel" novalidate>
    <slot />
  </form>
</template>

<style src="./Form.css"></style>
