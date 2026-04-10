<script setup lang="ts">
import { withBase } from 'vitepress';

import { Button } from '@/index';

const props = defineProps<{
  nextItem: { text: string; link: string } | null;
  previousItem: { text: string; link: string } | null;
}>();
</script>

<template>
  <nav v-if="previousItem || nextItem" class="docs-pager" aria-label="Page navigation">
    <Button
      v-if="previousItem"
      color="outlined"
      size="medium"
      :href="withBase(previousItem.link)"
      leading-icon="arrow_back"
    >
      {{ previousItem.text }}
    </Button>

    <span v-else class="docs-pager-spacer" />

    <Button
      v-if="nextItem"
      color="tonal"
      size="medium"
      :href="withBase(nextItem.link)"
      trailing-icon="arrow_forward"
    >
      {{ nextItem.text }}
    </Button>
  </nav>
</template>

<style scoped>
.docs-pager {
  display: flex;
  justify-content: space-between;
  gap: --dp(12);
}

.docs-pager-spacer {
  flex: 1;
}
</style>
