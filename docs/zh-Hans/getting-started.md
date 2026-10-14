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

注册后，`v-tooltip`、`v-dropdown`、`v-dropdown-menu` 和 `v-context-menu` 可全局使用。插件也支持响应式区域设置；详情请参阅[本地化](/zh-Hans/guides/localization)。

可通过 `snackbarDefaults` 配置程序化 Snackbar 的应用级默认值。支持 refs 和 getter，直接传给 `showSnackbar()` 的选项优先级更高。

```ts
app.use(M3VuePlugin, {
  snackbarDefaults: {
    dismissible: false,
    duration: 6_000,
  },
});
```

也可以通过同一个插件为支持形状的组件设置统一默认形状，适用于按钮、列表项、文本字段、分页链接和导航抽屉项。需要在运行时切换 `rounded` 和 `square` 时，值可以是 `ref`；显式组件属性和嵌套上下文仍具有更高优先级。

```ts
import { ref } from 'vue';

const shape = ref<'rounded' | 'square'>('square');
app.use(M3VuePlugin, { shape });

// 随后，所有支持形状的组件会一起更新。
shape.value = 'rounded';
```

## 默认字段大小

将 `fieldSize` 设为 `'extra-small'`、`'small'` 或 `'medium'`，即可设置单行 `TextField` 和 `Select` 控件的默认大小。
它可以接收普通值或 ref，也可以与 `shape` 一起配置：

```ts
app.use(M3VuePlugin, { shape: 'square', fieldSize: 'small' });
```

也可以在应用启动时直接提供类型完整的 `fieldContextKey`。如果同时使用这两种 API，请先安装插件；之后对同一 key 调用
`app.provide` 会替换整个上下文。

```ts
import { fieldContextKey } from '@chillet/m3-vue';

app.provide(fieldContextKey, { size: 'small', shape: 'square', labelClearance: '0.5rem' });
```

若要让某个子树使用 medium 大小的控件，可从其祖先组件提供更近的上下文。展开继承的上下文以保留其他默认值（包括响应式
ref）；Vue 不会自动合并上下文属性。

```vue
<script setup lang="ts">
import { inject, provide, ref } from 'vue';
import { fieldContextKey, Select, TextField } from '@chillet/m3-vue';

const inherited = inject(fieldContextKey, {});
provide(fieldContextKey, { ...inherited, size: 'medium' });
const customer = ref('');
const reference = ref('');
const notes = ref('');
</script>

<template>
  <TextField v-model="customer" label="Customer" />
  <Select label="Status" :options="[{ label: 'Open', value: 'open' }]" />
  <TextField v-model="reference" label="Reference" size="small" />
  <TextField v-model="notes" label="Notes" as="textarea" />
</template>
```

显式设置的 `size` 属性优先于最近的上下文。两者都未设置时，大小为 `medium`。Textarea 控件始终使用 `medium`，与注入或
显式设置的大小无关。Combobox 通过 Select 继承相同的大小默认值。provider 作用于其后代，不作用于自身 setup 中的其他注入。`FieldContext`、`TextFieldSize`、
`M3FieldOptions` 和 `M3VuePluginOptions` 均已导出，可用于类型配置。

## 其他组件默认值

通过插件配置共享的外观和交互偏好。下方的大小、颜色、星期、格式或输入模式均可接收普通值或 Vue ref。显式组件属性优先于最近的上下文；未设置的偏好会保留组件原有行为。

```ts
import { ref } from 'vue';
import { M3VuePlugin, type TimePickerFormat } from '@chillet/m3-vue';

const format = ref<TimePickerFormat>('24h');
app.use(M3VuePlugin, {
  buttonSize: 'small',
  iconButtonSize: 'small',
  sliderSize: 'small',
  menuColor: 'vibrant',
  datePickerDefaults: { firstDayOfWeek: 1 },
  timePickerDefaults: { format, inputMode: 'keyboard' },
});
```

| 插件选项             | 上下文 key               | 上下文属性            |
| -------------------- | ------------------------ | --------------------- |
| `buttonSize`         | `buttonContextKey`       | `size`                |
| `iconButtonSize`     | `iconButtonContextKey`   | `size`                |
| `sliderSize`         | `sliderContextKey`       | `size`                |
| `menuColor`          | `menuDefaultsContextKey` | `color`               |
| `datePickerDefaults` | `datePickerContextKey`   | `firstDayOfWeek`      |
| `timePickerDefaults` | `timePickerContextKey`   | `format`、`inputMode` |

这些类型化 key 也可用于 `app.provide()` 和组件级 `provide()`。对于同一个 key，请先安装插件，再设置应用级覆盖。更近的 provider 会替换整个上下文；若要保留其他偏好，请展开继承的上下文：

```ts
import { inject, provide, ref } from 'vue';
import { timePickerContextKey, type TimePickerInputMode } from '@chillet/m3-vue';

const inputMode = ref<TimePickerInputMode>('clock');
provide(timePickerContextKey, { ...inject(timePickerContextKey, {}), inputMode });
```

菜单默认值也适用于 Select 和 Combobox 菜单；显式设置的 `menuColor` 优先。子菜单会沿用父菜单解析后的颜色，除非显式覆盖。TextField 中的日期和时间选择器也会继承对应偏好。未设置格式偏好时，独立的 TimePicker 遵循区域设置，而 TextField 保留 24 小时制回退值。未设置输入模式偏好时，12 小时制选择器默认使用时钟，24 小时制选择器默认使用键盘输入。在打开的选择器中切换模式仍是局部交互。DatePicker 未设置时仍按区域设置确定每周起始日。

值、打开状态、校验、禁用/必填状态以及可选范围应由各自的业务所有者管理。请根据每个操作选择按钮强调样式，不要设置应用级 variant。`M3ComponentDefaultsOptions` 和上下文类型均已导出，可用于类型配置。

## 挂载 OverlayHost

使用程序化 `showDialog()` 或 `showSnackbar()` 函数时，请在应用根部附近渲染一个 `OverlayHost`。该宿主会使这些浮层保留在应用的 Vue 上下文中，同时原生 dialog 和 popover 元素仍使用浏览器顶层。

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- 应用内容 -->
</template>
```

如果只在模板中声明式渲染 `Dialog` 和 `Snackbar`，则无需使用 `OverlayHost`。`M3VuePlugin` 不会自动插入宿主，因为这样会创建单独的 Vue 渲染根或修改使用方应用的根组件。

请只挂载一个宿主。缺少宿主时，程序化浮层函数会拒绝执行；宿主卸载时，待处理的调用也会被拒绝。

## 使用组件

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">按钮</Button>
</template>
```

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
