<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';

const confirming = ref(false);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 0.75rem; min-block-size: 6rem">
    <Button
      v-tooltip="'#dynamic-tooltip'"
      :class="{ confirm: confirming }"
      :color="confirming ? 'filled' : 'text'"
      size="extra-small"
      shape="square"
      @click="confirming = !confirming"
    >
      {{ confirming ? 'Confirm' : 'Delete' }}
    </Button>
    <Tooltip id="dynamic-tooltip" popover="hint">
      {{ confirming ? 'This item will be reset to “A”.' : 'Delete' }}
    </Tooltip>
  </div>
</template>

<style scoped>
.confirm {
  min-inline-size: 4.5rem;
}
</style>
