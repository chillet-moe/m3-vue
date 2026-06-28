<script setup lang="ts">
import { ref } from 'vue';
import { useAccordion, type AccordionModelValue } from '@/composables/useAccordion';

const openItem = ref<AccordionModelValue>('overview');

const accordion = useAccordion({
  value: openItem,
  onValueChange: (value) => {
    openItem.value = value;
  },
});

const items = [
  {
    value: 'overview',
    title: 'Overview',
    supportingText: 'Current workspace summary',
    content: 'Review the activity, pinned projects, and pending updates for this workspace.',
  },
  {
    value: 'members',
    title: 'Members',
    supportingText: 'People with access',
    content: 'Manage user roles, invitations, and access changes.',
  },
  {
    value: 'security',
    title: 'Security',
    supportingText: 'Authentication settings',
    content: 'Configure login methods and session policies.',
  },
];
</script>

<template>
  <div class="demo-accordion" v-bind="accordion.rootAttrs.value">
    <section
      v-for="item in items"
      :key="item.value"
      class="demo-accordion-item"
      v-bind="accordion.getItemAttrs(item.value)"
    >
      <button class="demo-accordion-trigger" v-bind="accordion.getTriggerAttrs(item.value)">
        <span class="demo-accordion-header">
          <span class="demo-accordion-title">{{ item.title }}</span>
          <span class="demo-accordion-supporting">{{ item.supportingText }}</span>
        </span>
        <span aria-hidden="true">{{ accordion.isOpen(item.value) ? 'Close' : 'Open' }}</span>
      </button>

      <div class="demo-accordion-panel" v-bind="accordion.getPanelAttrs(item.value)">
        {{ item.content }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-accordion {
  display: grid;
  gap: 0.5rem;
  max-inline-size: 32rem;
}

.demo-accordion-item {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
  overflow: hidden;
}

.demo-accordion-trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  inline-size: 100%;
  border: 0;
  padding: 1rem;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  text-align: start;
}

.demo-accordion-header {
  display: grid;
  gap: 0.25rem;
}

.demo-accordion-title {
  font: var(--md-sys-typescale-title-small);
}

.demo-accordion-supporting {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
}

.demo-accordion-panel {
  padding: 0 1rem 1rem;
}
</style>
