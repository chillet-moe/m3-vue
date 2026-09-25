---
title: ListItem
---

<script setup lang="ts">
import { ref } from 'vue';
import { ListItem } from '@/components/ListItem';

import ItemDefault from '../../demos/item/ItemDefault.vue';
import ItemDefaultSrc from '../../demos/item/ItemDefault.vue?raw';
import ItemCompositions from '../../demos/item/ItemCompositions.vue';
import ItemCompositionsSrc from '../../demos/item/ItemCompositions.vue?raw';
import ItemRouterLink from '../../demos/item/ItemRouterLink.vue';
import ItemRouterLinkSrc from '../../demos/item/ItemRouterLink.vue?raw';

const props = ref({
  interactive: true,
  shape: 'rounded',
  disabled: false,
  active: false,
  href: undefined,
  leadingIcon: 'person',
  trailingIcon: 'chevron_right',
  title: '个人资料',
  description: '管理你的帐户设置。',
});
</script>

# ListItem

ListItem 提供丰富的列表项布局。默认情况下它可交互，并渲染为按钮；设置 `href` 时则渲染为锚点。对于纯信息行或由内部控件负责交互的行，可设置 `interactive="false"`。此时列表项会渲染为 `div`，不具备按钮、链接、焦点、状态层或按压行为。列表项处于被动状态时，任何 `href` 都会被忽略。

<DemoContainer><ListItem v-bind="props" /></DemoContainer>

<AnatomyTable scope="item" />

<ApiTable component="ListItem" v-model="props" />

<StyleTokenTable component="ListItem" />

`ListItem` 会自动参与 [List Grouping](/zh-Hans/utilities/list-grouping) CSS 工具类的分组；该工具类也可用于分组其他元素和组件。

## 示例

### 默认

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### 组合用法

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>

### Vue Router

当 `ListItem` 用作导航时，请使用 `RouterLink custom`，并将其 `href` 和 `navigate` 传给该组件。

<DemoContainer :src="ItemRouterLinkSrc"><ItemRouterLink /></DemoContainer>
