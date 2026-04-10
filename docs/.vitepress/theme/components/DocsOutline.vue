<script setup lang="ts">
import { Button, Card } from '@/index';
import { useOutline } from '../composables/outline';

const { items, label, activeHeadingId } = useOutline();

function isActiveOutlineLink(link: string) {
  return link === `#${activeHeadingId.value}`;
}
</script>

<template>
  <aside v-if="items.length" class="docs-outline">
    <Card color="outlined" class="docs-outline-card">
      <h2 class="docs-outline-title">{{ label }}</h2>

      <nav class="docs-outline-links" aria-label="On this page">
        <Button
          v-for="item in items"
          :key="item.link"
          class="docs-outline-link"
          color="text"
          size="small"
          :href="item.link"
          :style="{ '--outline-depth': item.depth }"
          :data-active="isActiveOutlineLink(item.link) ? 'true' : 'false'"
        >
          {{ item.title }}
        </Button>
      </nav>
    </Card>
  </aside>
</template>

<style scoped>
.docs-outline {
  position: sticky;
  inset-block-start: calc(1rem + 4.5rem);
  align-self: start;
  max-block-size: calc(100vh - 6rem);
  padding: 1.25rem 1rem 1.5rem 0;
}

.docs-outline-card {
  display: grid;
  gap: 0.75rem;
  max-block-size: 100%;
  padding: 1.25rem;
  border-radius: 1.75rem;
  overflow: auto;
}

.docs-outline-title {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-outline-links {
  display: grid;
  gap: 0.375rem;
}

.docs-outline-link[data-active='true']:deep(.m3-button),
.docs-outline-link:deep(.m3-button:hover) {
  color: var(--md-sys-color-primary);
}

.docs-outline-link[data-active='true']:deep(.m3-button) {
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-outline-link:deep(.m3-button) {
  justify-content: flex-start;
  inline-size: 100%;
  padding-inline-start: calc(0.75rem + var(--outline-depth) * 0.75rem);
}

@media (max-width: 80rem) {
  .docs-outline {
    display: none;
  }
}
</style>
