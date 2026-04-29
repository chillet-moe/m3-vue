<script setup lang="ts">
import { computed, useId } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { Icon } from '@/components/Icon';
import { styleTokenMeta } from './style-token-meta';

const props = defineProps<{
  component: string;
}>();

const tokens = computed(() => {
  return styleTokenMeta[props.component] ?? [];
});

const collapsed = useLocalStorage('m3-vue-docs:table-collapsed:styling', false);
const tableId = useId();

function toggleCollapsed() {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <section class="vp-raw style-token-table">
    <button
      class="style-token-table-toggle m3-state-layer"
      type="button"
      :aria-expanded="!collapsed"
      :aria-controls="`style-token-table-content-${tableId}`"
      :aria-label="collapsed ? 'Expand styling table' : 'Collapse styling table'"
      @click="toggleCollapsed"
    >
      <Icon class="style-token-table-toggle-icon" name="expand_more" aria-hidden="true" />
      <span class="style-token-table-title">Styling</span>
      <span class="style-token-table-count">{{ tokens.length }}</span>
    </button>

    <div v-show="!collapsed" :id="`style-token-table-content-${tableId}`">
      <p v-if="tokens.length === 0" class="style-token-table-empty">
        No styling tokens documented for {{ component }}.
      </p>

      <div v-else class="style-token-table-scroll">
        <table class="style-token-table-grid">
          <thead>
            <tr>
              <th>Token</th>
              <th>Description</th>
              <th>Fallback</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.name">
              <td>
                <div class="style-token-table-name-cell">
                  <code>{{ token.name }}</code>
                  <span v-if="token.category" class="style-token-table-badge">{{ token.category }}</span>
                </div>
              </td>
              <td>{{ token.description }}</td>
              <td>
                <code>{{ token.fallback }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.style-token-table {
  display: grid;
  gap: 0.75rem;
  margin-block: 1.5rem;
}

.style-token-table-toggle {
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
  margin-inline-start: -0.625rem;
}

.style-token-table-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.style-token-table-toggle-icon {
  font-size: 1.125rem;
  color: var(--vp-c-text-3);
  transition: transform 0.15s;
}

.style-token-table-toggle[aria-expanded='true'] .style-token-table-toggle-icon {
  transform: rotate(180deg);
}

.style-token-table-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.25rem;
  line-height: 1.4;
}

.style-token-table-count {
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

.style-token-table-empty {
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.style-token-table-scroll {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  background: var(--vp-c-bg-soft);
}

.style-token-table-grid {
  inline-size: 100%;
  border-collapse: collapse;
}

.style-token-table-grid th,
.style-token-table-grid td {
  padding-block: 0.875rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--vp-c-divider);
  text-align: start;
  vertical-align: start;
}

.style-token-table-grid tbody tr:last-child td {
  border-block-end: none;
}

.style-token-table-grid th {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  background: --translucent(var(--vp-c-default-soft), 0.5);
}

.style-token-table-grid td {
  color: var(--vp-c-text-1);
}

.style-token-table-grid code {
  font-size: 0.8125rem;
  white-space: nowrap;
}

.style-token-table-name-cell {
  display: grid;
  gap: 0.5rem;
}

.style-token-table-badge {
  display: inline-flex;
  align-items: center;
  inline-size: fit-content;
  border-radius: 999px;
  padding-block: 0.25rem;
  padding-inline: 0.625rem;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  line-height: 1;
  background: --translucent(var(--vp-c-text-2), 0.1);
}
</style>
