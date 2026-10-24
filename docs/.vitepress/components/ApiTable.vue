<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue';
import allMeta from 'virtual:component-meta';
import { useLocalStorage } from '@vueuse/core';
import { Icon } from '@/components/Icon';
import { useData } from 'vitepress';

import ControlItem from './ControlItem.vue';
import { getControlType } from './control-meta';
import type { PropMeta } from '../plugins/component-meta';

const props = withDefaults(
  defineProps<{
    component: string;
    modelValue?: Record<string, unknown>;
    exclude?: string[];
  }>(),
  {
    modelValue: undefined,
    exclude: () => [],
  },
);
const { lang } = useData();
const isZhHans = computed(() => lang.value === 'zh-Hans');

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const meta = computed(() => {
  return allMeta[props.component] ?? null;
});

const controlsEnabled = computed(() => {
  return props.modelValue !== undefined;
});

const collapsedSections = useLocalStorage<Record<string, boolean>>('m3-vue-docs:table-collapsed:api', {});
const tableId = useId();
const appendToEnd = ref(false);

onMounted(() => {
  appendToEnd.value = true;
});

type ApiTableSection = {
  key: 'props' | 'events' | 'slots';
  title: string;
  rows: unknown[];
};

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function getSectionHeadingId(key: ApiTableSection['key']) {
  return `api-${toKebabCase(props.component)}-${key}-${tableId}`;
}

const sections = computed<ApiTableSection[]>(() => {
  if (!meta.value) {
    return [];
  }

  const result: ApiTableSection[] = [
    {
      key: 'props',
      title: isZhHans.value ? '属性' : 'Props',
      rows: meta.value.props,
    },
    {
      key: 'events',
      title: isZhHans.value ? '事件' : 'Events',
      rows: meta.value.events,
    },
    {
      key: 'slots',
      title: isZhHans.value ? '插槽' : 'Slots',
      rows: meta.value.slots,
    },
  ];
  return result.filter((section) => section.rows.length > 0);
});

const inlineSections = computed(() => {
  return sections.value.filter((section) => section.key === 'props');
});

const appendixSections = computed(() => {
  return sections.value.filter((section) => section.key !== 'props');
});

function updatePropValue(name: string, value: unknown) {
  if (!props.modelValue) {
    return;
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  });
}

function isControlVisible(prop: PropMeta) {
  return !props.exclude.includes(prop.name) && getControlType(prop) !== 'none';
}

function isSectionCollapsed(key: string) {
  return collapsedSections.value[key] ?? false;
}

function toggleSection(key: string) {
  collapsedSections.value = {
    ...collapsedSections.value,
    [key]: !isSectionCollapsed(key),
  };
}

function getSectionContentId(key: string) {
  return `api-table-${key}-${tableId}`;
}
</script>

<template>
  <div class="vp-raw api-table">
    <p v-if="!meta" class="api-table-empty">
      {{ isZhHans ? `未找到 ${component} 的 API 元数据。` : `No API metadata found for ${component}.` }}
    </p>

    <template v-else>
      <template v-for="section in inlineSections" :key="section.key">
        <section class="api-table-section">
          <div class="api-table-panel">
            <div class="api-table-heading">
              <h2 :id="getSectionHeadingId(section.key)" class="api-table-title">
                {{ section.title }}
              </h2>
              <button
                class="api-table-toggle m3-state-layer"
                type="button"
                :aria-expanded="!isSectionCollapsed(section.key)"
                :aria-controls="getSectionContentId(section.key)"
                :aria-label="
                  isZhHans
                    ? isSectionCollapsed(section.key)
                      ? `展开${section.title}表格`
                      : `收起${section.title}表格`
                    : isSectionCollapsed(section.key)
                      ? `Expand ${section.title} table`
                      : `Collapse ${section.title} table`
                "
                @click="toggleSection(section.key)"
              >
                <Icon class="api-table-toggle-icon ignore-header" name="expand_more" aria-hidden="true" />
                <span class="api-table-count ignore-header">{{ section.rows.length }}</span>
              </button>
            </div>

            <div v-show="!isSectionCollapsed(section.key)" :id="getSectionContentId(section.key)">
              <div class="api-table-scroll">
                <table class="api-table-grid">
                  <thead>
                    <tr>
                      <th>{{ isZhHans ? '名称' : 'Name' }}</th>
                      <th>{{ isZhHans ? '说明' : 'Description' }}</th>
                      <th>{{ isZhHans ? '默认值' : 'Default' }}</th>
                      <th v-if="controlsEnabled">{{ isZhHans ? '控件' : 'Control' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="prop in meta.props" :key="prop.name">
                      <td>
                        <div class="api-table-name-cell">
                          <code>{{ prop.name }}</code>
                          <span class="api-table-badge" :data-required="prop.required ? 'true' : 'false'">
                            {{ prop.required ? (isZhHans ? '必填' : 'Required') : isZhHans ? '可选' : 'Optional' }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="api-table-description">
                          <p v-if="prop.description" class="api-table-copy">{{ prop.description }}</p>
                          <p v-else class="api-table-copy api-table-muted">-</p>
                          <div class="api-table-type">
                            <template v-if="prop.options?.length">
                              <code v-for="option in prop.options" :key="option">{{ option }}</code>
                            </template>
                            <code v-else>{{ prop.type }}</code>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code v-if="prop.default">{{ prop.default }}</code>
                        <span v-else class="api-table-muted">-</span>
                      </td>
                      <td v-if="controlsEnabled">
                        <div class="api-table-control">
                          <ControlItem
                            v-if="isControlVisible(prop)"
                            :prop="prop"
                            :model-value="modelValue?.[prop.name]"
                            @update:model-value="updatePropValue(prop.name, $event)"
                          />
                          <span v-else class="api-table-muted">-</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </template>

      <Teleport to="#docs-api-appendix" defer :disabled="!appendToEnd">
        <section v-for="section in appendixSections" :key="section.key" class="vp-raw api-table api-table-section">
          <div class="api-table-panel">
            <h2 :id="getSectionHeadingId(section.key)" class="api-table-heading">
              <span class="api-table-static-title">{{ section.title }}</span>
              <span class="api-table-count ignore-header">{{ section.rows.length }}</span>
            </h2>
            <div class="api-table-scroll">
              <table class="api-table-grid">
                <thead>
                  <tr v-if="section.key === 'events'">
                    <th>{{ isZhHans ? '名称' : 'Name' }}</th>
                    <th>{{ isZhHans ? '类型' : 'Type' }}</th>
                    <th>{{ isZhHans ? '说明' : 'Description' }}</th>
                  </tr>
                  <tr v-else>
                    <th>{{ isZhHans ? '名称' : 'Name' }}</th>
                    <th>{{ isZhHans ? '参数' : 'Parameters' }}</th>
                    <th>{{ isZhHans ? '说明' : 'Description' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="section.key === 'events'">
                    <tr v-for="event in meta.events" :key="event.name">
                      <td>
                        <code>{{ event.name }}</code>
                      </td>
                      <td>
                        <code v-if="event.type">{{ event.type }}</code>
                        <span v-else class="api-table-muted">-</span>
                      </td>
                      <td>{{ event.description || '-' }}</td>
                    </tr>
                  </template>

                  <template v-else>
                    <tr v-for="slot in meta.slots" :key="slot.name">
                      <td>
                        <code>{{ slot.name }}</code>
                      </td>
                      <td>
                        <code v-if="slot.params">{{ slot.params }}</code>
                        <span v-else class="api-table-muted">-</span>
                      </td>
                      <td>{{ slot.description || '-' }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.api-table {
  display: grid;
  gap: 1.5rem;
}

.api-table-section {
  margin-block: 0.5rem;
}

.api-table-panel {
  --docs-table-divider: --translucent(var(--md-sys-color-on-surface), 0.12);
  --docs-table-header-bg: rgba(from var(--vp-c-default-soft) r g b / 0.5);

  overflow: clip;
  border: 1px solid var(--docs-table-divider);
  border-radius: 1.25rem;
  background: var(--vp-c-bg-soft);
}

.api-table-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  min-block-size: 3rem;
  margin: 0;
  padding-block: 0.375rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--docs-table-divider);
  color: var(--vp-c-text-1);
  background: var(--docs-table-header-bg);
}

.api-table-title::before {
  display: none;
}

.api-table-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex: none;
  inline-size: fit-content;
  min-inline-size: 0;
  margin: 0;
  border: 0;
  border-radius: 999px;
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.api-table-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.api-table-toggle-icon {
  font-size: 1.125rem;
  color: var(--vp-c-text-3);
  transition: transform 0.15s;
}

.api-table-toggle[aria-expanded='true'] .api-table-toggle-icon {
  transform: rotate(180deg);
}

.api-table-title {
  margin: 0;
  min-inline-size: 0;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
}

.api-table-static-title {
  margin-inline-start: 0.5rem;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
}

.api-table-count {
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

.api-table-empty {
  margin: 0;
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
}

.api-table-scroll {
  inline-size: 100%;
  max-inline-size: 100%;
  overflow: auto;
}

.api-table-grid {
  display: table;
  inline-size: 100%;
  border-collapse: collapse;
}

.api-table-grid th,
.api-table-grid td {
  padding-block: 0.875rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--docs-table-divider);
  text-align: start;
  vertical-align: start;
}

.api-table-grid tbody tr:last-child td {
  border-block-end: none;
}

.api-table-grid th {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--docs-table-header-bg);
}

.api-table-grid td {
  color: var(--vp-c-text-1);
}

.api-table-grid code {
  font-size: 0.8125rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.api-table-name-cell,
.api-table-description,
.api-table-control {
  display: grid;
  gap: 0.5rem;
}

.api-table-type {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.api-table-copy {
  margin: 0;
}

.api-table-badge {
  display: inline-flex;
  align-items: center;
  inline-size: fit-content;
  border-radius: 999px;
  padding-block: 0.25rem;
  padding-inline: 0.625rem;
  font-size: 0.75rem;
  line-height: 1;
}

.api-table-badge[data-required='true'] {
  color: var(--vp-c-brand-1);
  background: --translucent(var(--vp-c-brand-1), 0.12);
}

.api-table-badge[data-required='false'] {
  color: var(--vp-c-text-2);
  background: --translucent(var(--vp-c-text-2), 0.1);
}

.api-table-muted {
  color: var(--vp-c-text-3);
}
</style>
