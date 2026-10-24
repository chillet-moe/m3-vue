# Composables

M3 Vue 优先提供可直接使用的组件。Composable 用于封装需要复用的交互逻辑、状态或生命周期行为；需要自定义模板或在组件外复用这些逻辑时，也可以直接使用公开的 composable。组件并不都依赖独立的 composable，Vue 组件本身也可以单独测试。

## 为什么分离？

| 使用场景                     | 可采用的方式                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| 直接使用库提供的外观和交互   | 使用现成组件                                                                         |
| 需要自定义模板或复用交互逻辑 | 使用适合该场景的公开 composable                                                      |
| 多个组件共享同一套交互行为   | 在共同实现边界复用逻辑，例如 Combobox 包装 Select，因而复用其完整的 `useSelect` 逻辑 |

## 可用的 Composables

| Composable            | 用途                                                       | 对应组件                                                                                                                               |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useTabs`             | 标签页状态、切换、键盘导航和 ARIA 属性                     | `Tabs`                                                                                                                                 |
| `useAccordion`        | 折叠项状态、开合行为和 ARIA 属性                           | 无对应的 Accordion 组件；提供 headless 逻辑                                                                                            |
| `useMenu`             | 菜单打开/关闭、键盘导航、子菜单和选择                      | `Menu`, `FloatingActionButtonMenu`                                                                                                     |
| `useSelect`           | 选项过滤与导航、选择状态、菜单控制、选项属性及虚拟列表滚动 | `Select`；`Combobox` 包装 `Select`                                                                                                     |
| `usePopover`          | 同步原生 Popover 的打开/关闭状态、关闭事件和退出动画       | `Popover`                                                                                                                              |
| `useAnimatedNumber`   | 数值变化动画                                               | `Slider`；也用于进度状态逻辑                                                                                                           |
| `usePressShapeMorph`  | 按压状态、形状变形属性及禁用状态处理                       | `Button`, `IconButton`, `Chip`, `Card`, `ListItem`, `FloatingActionButton`, `FloatingActionButtonMenu`, `FloatingActionButtonMenuItem` |
| `usePressedState`     | 低层按下状态管理                                           | `usePressShapeMorph`                                                                                                                   |
| `useDelegatedTooltip` | 为大量动态 Tooltip 提供事件代理和可复用的 Tooltip slot     | 面向自定义列表；没有绑定到特定组件                                                                                                     |

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
`v-tooltip` 实例。首次 hover 会立即显示；只有从一个已显示的 anchor 切换到另一个 anchor 时才使用短暂
debounce，避免快速扫过列表时 Tooltip 闪烁，键盘 focus 切换不延迟。

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

## API

每个 composable 都有针对其职责设计的参数和返回值。请查阅对应的类型定义和组件示例，不要假设它们共用一套状态、属性或方法接口。

### Options 接收响应式值

是否接受静态值、响应式引用或 getter 由各 composable 的类型定义决定。以 `useTabs` 的 `orientation` 为例：

```ts
// 静态
const tabs = useTabs({ orientation: 'vertical' });

// 响应式
const orientation = ref('horizontal');
const tabs = useTabs({ orientation });

// Getter（追踪 prop 变化）
const tabs = useTabs({ orientation: () => props.orientation });
```

### 受控与非受控

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
