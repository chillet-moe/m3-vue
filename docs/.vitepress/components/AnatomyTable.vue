<script setup lang="ts">
import { Button } from '@/index';
import { useOverlays } from '@/overlays';
const { showSnackbar } = useOverlays();
import { computed, ref, useId, watch } from 'vue';
import allAnatomy from 'virtual:component-anatomy';
import { CheckBox } from '@/components/CheckBox';
import { Tooltip } from '@/components/Tooltip';
import { Icon } from '@/components/Icon';
import { useLocalStorage } from '@vueuse/core';
import type { AnatomyPart } from '../plugins/component-anatomy.ts';
import { useData } from 'vitepress';

const props = defineProps<{
  scope: string;
}>();

const anatomy = computed(() => {
  return allAnatomy[props.scope] ?? null;
});
const { lang } = useData();
const isZhHans = computed(() => lang.value === 'zh-Hans');

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
      message: isZhHans.value ? `已将 ${text} 复制到剪贴板` : `${text} copied to clipboard`,
    });
  } catch (err) {
    void showSnackbar({
      message: isZhHans.value ? `无法将 ${text} 复制到剪贴板` : `Failed to copy ${text} to clipboard`,
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

const headingId = computed(() => {
  return `anatomy-${props.scope}-${partSelectorId}`;
});
</script>

<template>
  <div v-if="anatomy" class="vp-raw anatomy-table">
    <div class="anatomy-panel">
      <div class="anatomy-header">
        <h2 :id="headingId" class="anatomy-heading">
          <span class="anatomy-header-title">{{ isZhHans ? '结构' : 'Anatomy' }}</span>
        </h2>

        <Button
          class="anatomy-toggle"
          variant="text"
          size="small"
          :leading-icon="collapsed ? 'expand_more' : 'expand_less'"
          :aria-expanded="!collapsed"
          :aria-controls="`anatomy-parts-${partSelectorId}`"
          :aria-label="
            isZhHans
              ? collapsed
                ? '展开结构表格'
                : '收起结构表格'
              : collapsed
                ? 'Expand anatomy table'
                : 'Collapse anatomy table'
          "
          @click="toggleCollapsed"
        >
          <span class="anatomy-part-count">{{ anatomyData.length }}</span>
        </Button>

        <CheckBox
          v-model:checked="highlightEnabled"
          :label="isZhHans ? '高亮显示' : 'Highlight'"
          class="anatomy-highlight-checkbox"
        >
          <span class="anatomy-highlight-label">{{ isZhHans ? '高亮显示' : 'Highlight' }}</span>
        </CheckBox>
      </div>

      <div v-show="!collapsed" :id="`anatomy-parts-${partSelectorId}`">
        <p v-if="anatomyData.length === 0" class="anatomy-empty">
          {{ isZhHans ? '暂无结构部件文档。' : 'No anatomy parts documented.' }}
        </p>

        <div v-else class="anatomy-scroll">
          <table class="anatomy-grid">
            <colgroup>
              <col class="anatomy-element-column" />
              <col class="anatomy-part-column" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>{{ isZhHans ? '元素' : 'Element' }}</th>
                <th>{{ isZhHans ? '部件' : 'Part' }}</th>
                <th>{{ isZhHans ? '选择器' : 'Selector' }}</th>
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
                    <span v-if="part.conditional" class="anatomy-part-conditional">{{
                      isZhHans ? '条件显示' : 'conditional'
                    }}</span>
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
                    ><kbd><Icon name="left_click"></Icon>{{ isZhHans ? '鼠标左键' : 'LMB' }}</kbd
                    >{{ isZhHans ? '单击复制' : 'Copy' }}</Tooltip
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anatomy-table {
  margin-block: 0.5rem;
}

.anatomy-panel {
  overflow: clip;
  border: 1px solid var(--docs-table-divider);
  border-radius: var(--docs-shape-surface);
  background: var(--vp-c-bg-soft);
}

.anatomy-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-inline-size: 0;
  min-block-size: 3rem;
  padding-block: 0.375rem;
  padding-inline: 1rem 1rem;
  border-block-end: 1px solid var(--docs-table-divider);
  background: var(--docs-table-header-bg);
}

.anatomy-heading {
  flex: 1;
  margin: 0;
  min-inline-size: 0;
  border: 0;
  padding: 0;
}

.anatomy-heading::before {
  display: none;
}

.anatomy-toggle {
  flex: none;
  justify-self: start;
}

.anatomy-header-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
}

.anatomy-part-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1.375rem;
  block-size: 1.375rem;
  border-radius: var(--docs-shape-compact);
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
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
}

.anatomy-scroll {
  inline-size: 100%;
  max-inline-size: 100%;
  overflow: auto;
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
  border-block-end: 1px solid var(--docs-table-divider);
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
  background: var(--docs-table-header-bg);
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
  outline: 2px dashed var(--md-sys-color-tertiary) !important;
  outline-offset: 2px;
  border-radius: var(--docs-shape-compact);
  filter: brightness(2) !important;
}
</style>
