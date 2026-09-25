---
title: 卡片
---

<script setup lang="ts">
import { ref } from 'vue';
import { Card } from '@/components/Card';

import CardDefault from '../../demos/card/CardDefault.vue';
import CardDefaultSrc from '../../demos/card/CardDefault.vue?raw';
import CardColors from '../../demos/card/CardColors.vue';
import CardColorsSrc from '../../demos/card/CardColors.vue?raw';
import CardClickable from '../../demos/card/CardClickable.vue';
import CardClickableSrc from '../../demos/card/CardClickable.vue?raw';

const props = ref({
  color: 'elevated',
  clickable: false,
});
</script>

# 卡片

卡片为分组内容提供灵活的容器表面，并支持悬浮、填充、描边和交互样式。

<DemoContainer :viewport="false">
  <Card
    v-bind="props"
    style="display: grid; align-content: end; inline-size: 12rem; min-block-size: 9rem; padding: 1rem;"
  >
    卡片内容
  </Card>
</DemoContainer>

<AnatomyTable scope="card" />

<ApiTable component="Card" v-model="props" />

<StyleTokenTable component="Card" />

## 示例

### 默认

<DemoContainer :src="CardDefaultSrc" :viewport="false">
  <CardDefault />
</DemoContainer>

### 颜色

<DemoContainer :src="CardColorsSrc" :viewport="false">
  <CardColors />
</DemoContainer>

### 可点击

<DemoContainer :src="CardClickableSrc" :viewport="false">
  <CardClickable />
</DemoContainer>
