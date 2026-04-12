<script setup lang="ts">
type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name: string;

  /** The size of the Icon. Accepts any valid CSS font-size value, such as "24px", "1.5em". */
  size?: string;
};

const { size } = defineProps<IconProps>();
</script>

<template>
  <span class="m3-icon" data-scope="icon" data-part="root" :style="size ? { fontSize: size } : undefined">{{
    name
  }}</span>
</template>

<style src="./Icon.css"></style>
