<script setup lang="ts">
import { computed, useId } from 'vue';
import allMeta from 'virtual:source-api-meta';
import { useLocalStorage } from '@vueuse/core';
import { Icon } from '@/components/Icon';

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
    <p v-if="!meta" class="source-api-empty">No API metadata found for {{ api }}.</p>
    <template v-else>
      <div v-if="showSignature" class="source-api-signature">
        <code>{{ meta.signature }}</code>
        <p class="source-api-source">
          Source: <code>{{ meta.source }}</code>
        </p>
      </div>

      <template v-if="sections.length > 0">
        <section v-for="section in sections" :key="section.name" class="source-api-section">
          <button
            class="source-api-toggle m3-state-layer"
            type="button"
            :aria-expanded="!collapsed"
            :aria-controls="getSectionContentId(section.name)"
            :aria-label="collapsed ? `Expand ${section.name} table` : `Collapse ${section.name} table`"
            @click="toggleCollapsed"
          >
            <Icon class="source-api-toggle-icon" name="expand_more" aria-hidden="true" />
            <span class="source-api-title">{{ section.name }}</span>
            <span class="source-api-count">{{ section.fields.length }}</span>
          </button>

          <div v-show="!collapsed" :id="getSectionContentId(section.name)" class="source-api-scroll">
            <table class="source-api-grid">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Default</th>
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
                  <td>{{ field.required ? 'Yes' : 'No' }}</td>
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

      <p v-else class="source-api-empty">No type metadata found for {{ type ?? api }}.</p>
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
  display: grid;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: var(--vp-c-bg-soft);
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  inline-size: fit-content;
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

.source-api-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.source-api-toggle-icon {
  font-size: 1.125rem;
  color: var(--vp-c-text-3);
  transition: transform 0.15s;
}

.source-api-toggle[aria-expanded='true'] .source-api-toggle-icon {
  transform: rotate(180deg);
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
  border-radius: 999px;
  padding-inline: 0.375rem;
  color: var(--vp-c-text-2);
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--vp-c-bg-alt);
}

.source-api-scroll {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
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
  font-weight: 600;
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
  border-radius: 1rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.source-api-muted {
  color: var(--vp-c-text-3);
}
</style>
