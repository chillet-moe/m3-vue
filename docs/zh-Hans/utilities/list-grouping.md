---
title: 列表分组
---

<script setup lang="ts">
import ListGroupingDefault from '../../demos/list-grouping/ListGroupingDefault.vue';
import ListGroupingDefaultSrc from '../../demos/list-grouping/ListGroupingDefault.vue?raw';
import ListGroupingParticipants from '../../demos/list-grouping/ListGroupingParticipants.vue';
import ListGroupingParticipantsSrc from '../../demos/list-grouping/ListGroupingParticipants.vue?raw';
import ListGroupingBoundaries from '../../demos/list-grouping/ListGroupingBoundaries.vue';
import ListGroupingBoundariesSrc from '../../demos/list-grouping/ListGroupingBoundaries.vue?raw';
import ListGroupingShapes from '../../demos/list-grouping/ListGroupingShapes.vue';
import ListGroupingShapesSrc from '../../demos/list-grouping/ListGroupingShapes.vue?raw';
</script>

# 列表分组

列表分组是一种 CSS 工具，用于为相关的直接子元素应用连续的圆角形状。它不会渲染包装元素，也不会强加布局、间距、ARIA 角色或列表语义。

在容器上添加 `data-scope="list" data-part="container"`。直接子元素通过 `data-list-group-item` 声明参与，并将 `data-shape` 设为 `rounded` 或 `square`：

```vue
<section class="settings-list" data-scope="list" data-part="container">
  <ListItem title="账户" />
  <StatusRow data-list-group-item data-shape="rounded" />
  <article data-list-group-item data-shape="rounded">刚刚同步</article>
</section>
```

`ListItem` 会自动带上参与标记，并由其 `shape` 属性提供 `data-shape`。其他元素和组件必须显式提供这两个属性。

## 行为

使用默认 token 时，圆角中间项使用 `8px` 半径，首项和末项的外侧圆角使用 `24px`。方角中间项使用 `4px`；首项和末项的内侧圆角使用 `4px`，外侧则保留各自的形状。

只有带标记的直接子元素会参与。标题、分隔线和其他未标记子元素不会影响首项或末项的匹配。嵌套的分组容器会形成独立分组。此工具只为参与元素的根节点设置样式，因此自定义组件仍需自行处理内部表面和裁剪。

如果容器或参与标记放在 Vue 组件上，该组件的根节点必须接收透传属性。单根组件默认支持此行为；使用 `inheritAttrs: false` 的组件应将 `$attrs` 转发到指定根节点。

`ListItem` 还会根据解析出的分组形状调整其活动指示器。

## 示例

### 圆角和方角

同一个容器约定支持圆角和方角参与项，包括混合使用自定义根节点。

<DemoContainer :src="ListGroupingDefaultSrc"><ListGroupingDefault /></DemoContainer>

### 被动项和自定义参与项

交互行为独立于分组。被动的 `ListItem` 根节点和用户自定义元素使用相同的形状约定参与分组。

<DemoContainer :src="ListGroupingParticipantsSrc"><ListGroupingParticipants /></DemoContainer>

### 不参与的元素和嵌套分组

未标记的直接子元素会被忽略，而嵌套容器会自行计算其首项和末项。

<DemoContainer :src="ListGroupingBoundariesSrc"><ListGroupingBoundaries /></DemoContainer>

### 自定义形状

在每个容器上设置分组 token，即可调整中间和外侧圆角，而无需选择参与项的内部元素。

<DemoContainer :src="ListGroupingShapesSrc"><ListGroupingShapes /></DemoContainer>

## 样式

在分组容器上设置以下 token。

<StyleTokenTable component="ListGrouping" />
