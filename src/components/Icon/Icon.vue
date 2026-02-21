<script setup lang="ts">
import styles from './Icon.module.css';

type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name: string;
};

defineProps<IconProps>();
</script>

<template>
  <span :class="styles.icon">{{ name }}</span>
</template>