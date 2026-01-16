<script setup lang="ts">
import style from './ButtonGroup.module.css';

type Props = {
  type?: 'standard' | 'connected';
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
};

const { type = 'standard', size = 'small' } = defineProps<Props>();

</script>

<template>
  <fieldset :class="[style.buttonGroup, style[type], style[size]]">
    <slot/>
  </fieldset>
</template>

<style scoped></style>
