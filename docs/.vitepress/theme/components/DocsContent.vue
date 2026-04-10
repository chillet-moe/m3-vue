<script setup lang="ts">
import { Content } from 'vitepress';

import DocsOutline from './DocsOutline.vue';
import DocsPager from './DocsPager.vue';
</script>

<template>
  <div class="docs-content-shell">
    <main class="docs-main">
      <article class="docs-page-card vp-doc">
        <Content />
      </article>

      <DocsPager />
    </main>

    <DocsOutline />
  </div>
</template>

<style scoped>
.docs-content-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: start;
}

.docs-main {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem 2rem;
}

.docs-page-card {
  display: block;
  max-inline-size: 60rem;
  inline-size: 100%;
  margin-inline: auto;
  padding: 1.25rem;
  border-radius: 1.75rem;
  background: var(--vp-c-bg);
}

@media (max-width: 80rem) {
  .docs-content-shell {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 64rem) {
  .docs-main {
    padding-inline: 1rem;
  }
}
</style>
