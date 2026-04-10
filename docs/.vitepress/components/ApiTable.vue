<script setup lang="ts">
import { computed } from 'vue';
import allMeta from 'virtual:component-meta';

const props = defineProps<{
  component: string;
}>();

const meta = computed(() => {
  return allMeta[props.component] ?? null;
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
                <th>Type</th>
                <th>Default</th>
                <th>Required</th>
                <th>Description</th>
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
                    <code>{{ prop.name }}</code>
                  </td>
                  <td>
                    <div class="api-table-type">
                      <template v-if="prop.options?.length">
                        <code v-for="option in prop.options" :key="option">{{ option }}</code>
                      </template>
                      <code v-else>{{ prop.type }}</code>
                    </div>
                  </td>
                  <td>
                    <code v-if="prop.default">{{ prop.default }}</code>
                    <span v-else class="api-table-muted">-</span>
                  </td>
                  <td>
                    <span class="api-table-badge" :data-required="prop.required ? 'true' : 'false'">
                      {{ prop.required ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td>{{ prop.description || '-' }}</td>
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
  gap: --dp(24);
}

.api-table-section {
  display: grid;
  gap: --dp(12);
}

.api-table-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: --dp(20);
  line-height: 1.4;
}

.api-table-empty {
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: --dp(20);
  padding-block: --dp(16);
  padding-inline: --dp(18);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.api-table-scroll {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: --dp(20);
  background: var(--vp-c-bg-soft);
}

.api-table-grid {
  inline-size: 100%;
  border-collapse: collapse;
}

.api-table-grid th,
.api-table-grid td {
  padding-block: --dp(14);
  padding-inline: --dp(16);
  border-block-end: 1px solid var(--vp-c-divider);
  text-align: start;
  vertical-align: start;
}

.api-table-grid tbody tr:last-child td {
  border-block-end: none;
}

.api-table-grid th {
  color: var(--vp-c-text-2);
  font-size: --dp(13);
  font-weight: 600;
  background: --translucent(var(--vp-c-default-soft), 0.5);
}

.api-table-grid td {
  color: var(--vp-c-text-1);
}

.api-table-grid code {
  font-size: --dp(13);
  white-space: nowrap;
}

.api-table-type {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(8);
}

.api-table-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding-block: --dp(4);
  padding-inline: --dp(10);
  font-size: --dp(12);
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
