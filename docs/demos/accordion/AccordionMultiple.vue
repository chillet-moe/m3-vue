<script setup lang="ts">
import { ref } from 'vue';
import { useAccordion, type AccordionModelValue } from '@/composables/useAccordion';

const openItems = ref<AccordionModelValue>(['notifications', 'storage']);

const accordion = useAccordion({
  value: openItems,
  multiple: true,
  onValueChange: (value) => {
    openItems.value = value;
  },
});

const items = [
  {
    value: 'notifications',
    title: 'Notifications',
    content: 'Email, push, and in-app notification settings can stay open while other sections are edited.',
  },
  {
    value: 'storage',
    title: 'Storage',
    content: 'Review storage usage and retention settings.',
  },
  {
    value: 'billing',
    title: 'Billing',
    content: 'Update payment methods and invoice recipients.',
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
        <span class="demo-accordion-title">{{ item.title }}</span>
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

.demo-accordion-title {
  font: var(--md-sys-typescale-title-small);
}

.demo-accordion-panel {
  padding: 0 1rem 1rem;
}
</style>
