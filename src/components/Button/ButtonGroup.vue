<script setup lang="ts">
import style from './ButtonGroup.module.css';
</script>

<template>
  <fieldset :class="style.buttonGroup">
    <slot/>
  </fieldset>
</template>

<style scoped></style>
