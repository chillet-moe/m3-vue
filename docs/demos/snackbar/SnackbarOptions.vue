<script setup lang="ts">
import { Snackbar } from '@/components/Snackbar';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%)">
    <Snackbar :action-label="undefined" :dismissible="false"> Supporting text only </Snackbar>

    <Snackbar action-label="Undo" :dismissible="false"> Action only </Snackbar>

    <Snackbar :action-label="undefined" dismissible> Dismiss only </Snackbar>

    <Snackbar action-label="Undo" dismissible> Action and dismiss </Snackbar>

    <Snackbar action-label="Undo" action-disabled> Disabled action </Snackbar>
  </div>
</template>
