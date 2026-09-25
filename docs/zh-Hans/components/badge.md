---
title: 徽标
---

<script setup lang="ts">
import { ref } from 'vue';
import { Badge } from '@/components/Badge';

import BadgeDefault from '../../demos/badge/BadgeDefault.vue';
import BadgeDefaultSrc from '../../demos/badge/BadgeDefault.vue?raw';
import BadgeVariants from '../../demos/badge/BadgeVariants.vue';
import BadgeVariantsSrc from '../../demos/badge/BadgeVariants.vue?raw';
import BadgeOverflow from '../../demos/badge/BadgeOverflow.vue';
import BadgeOverflowSrc from '../../demos/badge/BadgeOverflow.vue?raw';

const props = ref({
  variant: 'large',
  content: 8,
  max: 999,
  hidden: false,
  ariaLabel: undefined,
});
</script>

# 徽标

徽标用于显示紧凑的状态标记或小型计数。简单圆点使用 small 变体，数字标签使用 large 变体。

<DemoContainer :viewport="false">
  <Badge v-bind="props" />
</DemoContainer>

<AnatomyTable scope="badge" />

<ApiTable component="Badge" v-model="props" />

<StyleTokenTable component="Badge" />

## 示例

### 默认

<DemoContainer :src="BadgeDefaultSrc" :viewport="false">
  <BadgeDefault />
</DemoContainer>

### 变体

<DemoContainer :src="BadgeVariantsSrc" :viewport="false">
  <BadgeVariants />
</DemoContainer>

### 最大值溢出

<DemoContainer :src="BadgeOverflowSrc" :viewport="false">
  <BadgeOverflow />
</DemoContainer>
