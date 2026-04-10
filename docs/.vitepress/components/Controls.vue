<script setup lang="ts">
import { computed } from 'vue';
import allMeta from 'virtual:component-meta';

import ControlItem from './ControlItem.vue';
import type { PropMeta } from '../plugins/component-meta';

type ControlType = 'switch' | 'select' | 'text' | 'number' | 'none';

const props = withDefaults(
  defineProps<{
    component: string;
    modelValue: Record<string, unknown>;
    exclude?: string[];
  }>(),
  {
    exclude: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

function getControlType(prop: PropMeta): ControlType {
  const type = prop.type.toLowerCase();

  if (type === 'boolean' || type === 'boolean | undefined') {
    return 'switch';
  }

  if (prop.options?.length) {
    return 'select';
  }

  if (type === 'string' || type === 'string | undefined') {
    return 'text';
  }

  if (type === 'number' || type === 'number | undefined') {
    return 'number';
  }

  return 'none';
}

const meta = computed(() => {
  return allMeta[props.component] ?? null;
});

const visibleProps = computed(() => {
  if (!meta.value) {
    return [];
  }

  return meta.value.props.filter((prop: PropMeta) => {
    return !props.exclude.includes(prop.name) && getControlType(prop) !== 'none';
  });
});

function updatePropValue(name: string, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  });
}
</script>

<template>
  <section class="controls-panel">
    <header class="controls-header">
      <h3 class="controls-title">Controls</h3>
      <p class="controls-subtitle">Live-edit documented props for {{ component }}.</p>
    </header>

    <p v-if="!meta" class="controls-empty">No control metadata found for {{ component }}.</p>
    <p v-else-if="visibleProps.length === 0" class="controls-empty">No supported controls for this component yet.</p>

    <div v-else class="controls-grid">
        <div v-for="prop in visibleProps" :key="prop.name" class="controls-row">
        <div class="controls-meta">
          <span class="controls-label">{{ prop.name }}</span>
          <code class="controls-type">{{ prop.type }}</code>
          <p v-if="prop.description" class="controls-description">{{ prop.description }}</p>
        </div>

        <div class="controls-input">
          <ControlItem
            :prop="prop"
            :model-value="modelValue[prop.name]"
            @update:model-value="updatePropValue(prop.name, $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.controls-panel {
  display: grid;
  gap: --dp(20);
  margin-block: --dp(20);
  border: 1px solid var(--vp-c-divider);
  border-radius: --dp(24);
  padding: --dp(20);
  background: var(--vp-c-bg-soft);
}

.controls-header {
  display: grid;
  gap: --dp(4);
}

.controls-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: --dp(20);
}

.controls-subtitle,
.controls-empty,
.controls-description {
  margin: 0;
  color: var(--vp-c-text-2);
}

.controls-grid {
  display: grid;
  gap: --dp(16);
}

.controls-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(--dp(240), auto);
  gap: --dp(16);
  align-items: center;
  border: 1px solid --translucent(var(--vp-c-divider), 0.8);
  border-radius: --dp(20);
  padding-block: --dp(14);
  padding-inline: --dp(16);
  background: var(--vp-c-bg);
}

.controls-meta {
  display: grid;
  gap: --dp(6);
}

.controls-label {
  color: var(--vp-c-text-1);
  font-size: --dp(15);
  font-weight: 600;
}

.controls-type {
  inline-size: fit-content;
  color: var(--vp-c-text-2);
  font-size: --dp(12);
}

.controls-input {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 40rem) {
  .controls-row {
    grid-template-columns: 1fr;
  }

  .controls-input {
    justify-content: stretch;
  }
}
</style>
