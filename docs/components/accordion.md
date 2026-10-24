---
title: Accordion
---

<script setup lang="ts">
import AccordionDefault from '../demos/accordion/AccordionDefault.vue';
import AccordionDefaultSrc from '../demos/accordion/AccordionDefault.vue?raw';
import AccordionMultiple from '../demos/accordion/AccordionMultiple.vue';
import AccordionMultipleSrc from '../demos/accordion/AccordionMultiple.vue?raw';
import AccordionStandalone from '../demos/accordion/AccordionStandalone.vue';
import AccordionStandaloneSrc from '../demos/accordion/AccordionStandalone.vue?raw';
</script>

# Accordion

Accordion is provided as the `useAccordion` composable. It manages open state, ARIA attributes, disabled behavior, and trigger keyboard navigation while leaving markup and visual design to the caller.

This is intentionally headless because accordion UI varies heavily by product surface: list rows, cards, settings panels, sidebars, and dense tables all need different structure.

## Examples

### Default

<DemoContainer :src="AccordionDefaultSrc">
  <AccordionDefault />
</DemoContainer>

### Multiple

<DemoContainer :src="AccordionMultipleSrc">
  <AccordionMultiple />
</DemoContainer>

### Custom UI

<DemoContainer :src="AccordionStandaloneSrc">
  <AccordionStandalone />
</DemoContainer>

## Composable

### useAccordion

<SourceApiTable api="useAccordion" />
