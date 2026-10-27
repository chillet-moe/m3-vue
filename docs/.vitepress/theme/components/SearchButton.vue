<script setup lang="ts">
import { Button, IconButton } from '@/index';

defineOptions({ inheritAttrs: false });
defineProps<{ text: string }>();
</script>

<template>
  <div class="search-trigger">
    <Button v-bind="$attrs" class="search-label" variant="outlined" size="small" leading-icon="search">
      {{ text }}
    </Button>
    <IconButton v-bind="$attrs" class="search-icon" size="small" icon="search" />
  </div>
</template>

<style scoped>
.search-trigger {
  display: flex;
  align-items: center;
}

.search-icon {
  display: none;
}

@media (max-width: 64rem) {
  .search-label {
    display: none;
  }

  .search-icon {
    display: inline-flex;
  }
}
</style>
