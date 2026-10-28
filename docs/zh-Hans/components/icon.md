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

## 示例

### 默认

<DemoContainer :src="IconDefaultSrc" :viewport="false">
  <IconDefault />
</DemoContainer>

## 尺寸与自定义来源

使用[图标尺寸演示](../guides/icon-sizing)对比密度、组件尺寸、来源校准和相对文本的图标。`Icon` 可在默认插槽中接收 SVG；`contentRatio` 可校准 SVG 内部留白，且不会改变布局。

## 参考

<AnatomyTable scope="icon" />

<ApiTable component="Icon" v-model="props" />

<StyleTokenTable component="Icon" />
