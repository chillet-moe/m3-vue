<script setup lang="ts">
import { ListItem } from '@/index';
import { useOutline } from '../composables/outline';
import { useLocaleNavigation } from '../composables/nav';

const { items, label, activeHeadingId } = useOutline();
const { isChinese } = useLocaleNavigation();

function isActiveOutlineLink(link: string) {
  return link === `#${activeHeadingId.value}`;
}
</script>

<template>
  <aside v-if="items.length" class="docs-outline">
    <div class="docs-outline-card">
      <h2 class="docs-outline-title">{{ label }}</h2>

      <nav class="docs-outline-links" :aria-label="isChinese ? '本页目录' : 'On this page'">
        <ListItem
          v-for="item in items"
          :key="item.link"
          class="docs-outline-link"
          size="small"
          :href="item.link"
          :style="{ '--outline-depth': item.depth }"
          :active="isActiveOutlineLink(item.link)"
          :aria-current="isActiveOutlineLink(item.link) ? 'location' : undefined"
        >
          {{ item.title }}
        </ListItem>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.docs-outline {
  position: sticky;
  inset-block-start: calc(0.25rem + 4.5rem);
  align-self: start;
  max-block-size: calc(100vh - 6rem);
  margin-inline-start: 1rem;
  margin-inline-end: 2rem;
}

.docs-outline-card {
  display: grid;
  gap: 0.75rem;
  max-block-size: 100%;
  overflow: auto;
}

.docs-outline-title {
  margin-inline-start: 0.75rem;
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

.docs-outline-link {
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
