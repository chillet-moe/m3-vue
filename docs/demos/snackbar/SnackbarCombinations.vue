<script setup lang="ts">
import { Snackbar } from '@/components/Snackbar';
</script>

<template>
  <div style="display: grid; gap: 1.5rem">
    <div style="display: grid; gap: 0.75rem">
      <div>Single-line</div>
      <Snackbar :action-label="undefined" :dismissible="false"> File moved to trash </Snackbar>
    </div>

    <div style="display: grid; gap: 0.75rem">
      <div>Single-line with action</div>
      <Snackbar action-label="Undo" :dismissible="false"> File moved to trash </Snackbar>
    </div>

    <div style="display: grid; gap: 0.75rem">
      <div>Two lines</div>
      <Snackbar :action-label="undefined" :dismissible="false">
        Your changes were saved locally and will sync when the connection is available again.
      </Snackbar>
    </div>

    <div style="display: grid; gap: 0.75rem">
      <div>Two lines with longer action</div>
      <Snackbar action-label="Review details" action-on-new-line>
        Your changes were saved locally and will sync when the connection is available again.
      </Snackbar>
    </div>
  </div>
</template>
