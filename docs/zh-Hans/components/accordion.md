---
title: 折叠面板
---

<script setup lang="ts">
import AccordionDefault from '../../demos/accordion/AccordionDefault.vue';
import AccordionDefaultSrc from '../../demos/accordion/AccordionDefault.vue?raw';
import AccordionMultiple from '../../demos/accordion/AccordionMultiple.vue';
import AccordionMultipleSrc from '../../demos/accordion/AccordionMultiple.vue?raw';
import AccordionStandalone from '../../demos/accordion/AccordionStandalone.vue';
import AccordionStandaloneSrc from '../../demos/accordion/AccordionStandalone.vue?raw';
</script>

# 折叠面板

Accordion 以 `useAccordion` 组合式函数的形式提供。它负责管理展开状态、ARIA 属性、禁用行为和触发器的键盘导航，标记结构与视觉设计则由调用方决定。

Accordion 有意保持无头设计，因为它在不同产品界面中的呈现差异很大：列表行、卡片、设置面板、侧边栏和紧凑表格都需要不同的结构。

## 组合式函数

### useAccordion

<SourceApiTable api="useAccordion" />

## 示例

### 默认

<DemoContainer :src="AccordionDefaultSrc">
  <AccordionDefault />
</DemoContainer>

### 多项展开

<DemoContainer :src="AccordionMultipleSrc">
  <AccordionMultiple />
</DemoContainer>

### 自定义界面

<DemoContainer :src="AccordionStandaloneSrc">
  <AccordionStandalone />
</DemoContainer>
