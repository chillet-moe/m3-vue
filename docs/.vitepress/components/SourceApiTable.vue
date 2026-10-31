<script setup lang="ts">
import { Button } from '@/index';
import { computed, useId } from 'vue';
import allMeta from 'virtual:source-api-meta';
import { useLocalStorage } from '@vueuse/core';
import { useData } from 'vitepress';

type SourceApiFieldMeta = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
};

type SourceApiTypeMeta = {
  name: string;
  fields: SourceApiFieldMeta[];
};

type SourceApiMeta = {
  id: string;
  signature: string;
  source: string;
  types: SourceApiTypeMeta[];
};

const props = withDefaults(
  defineProps<{
    api: string;
    type?: string;
    showSignature?: boolean;
  }>(),
  {
    type: undefined,
    showSignature: true,
  },
);
const { lang } = useData();
const isZhHans = computed(() => lang.value === 'zh-Hans');

const meta = computed<SourceApiMeta | null>(() => {
  return (allMeta as Record<string, SourceApiMeta | undefined>)[props.api] ?? null;
});

const collapsed = useLocalStorage('m3-vue-docs:table-collapsed:source-api', false);
const tableId = useId();

const sections = computed(() => {
  if (!meta.value) {
    return [] as SourceApiTypeMeta[];
  }
  if (!props.type) {
    return meta.value.types;
  }
  const matched = meta.value.types.find((item) => item.name === props.type);
  return matched ? [matched] : [];
});

function toggleCollapsed() {
  collapsed.value = !collapsed.value;
}

function getSectionContentId(name: string) {
  return `source-api-table-${name}-${tableId}`;
}
</script>

<template>
  <div class="vp-raw source-api-table">
    <p v-if="!meta" class="source-api-empty">
      {{ isZhHans ? `未找到 ${api} 的 API 元数据。` : `No API metadata found for ${api}.` }}
    </p>
    <template v-else>
      <details v-if="showSignature" class="source-api-signature">
        <summary>{{ isZhHans ? '完整类型签名' : 'Full type signature' }}</summary>
        <code>{{ meta.signature }}</code>
        <p class="source-api-source">
          {{ isZhHans ? '来源：' : 'Source: ' }}<code>{{ meta.source }}</code>
        </p>
      </details>

      <template v-if="sections.length > 0">
        <section v-for="section in sections" :key="section.name" class="source-api-section">
          <Button
            class="source-api-toggle"
            variant="text"
            size="small"
            :leading-icon="collapsed ? 'expand_more' : 'expand_less'"
            :aria-expanded="!collapsed"
            :aria-controls="getSectionContentId(section.name)"
            :aria-label="
              isZhHans
                ? collapsed
                  ? `展开 ${section.name} 表格`
                  : `收起 ${section.name} 表格`
                : collapsed
                  ? `Expand ${section.name} table`
                  : `Collapse ${section.name} table`
            "
            @click="toggleCollapsed"
          >
            <span class="source-api-title">{{ section.name }}</span>
            <span class="source-api-count">{{ section.fields.length }}</span>
          </Button>

          <div v-show="!collapsed" :id="getSectionContentId(section.name)" class="source-api-scroll">
            <table class="source-api-grid">
              <thead>
                <tr>
                  <th>{{ isZhHans ? '字段' : 'Field' }}</th>
                  <th>{{ isZhHans ? '类型' : 'Type' }}</th>
                  <th>{{ isZhHans ? '必填' : 'Required' }}</th>
                  <th>{{ isZhHans ? '说明' : 'Description' }}</th>
                  <th>{{ isZhHans ? '默认值' : 'Default' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="field in section.fields" :key="field.name">
                  <td>
                    <code>{{ field.name }}</code>
                  </td>
                  <td>
                    <code>{{ field.type }}</code>
                  </td>
                  <td>{{ field.required ? (isZhHans ? '是' : 'Yes') : isZhHans ? '否' : 'No' }}</td>
                  <td>{{ field.description || '-' }}</td>
                  <td>
                    <code v-if="field.defaultValue">{{ field.defaultValue }}</code>
                    <span v-else class="source-api-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <p v-else class="source-api-empty">
        {{ isZhHans ? `未找到 ${type ?? api} 的类型元数据。` : `No type metadata found for ${type ?? api}.` }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.source-api-table {
  display: grid;
  gap: 1rem;
  margin-block: 1rem;
}

.source-api-signature {
  padding: 0.875rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--docs-shape-surface);
  background: var(--vp-c-bg-soft);
}

.source-api-signature summary {
  cursor: pointer;
}

.source-api-signature[open] summary {
  margin-block-end: 0.5rem;
}

.source-api-signature code {
  font-size: 0.8125rem;
  white-space: break-spaces;
}

.source-api-source {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
}

.source-api-section {
  display: grid;
  gap: 0.625rem;
}

.source-api-toggle {
  flex: none;
  justify-self: start;
}

.source-api-title {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.source-api-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1.375rem;
  block-size: 1.375rem;
  border-radius: var(--docs-shape-compact);
  padding-inline: 0.375rem;
  color: var(--vp-c-text-2);
  font-size: 0.6875rem;
  font-weight: 500;
  background: var(--vp-c-bg-alt);
}

.source-api-scroll {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--docs-shape-surface);
  background: var(--vp-c-bg-soft);
}

.source-api-grid {
  inline-size: 100%;
  border-collapse: collapse;
}

.source-api-grid th,
.source-api-grid td {
  padding-block: 0.75rem;
  padding-inline: 0.875rem;
  border-block-end: 1px solid var(--vp-c-divider);
  text-align: start;
  vertical-align: top;
}

.source-api-grid tbody tr:last-child td {
  border-block-end: none;
}

.source-api-grid th {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 500;
}

.source-api-grid td {
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.source-api-grid code {
  font-size: 0.8125rem;
  white-space: break-spaces;
}

.source-api-empty {
  margin: 0;
  padding: 0.875rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--docs-shape-surface);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.source-api-muted {
  color: var(--vp-c-text-3);
}
</style>
