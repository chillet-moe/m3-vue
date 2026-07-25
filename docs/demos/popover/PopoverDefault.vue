<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import { Popover } from '@/components/Popover';

const popover = ref<{ popoverEl?: HTMLDivElement } | null>(null);
const dropdownBinding = computed(() => popover.value?.popoverEl ?? null);
</script>

<template>
  <div style="padding: 2rem; min-block-size: 12rem">
    <Button v-dropdown="dropdownBinding" variant="outlined">Open popover</Button>

    <Popover ref="popover" role="dialog" aria-label="Profile summary">
      <div style="display: grid; gap: 0.75rem; min-inline-size: 14rem">
        <div style="font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface)">Chillet</div>
        <div style="color: var(--md-sys-color-on-surface-variant)">Signed in to the current workspace.</div>
        <Button variant="text" size="small">Manage account</Button>
      </div>
    </Popover>
  </div>
</template>
