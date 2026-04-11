<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import allAnatomy from 'virtual:component-anatomy';

const props = defineProps<{
  scope: string;
}>();

const anatomy = computed(() => {
  return allAnatomy[props.scope] ?? null;
});

const highlightEnabled = ref(false);
const highlightedPart = ref<string | null>(null);

function highlightElements(part: string) {
  if (!highlightEnabled.value) return;
  const elements = document.querySelectorAll<HTMLElement>(
    `[data-scope="${props.scope}"][data-part="${part}"]`,
  );
  for (const el of elements) {
    el.dataset.anatomyHighlight = 'true';
  }
}

function clearHighlights() {
  const highlighted = document.querySelectorAll<HTMLElement>(
    `[data-scope="${props.scope}"][data-anatomy-highlight]`,
  );
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

watch(highlightEnabled, (enabled) => {
  if (!enabled) {
    clearHighlights();
    highlightedPart.value = null;
  }
});
</script>

<template>
  <div v-if="anatomy" class="vp-raw anatomy-panel">
    <div class="anatomy-header">
      <span class="anatomy-header-title">Anatomy</span>
      <label class="anatomy-highlight-toggle">
        <input v-model="highlightEnabled" type="checkbox" class="anatomy-highlight-checkbox" />
        <span class="anatomy-highlight-label">Highlight</span>
      </label>
    </div>

    <div class="anatomy-parts-list">
      <div
        v-for="part in anatomy.parts"
        :key="part.part"
        class="anatomy-part-row"
        :data-active="highlightedPart === part.part ? 'true' : 'false'"
        @pointerenter="onRowEnter(part.part)"
        @pointerleave="onRowLeave()"
      >
        <code class="anatomy-part-element">&lt;{{ part.element }}&gt;</code>
        <span class="anatomy-part-name">{{ part.part }}</span>
        <span v-if="part.conditional" class="anatomy-part-conditional">conditional</span>
        <code class="anatomy-part-selector">[data-scope="{{ scope }}"][data-part="{{ part.part }}"]</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anatomy-panel {
  margin-block: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  overflow: clip;
  background: var(--vp-c-bg-soft);
}

.anatomy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.anatomy-header-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
}

.anatomy-highlight-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  user-select: none;
}

.anatomy-highlight-checkbox {
  margin: 0;
  cursor: pointer;
}

.anatomy-highlight-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.anatomy-parts-list {
  display: grid;
  gap: 0;
  padding: 0.375rem 0.5rem;
}

.anatomy-part-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  cursor: default;
  transition: background-color 0.15s;
}

.anatomy-part-row:hover,
.anatomy-part-row[data-active="true"] {
  background: var(--vp-c-bg-alt);
}

.anatomy-part-element {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.anatomy-part-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.anatomy-part-conditional {
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  background: var(--vp-c-bg-alt);
  padding: 0.0625rem 0.375rem;
  border-radius: 999px;
}

.anatomy-part-selector {
  margin-inline-start: auto;
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  opacity: 0;
  transition: opacity 0.15s;
}

.anatomy-part-row:hover .anatomy-part-selector {
  opacity: 1;
}
</style>

<style>
[data-anatomy-highlight="true"] {
  outline: 2px dashed var(--md-sys-color-primary, #6750a4) !important;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
