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
        <div id="docs-api-appendix" class="docs-api-appendix" />
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
  gap: 1rem;
  padding-inline: 1rem;
  padding-block-end: 1.5rem;
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

.docs-api-appendix:empty {
  display: none;
}

.docs-api-appendix:not(:empty) {
  margin-block-start: 2rem;
  padding-block-start: 2.75rem;
  border-block-start: 1px solid --translucent(var(--md-sys-color-on-surface), 0.12);
}

.docs-api-appendix:not(:empty)::before {
  display: block;
  margin-block: -1.75rem 1.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  content: 'API Reference';
}

.docs-api-appendix:not(:empty):lang(zh-Hans)::before {
  content: 'API 参考';
}

@media (max-width: 80rem) {
  .docs-content-shell {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 64rem) {
  .docs-main {
    padding-inline: 0.5rem;
  }

  .docs-page-card {
    padding: 1rem 0.75rem;
    border-radius: 1rem;
    overflow-x: auto;
  }
}
</style>
