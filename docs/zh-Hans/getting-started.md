---
title: 开始使用
---

# 开始使用

安装此包、导入共享样式表，并在应用启动时注册一次插件。

## 安装

```bash
pnpm add @chillet/m3-vue
```

m3-vue 的构建会为 scoped SFC 样式启用 `@chillet/vue-scope-boundary`，但不会修改 Vue。为避免自定义的正向 HTML 类型选择器依赖 m3-vue 组件的私有根标签，请在使用方的 Vite 应用中启用编译器集成。Class、ID 和属性选择器会有意保留 Vue 对子组件根元素的正常行为。安装、行为和限制请参阅 [Vue Scope Boundaries](/zh-Hans/guides/vue-scope-isolation)。

## 注册插件

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

import '@chillet/m3-vue/style.css';

const app = createApp(App);

app.use(M3VuePlugin);
app.mount('#app');
```

注册后，`v-tooltip`、`v-dropdown`、`v-dropdown-menu` 和 `v-context-menu` 可全局使用。使用插件的 `locale` 和 `messages` 选项配置[本地化](/zh-Hans/guides/localization)。

## 使用组件

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">按钮</Button>
</template>
```

## 组件默认值

使用 `M3VuePlugin` 设置应用级外观和交互偏好，通过上下文 provider 配置组件子树，并通过属性配置单个控件。显式属性优先于最近的上下文；两者都未设置时，各组件使用内置默认值。

### 应用配置

```ts
import { ref } from 'vue';
import { M3VuePlugin, type M3VuePluginOptions, type TimePickerFormat } from '@chillet/m3-vue';

const format = ref<TimePickerFormat>('24h');
const options = {
  shape: 'square',
  fieldSize: 'small',
  buttonDefaults: { size: 'small', pressShapeMorph: true },
  sliderDefaults: { size: 'large', appearance: 'standard', wheel: false, valueIndicator: true },
  listItemDefaults: { appearance: 'standard' },
  selectDefaults: { showSelectedIcon: false },
  timePickerDefaults: { format, inputMode: 'keyboard' },
} satisfies M3VuePluginOptions;

app.use(M3VuePlugin, options);
```

尺寸、形状、菜单颜色、星期起始日、时间格式和输入模式可接收普通值或 refs。更新 ref 会同步更新继承该值的控件。

| 插件选项                            | 适用组件                              | 对应默认值字段                        |
| ----------------------------------- | ------------------------------------- | ------------------------------------- |
| `fieldSize`                         | 单行 TextField、Select、Combobox      | `fieldContextKey.size`                |
| `buttonDefaults.size`               | Button                                | `buttonContextKey.size`               |
| `buttonDefaults.pressShapeMorph`    | Button、ButtonGroup                   | `buttonContextKey.pressShapeMorph`    |
| `iconButtonSize`                    | IconButton                            | `iconButtonContextKey.size`           |
| `sliderDefaults.size`               | Slider                                | `sliderContextKey.size`               |
| `sliderDefaults.appearance`         | Slider                                | `sliderContextKey.appearance`         |
| `sliderDefaults.wheel`              | Slider                                | `sliderContextKey.wheel`              |
| `sliderDefaults.valueIndicator`     | Slider                                | `sliderContextKey.valueIndicator`     |
| `listItemDefaults.appearance`       | ListItem                              | `listItemContextKey.appearance`       |
| `selectDefaults.showSelectedIcon`   | Select、SelectItem                    | `selectContextKey.showSelectedIcon`   |
| `menuColor`                         | Menu、Select 和 Combobox 菜单         | `menuDefaultsContextKey.color`        |
| `datePickerDefaults.firstDayOfWeek` | DatePicker，包括 TextField 日期选择器 | `datePickerContextKey.firstDayOfWeek` |
| `timePickerDefaults.format`         | TimePicker，包括 TextField 时间选择器 | `timePickerContextKey.format`         |
| `timePickerDefaults.inputMode`      | TimePicker，包括 TextField 时间选择器 | `timePickerContextKey.inputMode`      |

Select 和 SelectItem 的 `showSelectedIcon` 内置默认值为 `true`。应用可通过 `selectDefaults.showSelectedIcon` 设置默认值；该字段也可接收 ref。

库导出 `selectContextKey`、`SelectContext` 和 `provideSelectDefaults`。`SelectContext.showSelectedIcon` 的类型为 `MaybeRef<boolean | undefined>`；helper 会逐字段合并继承值，未设置或为 `undefined` 时继续继承。

`shape` 可在支持的按钮、列表项、文本字段、分页链接和导航抽屉项中统一设置 `rounded` 或 `square`，并可与尺寸默认值组合使用。Textarea 始终使用 `medium`，不受 `fieldSize` 影响。

`M3VuePluginOptions` 新增 `buttonDefaults?: Pick<ButtonContext, 'size' | 'pressShapeMorph'>`、`sliderDefaults?: SliderContext`（含 `size`、`appearance`、`wheel` 和 `valueIndicator`）、`listItemDefaults?: ListItemContext`（含 `appearance`），以及 `selectDefaults?: SelectContext`（含 `showSelectedIcon`）。其他顶层选项保持不变。库内默认值为 Button `pressShapeMorph: true`、Slider `appearance: 'standard'`、`wheel: false`、`valueIndicator: true`、ListItem `appearance: 'standard'`，以及 Select 和 SelectItem `showSelectedIcon: true`。

### 子树默认值

在组件的 `setup` 中调用对应 helper，可为该组件的后代设置字段级默认值。各字段会分别与最近的 helper provider 合并；未提供的字段以及值为 `undefined` 的字段继承最近 provider。字段可以是 ref，`false` 是明确设置，会覆盖继承值。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  provideButtonDefaults,
  provideSliderDefaults,
  provideListItemDefaults,
  provideSelectDefaults,
} from '@chillet/m3-vue';

provideButtonDefaults({ size: 'small', pressShapeMorph: false });
provideSliderDefaults({ size: 'large', wheel: ref(true), valueIndicator: false });
provideListItemDefaults({ appearance: 'expressive' });
provideSelectDefaults({ showSelectedIcon: false });
</script>
```

优先级为：实例属性 > 最近的 helper 子树字段 > 应用级字段 > 库默认值。直接调用 `provide(contextKey, value)` 仍会整体替换该 key 的上下文对象，不会按字段合并；字段级继承请使用上述 helper。

`Select` 会将 `showSelectedIcon` 设置提供给其 `list` 插槽中的 `SelectItem`，包括自定义或虚拟列表。详细优先级和行为见 [Select](./components/select#选中图标)。

ButtonGroup 未显式设置 `pressShapeMorph` 时，会继承其父级 Button context 的该字段。`SelectItem` 显式使用 `standard` 外观，因此不会被 `listItemDefaults` 改变。

### 迁移已移除的默认选项

`buttonSize`、`sliderSize` 和 `sliderAppearance` 已移除且没有兼容别名。将它们分别迁移到 `buttonDefaults.size`、`sliderDefaults.size` 和 `sliderDefaults.appearance`：

```ts
app.use(M3VuePlugin, {
  buttonDefaults: { size: 'small' },
  sliderDefaults: { size: 'large', appearance: 'expressive' },
});
```

### 子树配置

可从祖先组件提供上下文来配置其后代。以下示例让子树中的字段使用 medium，同时保留继承的形状和浮动标签间距。Reference 字段显式使用 small；Notes textarea 使用 medium。

```vue
<script setup lang="ts">
import { inject, provide, ref } from 'vue';
import { fieldContextKey, Select, TextField } from '@chillet/m3-vue';

const customer = ref('');
const reference = ref('');
const notes = ref('');
const inherited = inject(fieldContextKey, {});
provide(fieldContextKey, { ...inherited, size: 'medium' });
</script>

<template>
  <TextField v-model="customer" label="Customer" />
  <Select label="Status" :options="[{ label: 'Open', value: 'open' }]" />
  <TextField v-model="reference" label="Reference" size="small" />
  <TextField v-model="notes" label="Notes" as="textarea" />
</template>
```

Vue 会替换整个上下文，而不会合并单独属性。展开继承的上下文可保留其他值和 refs。组件提供的上下文作用于后代，不作用于其自身 setup 中的注入。表格中的 key 及其对应的上下文类型均已导出，也可用于 `app.provide()`：

```ts
import { fieldContextKey } from '@chillet/m3-vue';

app.provide(fieldContextKey, { size: 'small', shape: 'square', labelClearance: '0.5rem' });
```

若同一个 key 同时使用插件配置和 `app.provide()`，请先安装插件，再设置应用级 provider。

### Snackbar 配置

`snackbarDefaults` 配置程序化 Snackbar。它接受对象、ref 或 getter；传给 `showSnackbar()` 的选项优先。详见 [Snackbar](/zh-Hans/components/snackbar)。

```ts
app.use(M3VuePlugin, {
  snackbarDefaults: { dismissible: false, duration: 6_000 },
});
```

## 挂载 OverlayHost

使用程序化 `showDialog()` 或 `showSnackbar()` 函数时，请在应用根部附近渲染一个 `OverlayHost`。在后代组件中，于 setup 期间调用 `const { showDialog, showSnackbar } = useOverlays()`，之后使用 `showDialog(options)` 或 `showSnackbar(options)`。在组件外部，使用 `createOverlayService(host)` 绑定函数。host 会使这些浮层保留在应用的 Vue 上下文中，同时原生 dialog 和 popover 元素仍使用浏览器顶层。

```vue
<script setup lang="ts">
import { OverlayHost, createOverlayHost, provideOverlayHost } from '@chillet/m3-vue';
const overlays = provideOverlayHost(createOverlayHost());
</script>

<template>
  <OverlayHost :host="overlays" />
  <!-- 应用内容 -->
</template>
```

如果只在模板中声明式渲染 `Dialog` 和 `Snackbar`，则无需使用 `OverlayHost`。`M3VuePlugin` 不会自动插入宿主，因为这样会创建单独的 Vue 渲染根或修改使用方应用的根组件。

请只挂载一个宿主。缺少宿主时，程序化浮层函数会拒绝执行；宿主卸载时，待处理的调用也会被拒绝。

## 自动导入

如果使用 `unplugin-vue-components`，请搭配 `M3VueResolver`。

```ts
import Components from 'unplugin-vue-components/vite';
import { M3VueResolver } from '@chillet/m3-vue';

export default defineConfig({
  plugins: [
    Components({
      resolvers: [M3VueResolver()],
    }),
  ],
});
```
