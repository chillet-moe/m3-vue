<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Popover } from '@/components/Popover';

const open = ref(false);
const anchorEl = ref<HTMLElement>();
</script>

<template>
  <div style="padding: 2rem; min-block-size: 14rem">
    <span ref="anchorEl" style="display: inline-flex">
      <Button color="tonal" @click="open = !open">Toggle filters</Button>
    </span>

    <Popover
      v-model:open="open"
      :anchor-element="anchorEl"
      placement="bottom-end"
      match-anchor-width
      role="dialog"
      aria-label="Filter options"
    >
      <div style="display: grid; gap: 0.75rem">
        <label style="display: grid; gap: 0.25rem">
          <span style="font: var(--md-sys-typescale-label-large)">Status</span>
          <select style="min-inline-size: 100%; padding: 0.5rem">
            <option>Open</option>
            <option>Closed</option>
            <option>Archived</option>
          </select>
        </label>

        <Button color="text" size="small" @click="open = false">Apply</Button>
      </div>
    </Popover>
  </div>
</template>
