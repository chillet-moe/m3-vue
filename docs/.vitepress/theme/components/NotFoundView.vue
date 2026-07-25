<script setup lang="ts">
import { withBase } from 'vitepress';

import { Button, Card } from '@/index';
</script>

<template>
  <div class="docs-not-found">
    <Card color="filled" class="docs-not-found-card">
      <span class="docs-not-found-icon material-symbols-outlined" aria-hidden="true">search_off</span>
      <h1 class="docs-not-found-title">Page Not Found</h1>
      <p class="docs-not-found-text">The page you're looking for doesn't exist or has been moved.</p>
      <Button variant="filled" size="medium" :href="withBase('/')" leading-icon="home"> Back to Home </Button>
    </Card>
  </div>
</template>

<style scoped>
.docs-not-found {
  display: grid;
  place-items: center;
  min-block-size: 60vh;
  padding: 1.5rem;
}

.docs-not-found-card {
  display: grid;
  gap: 1rem;
  justify-items: center;
  text-align: center;
  padding: 3rem;
  border-radius: 1.75rem;
  overflow: clip;
}

.docs-not-found-icon {
  font-size: 4rem;
  color: var(--md-sys-color-error);
}

.docs-not-found-title {
  margin: 0;
  font-size: 1.75rem;
}

.docs-not-found-text {
  margin: 0;
  max-inline-size: 28rem;
  color: var(--vp-c-text-2);
  font-size: 1rem;
}
</style>
