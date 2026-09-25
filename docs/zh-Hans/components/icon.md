---
title: Icon
---

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@/components/Icon';

import IconDefault from '../../demos/icon/IconDefault.vue';
import IconDefaultSrc from '../../demos/icon/IconDefault.vue?raw';

const props = ref({
  name: 'settings',
});
</script>

# Icon

Icon 组件可直接渲染 Material Symbols 名称，便于在整个组件库和文档中复用相同的图标名称。独立图标默认尺寸为 24px，不受周围文本大小影响。图标需要跟随周围文本的大小和字重时，请使用 `inline` 变体。

<DemoContainer :viewport="false">
  <div style="display: grid; justify-items: center; gap: 0.75rem;">
    <Icon v-bind="props" />
    <code>{{ props.name }}</code>
  </div>
</DemoContainer>

<AnatomyTable scope="icon" />

<ApiTable component="Icon" v-model="props" />

<StyleTokenTable component="Icon" />

## 示例

### 默认

<DemoContainer :src="IconDefaultSrc" :viewport="false">
  <IconDefault />
</DemoContainer>
