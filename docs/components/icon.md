---
title: Icon
---

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@/components/Icon';

import IconDefault from '../demos/icon/IconDefault.vue';
import IconDefaultSrc from '../demos/icon/IconDefault.vue?raw';

const props = ref({
  name: 'settings',
});
</script>

# Icon

The icon component renders Material Symbols names directly, making it easy to reuse the same icon tokens across the library and docs.
Standalone icons are 24px by default, independent of the surrounding text size. Use the `inline` variant when an icon should
follow the surrounding text size and weight.

<DemoContainer :viewport="false">
  <div style="display: grid; justify-items: center; gap: 0.75rem;">
    <Icon v-bind="props" />
    <code>{{ props.name }}</code>
  </div>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="IconDefaultSrc" :viewport="false">
  <IconDefault />
</DemoContainer>

## Reference

<AnatomyTable scope="icon" />

<ApiTable component="Icon" v-model="props" />

<StyleTokenTable component="Icon" />
