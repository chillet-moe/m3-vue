---
title: Badge
---

<script setup lang="ts">
import { ref } from 'vue';
import { Badge } from '@/components/Badge';

import BadgeDefault from '../demos/badge/BadgeDefault.vue';
import BadgeDefaultSrc from '../demos/badge/BadgeDefault.vue?raw';
import BadgeVariants from '../demos/badge/BadgeVariants.vue';
import BadgeVariantsSrc from '../demos/badge/BadgeVariants.vue?raw';
import BadgeOverflow from '../demos/badge/BadgeOverflow.vue';
import BadgeOverflowSrc from '../demos/badge/BadgeOverflow.vue?raw';

const props = ref({
  variant: 'large',
  content: 8,
  max: 999,
  hidden: false,
  ariaLabel: undefined,
});
</script>

# Badge

Badges show compact status markers or small counts. Use the small variant for a simple dot and the large variant for numeric labels.

<DemoContainer :viewport="false">
  <Badge v-bind="props" />
</DemoContainer>

## Examples

### Default

<DemoContainer :src="BadgeDefaultSrc" :viewport="false">
  <BadgeDefault />
</DemoContainer>

### Variants

<DemoContainer :src="BadgeVariantsSrc" :viewport="false">
  <BadgeVariants />
</DemoContainer>

### Max Overflow

<DemoContainer :src="BadgeOverflowSrc" :viewport="false">
  <BadgeOverflow />
</DemoContainer>

## Reference

<AnatomyTable scope="badge" />

<ApiTable component="Badge" v-model="props" />

<StyleTokenTable component="Badge" />
