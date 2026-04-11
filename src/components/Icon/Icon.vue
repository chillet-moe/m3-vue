<script setup lang="ts">
type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name: string;
};

defineProps<IconProps>();
</script>

<template>
  <span :class="'m3-icon'" data-scope="icon" data-part="root">{{ name }}</span>
</template>

<style src="./Icon.css"></style>
