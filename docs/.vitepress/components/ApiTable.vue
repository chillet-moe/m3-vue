<script setup lang="ts">
import { computed } from 'vue';
import allMeta from 'virtual:component-meta';

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

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const meta = computed(() => {
  return allMeta[props.component] ?? null;
});

const controlsEnabled = computed(() => {
  return props.modelValue !== undefined;
});

const sections = computed(() => {
  if (!meta.value) {
    return [];
  }

  return [
    {
      key: 'props',
      title: 'Props',
      empty: 'No props documented.',
      rows: meta.value.props,
    },
    {
      key: 'events',
      title: 'Events',
      empty: 'No events documented.',
      rows: meta.value.events,
    },
    {
      key: 'slots',
      title: 'Slots',
      empty: 'No slots documented.',
      rows: meta.value.slots,
    },
  ] as const;
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
</script>

<template>
  <div class="api-table">
    <p v-if="!meta" class="api-table-empty">No API metadata found for {{ component }}.</p>

    <template v-else>
      <section v-for="section in sections" :key="section.key" class="api-table-section">
        <h3 class="api-table-title">{{ section.title }}</h3>

        <p v-if="section.rows.length === 0" class="api-table-empty">
          {{ section.empty }}
        </p>

        <div v-else class="api-table-scroll">
          <table class="api-table-grid">
            <thead>
              <tr v-if="section.key === 'props'">
                <th>Name</th>
                <th>Description</th>
                <th>Default</th>
                <th v-if="controlsEnabled">Control</th>
              </tr>
              <tr v-else-if="section.key === 'events'">
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
              <tr v-else>
                <th>Name</th>
                <th>Parameters</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="section.key === 'props'">
                <tr v-for="prop in meta.props" :key="prop.name">
                  <td>
                    <div class="api-table-name-cell">
                      <code>{{ prop.name }}</code>
                      <span class="api-table-badge" :data-required="prop.required ? 'true' : 'false'">
                        {{ prop.required ? 'Required' : 'Optional' }}
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
              </template>

              <template v-else-if="section.key === 'events'">
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
      </section>
    </template>
  </div>
</template>

<style scoped>
.api-table {
  display: grid;
  gap: 1.5rem;
}

.api-table-section {
  display: grid;
  gap: 0.75rem;
}

.api-table-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.25rem;
  line-height: 1.4;
}

.api-table-empty {
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  padding-block: 1rem;
  padding-inline: 1.125rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.api-table-scroll {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  background: var(--vp-c-bg-soft);
}

.api-table-grid {
  inline-size: 100%;
  border-collapse: collapse;
}

.api-table-grid th,
.api-table-grid td {
  padding-block: 0.875rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--vp-c-divider);
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
  background: --translucent(var(--vp-c-default-soft), 0.5);
}

.api-table-grid td {
  color: var(--vp-c-text-1);
}

.api-table-grid code {
  font-size: 0.8125rem;
  white-space: nowrap;
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
