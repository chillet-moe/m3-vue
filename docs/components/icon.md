---
title: Icon
---

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@/components/Icon';

import IconDefault from '../demos/icon/IconDefault.vue';
import IconDefaultSrc from '../demos/icon/IconDefault.vue?raw';
import IconCatalog from '../demos/icon/IconCatalog.vue';
import IconCatalogSrc from '../demos/icon/IconCatalog.vue?raw';

const props = ref({
  name: 'settings',
});
</script>

# Icon

The icon component renders Material Symbols names directly, making it easy to reuse the same icon tokens across the library and docs.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <div style="display: grid; justify-items: center; gap: 0.75rem;">
    <Icon v-bind="props" />
    <code>{{ props.name }}</code>
  </div>
</DemoContainer>

<ApiTable component="Icon" v-model="props" />

### Default

<DemoContainer :src="IconDefaultSrc" :viewport="false">
  <IconDefault />
</DemoContainer>

### Available Examples

<DemoContainer :src="IconCatalogSrc" :viewport="false">
  <IconCatalog />
</DemoContainer>

In this project’s examples, `favorite`, `home`, `search`, and `settings` are the icons used most often. For a broader catalog, refer to the Material Symbols guide.
