<script setup lang="ts">
import { withBase } from 'vitepress';

import { Button } from '@/index';
import { useSidebar } from '../composables/sidebar';
import { useLocaleNavigation } from '../composables/nav';

const { prevItem, nextItem } = useSidebar();
const { isChinese } = useLocaleNavigation();
</script>

<template>
  <nav v-if="prevItem || nextItem" class="docs-pager" :aria-label="isChinese ? '页面导航' : 'Page navigation'">
    <Button v-if="prevItem" variant="outlined" size="medium" :href="withBase(prevItem.link)" leading-icon="arrow_back">
      {{ prevItem.text }}
    </Button>

    <span v-else class="docs-pager-spacer" />

    <Button v-if="nextItem" variant="tonal" size="medium" :href="withBase(nextItem.link)" trailing-icon="arrow_forward">
      {{ nextItem.text }}
    </Button>
  </nav>
</template>

<style scoped>
.docs-pager {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;

  max-inline-size: var(--docs-content-max-width);
  inline-size: 100%;
  margin-inline: auto;
  padding: 1.25rem;
}

.docs-pager-spacer {
  flex: 1;
}
</style>
