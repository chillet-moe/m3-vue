# Composables

M3 Vue 将复杂组件的**交互逻辑**与**视觉呈现**分离。每个复杂组件都由一个对应的 composable 驱动——composable 管理状态、键盘导航和 ARIA 属性，组件则负责 Material Design 3 的样式和模板。

## 为什么分离？

| 问题                                   | 分离后                                                    |
| -------------------------------------- | --------------------------------------------------------- |
| 逻辑内联在 `.vue` 文件中，无法单独测试 | Composable 可以在纯 JS 环境中测试                         |
| 想要自定义模板但又需要标准交互行为     | 使用 composable 直接绑定到自定义元素                      |
| 多个组件需要相同的交互模式             | 共享 composable（如 Select 和 Combobox 复用 `useSelect`） |

## 可用的 Composables

| Composable            | 用途                                      | 对应组件                                           |
| --------------------- | ----------------------------------------- | -------------------------------------------------- |
| `useTabs`             | 标签页切换、键盘导航、ARIA                | `Tabs`, `Tab`, `TabList`, `TabPanel`               |
| `useAccordion`        | 折叠区状态、键盘导航、ARIA                | 无，Accordion 只提供 headless 逻辑                 |
| `useMenu`             | 菜单打开/关闭、键盘导航、子菜单、选择     | `Menu`                                             |
| `useSelect`           | 选项过滤、值管理、菜单控制                | `Select`, `Combobox`                               |
| `usePressShapeMorph`  | 按压变形属性、禁用拦截和释放状态管理      | `Button`, `IconButton`, `Chip`, `Card`, `ListItem` |
| `usePressedState`     | 低层按下状态管理                          | `usePressShapeMorph`                               |
| `useDelegatedTooltip` | 高基数非交互 Tooltip 的事件代理和 slot 池 | 键盘、候选键等动态列表                             |

## 使用方式

### 1. 通过组件（推荐）

大多数情况下，直接使用带样式的组件即可：

```vue
<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@chillet/m3-vue';
import { ref } from 'vue';

const value = ref('tab1');
</script>

<template>
  <Tabs v-model="value">
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
    </TabList>
    <TabPanel value="tab1">内容 1</TabPanel>
    <TabPanel value="tab2">内容 2</TabPanel>
  </Tabs>
</template>
```

### 2. 直接使用 Composable（Headless）

当需要完全自定义外观时，直接使用 composable：

```vue
<script setup>
import { useTabs } from '@chillet/m3-vue';

const tabs = useTabs({ value: 'first' });
const items = ['first', 'second', 'third'];
</script>

<template>
  <div v-bind="tabs.triggerListAttrs.value">
    <button v-for="id in items" :key="id" v-bind="tabs.getTriggerAttrs(id)">
      {{ id }}
    </button>
  </div>

  <div v-for="id in items" :key="id" v-bind="tabs.getPanelAttrs(id)">{{ id }} 的内容</div>
</template>
```

Composable 返回的属性对象包含了所有必要的 `role`、`aria-*`、`tabindex`、事件处理器等，通过 `v-bind` 展开到元素上即可获得完整的可访问性和交互行为。

按压变形可以直接绑定到自定义元素上：

```vue
<script setup>
import { usePressShapeMorph } from '@chillet/m3-vue';

const { pressShapeMorphAttrs } = usePressShapeMorph();
</script>

<template>
  <button v-bind="pressShapeMorphAttrs">Action</button>
</template>
```

### 高基数 Tooltip 的事件代理

当一个列表包含大量动态、非交互 Tooltip 时，不要为每个条目同时创建 Tooltip DOM 和完整的 `v-tooltip`
监听器。`useDelegatedTooltip` 将 hover、focus 和 Escape 事件绑定到容器，并通过有限的 slot 池复用 Tooltip
表面。slot 的内容仍由 Vue 渲染，因此可以保留多行文本、`kbd` 等富标记；交互式富浮层仍应使用独立的
`v-tooltip` 实例。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip, useDelegatedTooltip } from '@chillet/m3-vue';

const container = ref<HTMLElement>();
const { tooltipSlots, refreshTooltip } = useDelegatedTooltip(
  container,
  'keyboard-tooltip',
  (anchor) => anchor.dataset.tooltip ?? null,
  (target) => (target instanceof Element ? target.closest<HTMLElement>('[data-tooltip]') : null),
  3,
);
</script>

<template>
  <div ref="container">
    <button v-for="item in items" :key="item.id" :data-tooltip="item.tooltip">
      {{ item.label }}
    </button>

    <Tooltip v-for="slot in tooltipSlots" :id="slot.id" :key="slot.id" popover="hint">
      <span v-for="line in slot.tooltip?.lines ?? []" :key="line">{{ line }}</span>
    </Tooltip>
  </div>
</template>
```

`tooltipId` 应在同一个 document 内保持唯一。当列表数据改变时，调用 `refreshTooltip()` 让当前 slot 重新解析
内容；组件卸载时 composable 会释放 anchor、slot 控制器和容器监听器。

## API 模式

每个 composable 遵循相同的模式：

```ts
const result = useXxx(options);

// 状态（响应式）
result.value; // ComputedRef<T>

// 属性对象（用于 v-bind）
result.triggerAttrs; // ComputedRef<Record<string, unknown>>

// 方法
result.setValue(v); // 更新状态
```

### Options 接收响应式值

Options 中的大多数属性同时接受静态值和响应式值（`MaybeRefOrGetter<T>`）：

```ts
// 静态
const tabs = useTabs({ orientation: 'vertical' });

// 响应式
const orientation = ref('horizontal');
const tabs = useTabs({ orientation });

// Getter（追踪 prop 变化）
const tabs = useTabs({ orientation: () => props.orientation });
```

### 受控 vs 非受控

传入 `value` 使组件变为受控模式，配合 `onValueChange` 处理变化：

```ts
// 非受控（内部状态）
const tabs = useTabs();

// 受控
const active = ref('tab1');
const tabs = useTabs({
  value: () => active.value,
  onValueChange: (v) => {
    active.value = v;
  },
});
```
