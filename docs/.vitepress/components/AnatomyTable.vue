<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import allAnatomy from 'virtual:component-anatomy';
import { CheckBox } from '@/components/CheckBox';
import { Tooltip } from '@/components/Tooltip';
import { Icon } from '@/components/Icon';
import { useLocalStorage } from '@vueuse/core';
import { showSnackbar } from '@/components/Snackbar';
import type { AnatomyPart } from '../plugins/component-anatomy.ts';

const props = defineProps<{
  scope: string;
}>();

const anatomy = computed(() => {
  return allAnatomy[props.scope] ?? null;
});

const highlightEnabled = useLocalStorage('anatomy-highlight-enabled', false);
const highlightedPart = ref<string | null>(null);
const collapsed = useLocalStorage('m3-vue-docs:table-collapsed:anatomy', false);

function highlightElements(part: string) {
  if (!highlightEnabled.value) return;
  const elements = document.querySelectorAll<HTMLElement>(`[data-scope="${props.scope}"][data-part="${part}"]`);
  for (const el of elements) {
    el.dataset.anatomyHighlight = 'true';
  }
}

function clearHighlights() {
  const highlighted = document.querySelectorAll<HTMLElement>(`[data-scope="${props.scope}"][data-anatomy-highlight]`);
  for (const el of highlighted) {
    delete el.dataset.anatomyHighlight;
  }
}

function onRowEnter(part: string) {
  highlightedPart.value = part;
  highlightElements(part);
}

function onRowLeave() {
  clearHighlights();
  highlightedPart.value = null;
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value;

  if (collapsed.value) {
    clearHighlights();
    highlightedPart.value = null;
  }
}

watch(highlightEnabled, (enabled) => {
  if (!enabled) {
    clearHighlights();
    highlightedPart.value = null;
  }
});

const partSelectorId = useId();

async function onCopyPartSelector(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    void showSnackbar({
      message: `${text} copied to clipboard`,
    });
  } catch (err) {
    void showSnackbar({
      message: `Failed to copy ${text} to clipboard`,
    });
  }
}

const anatomyData = computed(() => {
  return (
    anatomy.value?.parts.map((part: AnatomyPart) => ({
      ...part,
      selector: `[data-scope="${props.scope}"][data-part="${part.part}"]`,
    })) ?? []
  );
});
</script>

<template>
  <div v-if="anatomy" class="vp-raw anatomy-table">
    <div class="anatomy-header">
      <button
        class="anatomy-toggle m3-state-layer"
        type="button"
        :aria-expanded="!collapsed"
        :aria-controls="`anatomy-parts-${partSelectorId}`"
        :aria-label="collapsed ? 'Expand anatomy table' : 'Collapse anatomy table'"
        @click="toggleCollapsed"
      >
        <Icon class="anatomy-toggle-icon" name="expand_more" aria-hidden="true" />
        <span class="anatomy-header-title">Anatomy</span>
        <span class="anatomy-part-count">{{ anatomyData.length }}</span>
      </button>
      <CheckBox v-model:checked="highlightEnabled" :label="'Highlight'" class="anatomy-highlight-checkbox">
        <span class="anatomy-highlight-label">Highlight</span>
      </CheckBox>
    </div>

    <div v-show="!collapsed" :id="`anatomy-parts-${partSelectorId}`">
      <p v-if="anatomyData.length === 0" class="anatomy-empty">No anatomy parts documented.</p>

      <div v-else class="anatomy-scroll">
        <table class="anatomy-grid">
          <colgroup>
            <col class="anatomy-element-column" />
            <col class="anatomy-part-column" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Element</th>
              <th>Part</th>
              <th>Selector</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="part in anatomyData"
              :key="part.part"
              :data-active="highlightedPart === part.part ? 'true' : 'false'"
              @pointerenter="onRowEnter(part.part)"
              @pointerleave="onRowLeave()"
            >
              <td>
                <code class="anatomy-part-element">&lt;{{ part.element }}&gt;</code>
              </td>
              <td>
                <div class="anatomy-part-cell">
                  <span class="anatomy-part-name">{{ part.part }}</span>
                  <span v-if="part.conditional" class="anatomy-part-conditional">conditional</span>
                </div>
              </td>
              <td>
                <code
                  class="anatomy-part-selector"
                  v-tooltip="`#${part.part}-${partSelectorId}`"
                  @click.prevent="onCopyPartSelector(part.selector)"
                  >{{ part.selector }}</code
                >
                <Tooltip :id="`${part.part}-${partSelectorId}`"
                  ><kbd><Icon name="left_click"></Icon>LMB</kbd>Copy</Tooltip
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anatomy-table {
  display: grid;
  gap: 0.75rem;
  margin-block: 1.5rem;
}

.anatomy-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  min-inline-size: 0;
}

.anatomy-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-inline-size: 0;
  margin: 0;
  border: 0;
  border-radius: 999px;
  padding-block: 0.375rem;
  padding-inline: 0.625rem;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.anatomy-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.anatomy-toggle-icon {
  font-size: 1.125rem;
  color: var(--vp-c-text-3);
  transition: transform 0.15s;
}

.anatomy-toggle[aria-expanded='true'] .anatomy-toggle-icon {
  transform: rotate(180deg);
}

.anatomy-header-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.25rem;
  line-height: 1.4;
}

.anatomy-part-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1.375rem;
  block-size: 1.375rem;
  border-radius: 999px;
  padding-inline: 0.375rem;
  color: var(--vp-c-text-2);
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--vp-c-bg-alt);
}

.anatomy-highlight-checkbox {
  flex: none;
  margin: 0;
  height: 2.5rem;
}

.anatomy-empty {
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.anatomy-scroll {
  inline-size: 100%;
  max-inline-size: 100%;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  background: var(--vp-c-bg-soft);
}

.anatomy-grid {
  display: table;
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.anatomy-element-column {
  width: 22%;
}

.anatomy-part-column {
  width: 26%;
}

.anatomy-grid th,
.anatomy-grid td {
  padding-block: 0.875rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--vp-c-divider);
  text-align: start;
  vertical-align: top;
}

.anatomy-grid tbody tr:last-child td {
  border-block-end: none;
}

.anatomy-grid th {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  background: --translucent(var(--vp-c-default-soft), 0.5);
}

.anatomy-grid td {
  color: var(--vp-c-text-1);
}

.anatomy-grid tbody tr {
  cursor: default;
  transition: background-color 0.15s;
}

.anatomy-grid tbody tr:hover,
.anatomy-grid tbody tr[data-active='true'] {
  background: var(--vp-c-bg-alt);
}

.anatomy-grid code {
  font-size: 0.8125rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.anatomy-part-element {
  color: var(--vp-c-text-3);
}

.anatomy-part-cell {
  display: grid;
  gap: 0.5rem;
  min-inline-size: 0;
}

.anatomy-part-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.anatomy-part-conditional {
  display: inline-flex;
  align-items: center;
  inline-size: fit-content;
  color: var(--vp-c-text-2);
  font-size: 0.6875rem;
  line-height: 1;
}

.anatomy-part-selector {
  color: var(--vp-c-text-3);
  cursor: pointer;
}
</style>

<style>
[data-anatomy-highlight='true'] {
  outline: 2px dashed var(--md-sys-color-tertiary, #6750a4) !important;
  outline-offset: 2px;
  border-radius: 4px;
  filter: brightness(2) !important;
}
</style>
