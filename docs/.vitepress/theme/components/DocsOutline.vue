<script setup lang="ts">
import { Button, Card } from '@/index';
import type { ThemeOutlineLink } from '../utils';

const props = defineProps<{
  activeHeadingId: string;
  items: ThemeOutlineLink[];
  title: string;
}>();

function isActiveOutlineLink(link: string) {
  return link === `#${props.activeHeadingId}`;
}
</script>

<template>
  <aside class="docs-outline">
    <Card color="outlined" class="docs-outline-card">
      <h2 class="docs-outline-title">{{ title }}</h2>

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
  inset-block-start: calc(--dp(16) + --dp(72));
  align-self: start;
  max-block-size: calc(100vh - --dp(96));
  padding: --dp(20) --dp(16) --dp(24) 0;
}

.docs-outline-card {
  display: grid;
  gap: --dp(12);
  max-block-size: 100%;
  padding: --dp(20);
  border-radius: --dp(28);
  overflow: auto;
}

.docs-outline-title {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: --dp(13);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-outline-links {
  display: grid;
  gap: --dp(6);
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
  padding-inline-start: calc(--dp(12) + var(--outline-depth) * --dp(12));
}

@media (max-width: 80rem) {
  .docs-outline {
    display: none;
  }
}
</style>
