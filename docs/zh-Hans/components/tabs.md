---
title: Tabs
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';

import TabsDefault from '../../demos/tabs/TabsDefault.vue';
import TabsDefaultSrc from '../../demos/tabs/TabsDefault.vue?raw';
import TabsLine from '../../demos/tabs/TabsLine.vue';
import TabsLineSrc from '../../demos/tabs/TabsLine.vue?raw';
import TabsDisabled from '../../demos/tabs/TabsDisabled.vue';
import TabsDisabledSrc from '../../demos/tabs/TabsDisabled.vue?raw';
import TabsWithIcons from '../../demos/tabs/TabsWithIcons.vue';
import TabsWithIconsSrc from '../../demos/tabs/TabsWithIcons.vue?raw';
import TabsLinks from '../../demos/tabs/TabsLinks.vue';
import TabsLinksSrc from '../../demos/tabs/TabsLinks.vue?raw';
import TabsHeadless from '../../demos/tabs/TabsHeadless.vue';
import TabsHeadlessSrc from '../../demos/tabs/TabsHeadless.vue?raw';

const props = ref({
  variant: 'navigation',
  divider: false,
  dividerFullWidth: false,
  size: 'medium',
  mode: 'auto',
});

const value = ref('overview');
</script>

# Tabs

Tabs 将内容组织为多个独立视图，同一时间只显示一个视图。每个标签页都会触发其对应的面板。

默认的 `navigation` 变体面向桌面导航，包含外框和选中容器。若需更轻量、紧凑的标签栏，可使用透明的 `line` 变体，其下划线宽度与文本相同。添加 `divider` 可显示底部分隔线；与 `divider-full-width` 配合使用时，分隔线会延伸至整个 Tabs 根元素。

Tabs 默认根据内容确定宽度。仅当标签页需要平分并填满可用宽度时使用 `mode="fixed"`；如果每个标签页需要保留最小触控区域并允许水平溢出，则使用 `mode="scrollable"`。

Tabs 基于 `useTabs` composable 构建：键盘导航、ARIA 属性和值管理等交互逻辑由该 composable 负责，组件则提供 MD3 样式。详情请参阅 [Composables](/zh-Hans/guides/composables)。

<DemoContainer>
  <Tabs v-model="value" v-bind="props">
    <TabList>
      <Tab value="overview">概览</Tab>
      <Tab value="analytics">分析</Tab>
      <Tab value="reports">报告</Tab>
      <Tab value="settings">设置</Tab>
    </TabList>
    <TabPanel value="overview">概览内容</TabPanel>
    <TabPanel value="analytics">分析内容</TabPanel>
    <TabPanel value="reports">报告内容</TabPanel>
    <TabPanel value="settings">设置内容</TabPanel>
  </Tabs>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="TabsDefaultSrc">
  <TabsDefault />
</DemoContainer>

### 线条变体

<DemoContainer :src="TabsLineSrc">
  <TabsLine />
</DemoContainer>

### 禁用 Tab

禁用的标签页不会响应指针交互，也不会进入键盘 Tab 顺序；方向键导航会跳过它们。

<DemoContainer :src="TabsDisabledSrc">
  <TabsDisabled />
</DemoContainer>

### 带图标s

<DemoContainer :src="TabsWithIconsSrc">
  <TabsWithIcons />
</DemoContainer>

### 路由链接

使用与 `Button` 和 `ListItem` 相同的 `RouterLink custom` 模式，然后将生成的 `href` 和 `navigate` 处理函数传给 `Tab`。

<DemoContainer :src="TabsLinksSrc">
  <TabsLinks />
</DemoContainer>

### 无头模式（仅 useTabs）

直接使用 `useTabs` composable 构建自定义标签页界面，不受预设样式限制。

<DemoContainer :src="TabsHeadlessSrc">
  <TabsHeadless />
</DemoContainer>

默认标签图标会根据尺寸对应的排版角色和密度调整大小。`--md-tabs-icon-size` 可设置最终尺寸。

## 参考

<AnatomyTable scope="tabs" />

<ApiTable component="Tabs" v-model="props" />

<StyleTokenTable component="Tabs" />

### Tab

<ApiTable component="Tab" />

### TabList

<ApiTable component="TabList" />

### TabPanel

<ApiTable component="TabPanel" />

## Composable

### useTabs

<SourceApiTable api="useTabs" />
