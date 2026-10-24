---
title: FloatingActionButton
---

<script setup lang="ts">
import { ref } from 'vue';
import { FloatingActionButton } from '@/components/FloatingActionButton';

import FloatingActionButtonDefault from '../demos/floating-action-button/FloatingActionButtonDefault.vue';
import FloatingActionButtonDefaultSrc from '../demos/floating-action-button/FloatingActionButtonDefault.vue?raw';
import FloatingActionButtonExtended from '../demos/floating-action-button/FloatingActionButtonExtended.vue';
import FloatingActionButtonExtendedSrc from '../demos/floating-action-button/FloatingActionButtonExtended.vue?raw';
import FloatingActionButtonSizes from '../demos/floating-action-button/FloatingActionButtonSizes.vue';
import FloatingActionButtonSizesSrc from '../demos/floating-action-button/FloatingActionButtonSizes.vue?raw';
import FloatingActionButtonColors from '../demos/floating-action-button/FloatingActionButtonColors.vue';
import FloatingActionButtonColorsSrc from '../demos/floating-action-button/FloatingActionButtonColors.vue?raw';
import FloatingActionButtonDisabled from '../demos/floating-action-button/FloatingActionButtonDisabled.vue';
import FloatingActionButtonDisabledSrc from '../demos/floating-action-button/FloatingActionButtonDisabled.vue?raw';
import FloatingActionButtonTooltip from '../demos/floating-action-button/FloatingActionButtonTooltip.vue';
import FloatingActionButtonTooltipSrc from '../demos/floating-action-button/FloatingActionButtonTooltip.vue?raw';

const props = ref({
  color: 'primary-container',
  size: 'regular',
  href: undefined,
  icon: 'edit',
  disabled: false,
});
</script>

# FloatingActionButton

Floating action buttons represent the primary action on a screen. This component implements the M3 Expressive FAB sizes and color styles; label content turns it into an extended FAB.

Action components convert `title` into the library tooltip. See [Action Tooltips](/components/tooltip#action-tooltips) for the shared behavior and accessible-name fallback.

<DemoContainer>
  <FloatingActionButton v-bind="props" aria-label="Edit" />
</DemoContainer>

## Examples

### Default

<DemoContainer :src="FloatingActionButtonDefaultSrc">
  <FloatingActionButtonDefault />
</DemoContainer>

### Extended

<DemoContainer :src="FloatingActionButtonExtendedSrc">
  <FloatingActionButtonExtended />
</DemoContainer>

### Sizes

<DemoContainer :src="FloatingActionButtonSizesSrc">
  <FloatingActionButtonSizes />
</DemoContainer>

### Colors

<DemoContainer :src="FloatingActionButtonColorsSrc">
  <FloatingActionButtonColors />
</DemoContainer>

### Disabled

<DemoContainer :src="FloatingActionButtonDisabledSrc">
  <FloatingActionButtonDisabled />
</DemoContainer>

### Tooltip

`title` is converted into the library tooltip instead of rendering a native HTML tooltip. It is also used as the fallback `aria-label` when no explicit accessible name is provided.

<DemoContainer :src="FloatingActionButtonTooltipSrc">
  <FloatingActionButtonTooltip />
</DemoContainer>

## Reference

<AnatomyTable scope="floating-action-button" />

<ApiTable component="FloatingActionButton" v-model="props" />

<StyleTokenTable component="FloatingActionButton" />
