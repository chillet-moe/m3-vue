---
title: Card
---

<script setup lang="ts">
import { ref } from 'vue';
import { Card } from '@/components/Card';

import CardDefault from '../demos/card/CardDefault.vue';
import CardDefaultSrc from '../demos/card/CardDefault.vue?raw';
import CardColors from '../demos/card/CardColors.vue';
import CardColorsSrc from '../demos/card/CardColors.vue?raw';
import CardClickable from '../demos/card/CardClickable.vue';
import CardClickableSrc from '../demos/card/CardClickable.vue?raw';

const props = ref({
  color: 'elevated',
  clickable: false,
});
</script>

# Card

Cards provide a flexible surface for grouped content, with elevated, filled, outlined, and interactive treatments.

<DemoContainer :viewport="false">
  <Card
    v-bind="props"
    style="display: grid; align-content: end; inline-size: 12rem; min-block-size: 9rem; padding: 1rem;"
  >
    Card content
  </Card>
</DemoContainer>

<AnatomyTable scope="card" />

<ApiTable component="Card" v-model="props" />

<StyleTokenTable component="Card" />

## Examples

### Default

<DemoContainer :src="CardDefaultSrc" :viewport="false">
  <CardDefault />
</DemoContainer>

### Colors

<DemoContainer :src="CardColorsSrc" :viewport="false">
  <CardColors />
</DemoContainer>

### Clickable

<DemoContainer :src="CardClickableSrc" :viewport="false">
  <CardClickable />
</DemoContainer>
