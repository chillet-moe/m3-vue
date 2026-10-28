<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import allAnatomy from 'virtual:component-anatomy';
import { useLocalStorage } from '@vueuse/core';
import { CheckBox } from '@/components/CheckBox';
import { styleTokenMeta } from './style-token-meta';
import type { ComponentAnatomy } from '../plugins/component-anatomy.ts';
import type { StyleTokenMeta, StyleTokenTarget } from './style-tokens/types';
import { useData } from 'vitepress';

const props = defineProps<{
  component: string;
}>();
const { lang } = useData();
const isZhHans = computed(() => lang.value === 'zh-Hans');

const tokens = computed(() => {
  return styleTokenMeta[props.component] ?? [];
});

const previewEnabled = useLocalStorage('m3-vue-docs:styling-preview-enabled', false);
const previewedToken = ref<string | null>(null);
const tableId = useId();
const tableRoot = ref<HTMLElement | null>(null);
const appendToEnd = ref(false);
const anatomyByScope = allAnatomy as Record<string, ComponentAnatomy | undefined>;

type PreviewMutation = {
  element: HTMLElement;
  existed: boolean;
  priority: string;
  property: string;
  value: string;
};

let previewMutations: PreviewMutation[] = [];

const componentScopeOverrides: Record<string, string> = {
  CheckBox: 'checkbox',
  ListItem: 'item',
};

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const headingId = computed(() => {
  return `styling-${toKebabCase(props.component)}-${tableId}`;
});

function getDefaultScope() {
  return componentScopeOverrides[props.component] ?? toKebabCase(props.component);
}

function inferScope(tokenName: string) {
  const defaultScope = getDefaultScope();

  if (tokenName.startsWith('--md-sheet-bottom-')) {
    return 'bottom-sheet';
  }

  if (tokenName.startsWith('--md-sheet-side-')) {
    return 'side-sheet';
  }

  if (tokenName.startsWith('--md-plain-tooltip-') || tokenName.startsWith('--md-rich-tooltip-')) {
    return 'tooltip';
  }

  if (tokenName.startsWith('--md-menus-menu-item-')) {
    return 'menu-item';
  }

  if (tokenName.startsWith('--md-menus-')) {
    return 'menu';
  }

  if (tokenName.startsWith('--md-progress-indicator-')) {
    return defaultScope;
  }

  const scopes = Object.keys(anatomyByScope).sort((a, b) => b.length - a.length);
  return scopes.find((scope) => tokenName.startsWith(`--md-${scope}-`)) ?? defaultScope;
}

function getTokenWords(tokenName: string) {
  return tokenName.replace(/^--md-/, '').split('-');
}

function inferPart(tokenName: string, scope: string) {
  const anatomy = anatomyByScope[scope];

  if (!anatomy) {
    return 'root';
  }

  const tokenWords = new Set(getTokenWords(tokenName));
  const candidates = anatomy.parts
    .filter((part) => part.part !== 'root')
    .map((part) => ({
      part: part.part,
      words: part.part.split('-'),
    }))
    .filter((candidate) => candidate.words.every((word) => tokenWords.has(word)))
    .sort((a, b) => b.words.length - a.words.length);

  return candidates[0]?.part ?? 'root';
}

function resolveTargets(token: StyleTokenMeta): StyleTokenTarget[] {
  if (token.targets?.length) {
    return token.targets;
  }

  const scope = inferScope(token.name);
  return [
    {
      scope,
      part: inferPart(token.name, scope),
    },
  ];
}

function resolveTargetElements(target: StyleTokenTarget, root: Document | HTMLElement = document) {
  if (target.selector) {
    return Array.from(root.querySelectorAll<HTMLElement>(target.selector));
  }

  const part = target.part ?? 'root';
  let elements = Array.from(root.querySelectorAll<HTMLElement>(`[data-scope="${target.scope}"][data-part="${part}"]`));

  if (elements.length === 0 && part !== 'root') {
    elements = Array.from(root.querySelectorAll<HTMLElement>(`[data-scope="${target.scope}"][data-part="root"]`));
  }

  return elements;
}

function getPreviewContainer() {
  if (!tableRoot.value) {
    return document;
  }

  const previousDemos = Array.from(document.querySelectorAll<HTMLElement>('.demo-container[data-sticky="true"]'))
    .filter((demo) => demo.compareDocumentPosition(tableRoot.value!) & Node.DOCUMENT_POSITION_FOLLOWING)
    .filter((demo) => window.getComputedStyle(demo).position === 'sticky');

  return previousDemos.at(-1) ?? document;
}

function getPreviewValue(token: StyleTokenMeta) {
  if (token.preview === false) {
    return null;
  }

  if (token.preview) {
    return token.preview;
  }

  const name = token.name.toLowerCase();
  const category = token.category?.toLowerCase();

  if (category === 'color' || category === 'state' || category === 'focus' || name.includes('color')) {
    return '#ff2d55';
  }

  if (category === 'elevation' || name.includes('elevation')) {
    return 'var(--md-sys-elevation-level5)';
  }

  if (name.includes('opacity')) {
    return '1';
  }

  if (name.includes('shape') || name.includes('radius')) {
    return '1.5rem';
  }

  if (name.includes('weight')) {
    return '800';
  }

  if (name.includes('font')) {
    return 'monospace';
  }

  if (name.includes('tracking')) {
    return '0.08em';
  }

  if (name.includes('line-height')) {
    return '2';
  }

  if (
    name.includes('height') ||
    name.includes('width') ||
    name.includes('size') ||
    name.includes('space') ||
    name.includes('gap') ||
    name.includes('padding') ||
    name.includes('thickness') ||
    name.includes('offset') ||
    name.includes('amplitude') ||
    name.includes('wavelength')
  ) {
    return '1.75rem';
  }

  return null;
}

function getPreviewHosts(target: StyleTokenTarget, elements: HTMLElement[]) {
  const hosts = new Set<HTMLElement>();

  for (const element of elements) {
    hosts.add(element.closest<HTMLElement>(`[data-scope="${target.scope}"][data-part="root"]`) ?? element);
  }

  return Array.from(hosts);
}

function setPreviewProperty(element: HTMLElement, property: string, value: string) {
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);

  previewMutations.push({
    element,
    existed: previousValue !== '' || previousPriority !== '',
    priority: previousPriority,
    property,
    value: previousValue,
  });

  element.style.setProperty(property, value);
}

function previewToken(token: StyleTokenMeta) {
  if (!previewEnabled.value) {
    return;
  }

  clearPreview();

  const previewValue = getPreviewValue(token);
  const previewContainer = getPreviewContainer();

  for (const target of resolveTargets(token)) {
    const elementsInPreview = resolveTargetElements(target, previewContainer);
    const elements = elementsInPreview.length > 0 ? elementsInPreview : resolveTargetElements(target);

    for (const element of elements) {
      element.dataset.stylingPreview = 'true';
    }

    if (previewValue) {
      for (const host of getPreviewHosts(target, elements)) {
        setPreviewProperty(host, token.name, previewValue);
      }
    }
  }
}

function clearPreview() {
  const previewed = document.querySelectorAll<HTMLElement>('[data-styling-preview]');

  for (const element of previewed) {
    delete element.dataset.stylingPreview;
  }

  for (const mutation of previewMutations.reverse()) {
    if (mutation.existed) {
      mutation.element.style.setProperty(mutation.property, mutation.value, mutation.priority);
    } else {
      mutation.element.style.removeProperty(mutation.property);
    }
  }

  previewMutations = [];
}

function onRowEnter(token: StyleTokenMeta) {
  previewedToken.value = token.name;
  previewToken(token);
}

function onRowLeave() {
  clearPreview();
  previewedToken.value = null;
}

watch(previewEnabled, (enabled) => {
  if (!enabled) {
    clearPreview();
    previewedToken.value = null;
  }
});

onBeforeUnmount(clearPreview);

onMounted(() => {
  appendToEnd.value = true;
});
</script>

<template>
  <Teleport to="#docs-api-appendix" defer :disabled="!appendToEnd">
    <section ref="tableRoot" class="vp-raw style-token-table">
      <div class="style-token-table-panel">
        <div class="style-token-table-header">
          <h2 :id="headingId" class="style-token-table-heading">
            <span class="style-token-table-title">{{ isZhHans ? '样式' : 'Styling' }}</span>
            <span class="style-token-table-count ignore-header">{{ tokens.length }}</span>
          </h2>

          <CheckBox
            v-model:checked="previewEnabled"
            :label="isZhHans ? '预览' : 'Preview'"
            class="style-token-table-preview-checkbox"
          >
            <span class="style-token-table-preview-label">{{ isZhHans ? '预览' : 'Preview' }}</span>
          </CheckBox>
        </div>

        <p v-if="tokens.length === 0" class="style-token-table-empty">
          {{ isZhHans ? `暂无 ${component} 的样式 token 文档。` : `No styling tokens documented for ${component}.` }}
        </p>

        <div v-else class="style-token-table-scroll">
          <table class="style-token-table-grid">
            <colgroup>
              <col class="style-token-table-token-column" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>Token</th>
                <th>{{ isZhHans ? '说明' : 'Description' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="token in tokens"
                :key="token.name"
                :data-active="previewedToken === token.name ? 'true' : 'false'"
                @pointerenter="onRowEnter(token)"
                @pointerleave="onRowLeave()"
              >
                <td>
                  <div class="style-token-table-token-cell">
                    <div class="style-token-table-token-row">
                      <code>{{ token.name }}</code>
                      <span v-if="token.category" class="style-token-table-badge">{{ token.category }}</span>
                    </div>
                    <div class="style-token-table-token-row">
                      <span class="style-token-table-label">{{ isZhHans ? '回退值' : 'Fallback' }}</span>
                      <code>{{ token.fallback }}</code>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="style-token-table-description">{{ token.description }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<style scoped>
.style-token-table {
  margin-block: 0.5rem;
}

.style-token-table-panel {
  --docs-table-divider: --translucent(var(--md-sys-color-on-surface), 0.12);
  --docs-table-header-bg: rgba(from var(--vp-c-default-soft) r g b / 0.5);

  overflow: clip;
  border: 1px solid var(--docs-table-divider);
  border-radius: var(--docs-shape-surface);
  background: var(--vp-c-bg-soft);
}

.style-token-table-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  min-inline-size: 0;
  min-block-size: 3rem;
  padding-block: 0.375rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--docs-table-divider);
  background: var(--docs-table-header-bg);
}

.style-token-table-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-inline-size: 0;
  margin: 0;
  border: 0;
  padding: 0;
}

.style-token-table-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
}

.style-token-table-count {
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

.style-token-table-preview-checkbox {
  flex: none;
  margin: 0;
  height: 2.5rem;
}

.style-token-table-empty {
  margin: 0;
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
}

.style-token-table-scroll {
  inline-size: 100%;
  max-inline-size: 100%;
  overflow: auto;
}

.style-token-table-grid {
  display: table;
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.style-token-table-token-column {
  width: min(46%, 24rem);
}

.style-token-table-grid th,
.style-token-table-grid td {
  padding-block: 0.875rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--docs-table-divider);
  text-align: start;
  vertical-align: top;
}

.style-token-table-grid tbody tr:last-child td {
  border-block-end: none;
}

.style-token-table-grid th {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--docs-table-header-bg);
}

.style-token-table-grid td {
  color: var(--vp-c-text-1);
}

.style-token-table-grid tbody tr {
  transition: background-color 0.15s;
}

.style-token-table-grid tbody tr:hover,
.style-token-table-grid tbody tr[data-active='true'] {
  background: var(--vp-c-bg-alt);
}

.style-token-table-grid code {
  font-size: 0.8125rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.style-token-table-token-cell {
  display: grid;
  gap: 0.75rem;
  min-inline-size: 0;
}

.style-token-table-token-row {
  display: grid;
  gap: 0.25rem;
  min-inline-size: 0;
}

.style-token-table-label {
  color: var(--vp-c-text-3);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
}

.style-token-table-description {
  margin: 0;
  overflow-wrap: anywhere;
}

.style-token-table-badge {
  display: inline-flex;
  align-items: center;
  inline-size: fit-content;
  border-radius: var(--docs-shape-compact);
  padding-block: 0.25rem;
  padding-inline: 0.625rem;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  line-height: 1;
  background: --translucent(var(--vp-c-text-2), 0.1);
}
</style>

<style>
[data-styling-preview='true'] {
  outline: 2px dashed var(--md-sys-color-primary, #6750a4) !important;
  outline-offset: 2px;
  border-radius: var(--docs-shape-compact);
  box-shadow: 0 0 0 3px --translucent(var(--md-sys-color-primary, #6750a4), 0.12) !important;
}
</style>
