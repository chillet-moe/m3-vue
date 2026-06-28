<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@/components/Icon';
import { useAccordion, type AccordionModelValue } from '@/composables/useAccordion';

const openItem = ref<AccordionModelValue>();

const accordion = useAccordion({
  value: openItem,
  onValueChange: (value) => {
    openItem.value = value;
  },
});

const items = [
  {
    value: 'appearance',
    title: 'Appearance',
    icon: 'palette',
    content: 'Choose density, contrast, and theme preferences.',
  },
  {
    value: 'shortcuts',
    title: 'Shortcuts',
    icon: 'keyboard',
    content: 'Customize frequently used command shortcuts.',
  },
];
</script>

<template>
  <div class="demo-accordion" v-bind="accordion.rootAttrs.value">
    <article v-for="item in items" :key="item.value" class="demo-card" v-bind="accordion.getItemAttrs(item.value)">
      <button class="demo-card-trigger" v-bind="accordion.getTriggerAttrs(item.value)">
        <Icon :name="item.icon" size="1.25rem" />
        <span>{{ item.title }}</span>
      </button>

      <p class="demo-card-content" v-bind="accordion.getPanelAttrs(item.value)">
        {{ item.content }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.demo-accordion {
  display: grid;
  gap: 0.75rem;
  max-inline-size: 32rem;
}

.demo-card {
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.demo-card-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  inline-size: 100%;
  border: 0;
  padding: 1rem;
  background: transparent;
  color: inherit;
  font: var(--md-sys-typescale-title-small);
  text-align: start;
}

.demo-card-content {
  margin: 0;
  padding: 0 1rem 1rem 3rem;
}
</style>
