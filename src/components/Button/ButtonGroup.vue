<script setup lang="ts">
import style from './Button.module.css';
</script>

<template>
  <fieldset :class="style.ButtonGroup">
    <slot/>
  </fieldset>
</template>

<style scoped></style>
