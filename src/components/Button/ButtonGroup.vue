<script setup lang="ts">
import style from './ButtonGroup.module.css';
</script>

<template>
  <fieldset :class="style.ButtonGroup">
    <slot/>
  </fieldset>
</template>

<style scoped></style>
