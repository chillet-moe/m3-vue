---
title: ColorField
---

<script setup lang="ts">
import { ref } from 'vue';
import { provideM3Locale } from '@/locales';
import { zhHans } from '@/locales/zh-Hans';
import { ColorField } from '@/components/ColorField';
import type { ColorPickerLayout, ColorPickerSpace } from '@/components/ColorPicker';
import source from '../../demos/color-picker/ColorPickerPopover.vue?raw';

provideM3Locale({ locale: zhHans });
const initial = { r: 0.18, g: 0.46, b: 0.83, a: 1 };
const value = ref({ ...initial });
const props = ref({ label: '颜色', alpha: true, disabled: false, layout: 'sv-h' as ColorPickerLayout, channelSpace: 'srgb' as ColorPickerSpace });
</script>

# ColorField

可直接在 ColorField 中输入或粘贴 Hex 颜色。选择棋盘格色块可打开 [ColorPicker](./color-picker)，进行图形或数值编辑。两者编辑的是同一个 `v-model:value`。

<DemoContainer :src="source" :viewport="false">
  <ColorField v-bind="props" v-model:value="value" v-model:layout="props.layout" v-model:channel-space="props.channelSpace" :default-value="initial" />
</DemoContainer>

## Hex 输入

Hex 可带可不带 `#`，支持 3、4、6 或 8 位数字，alpha 位于末尾。按 Enter 或离开字段可提交有效草稿；按 Escape 可取消草稿。提交时，空输入或不完整输入会还原。例如，输入 `#0F0` 会将颜色改为绿色并保留当前不透明度。聚焦字段后不作修改就离开，可保留绑定颜色的完整精度。

## 值与设置

绑定一个对象，其中 `r`、`g`、`b` 和 `a` 是范围为 0 到 1 的浮点值。RGB 使用编码后的 sRGB，并独立于不透明度。提供 `default-value` 可启用重置。设置 `:alpha="false"` 可隐藏不透明度编辑，同时保留已存储的 alpha。

设置按钮会显示当前数值空间，并提供 sRGB、线性 sRGB 和五种示意图布局。绑定 `v-model:channel-space` 或 `v-model:layout` 可在多个字段间共享这些偏好。

## 键盘操作与尺寸

为每个字段设置描述性 `label`，例如“填充颜色”。按 Tab 聚焦色块后，按 Enter 或 Space 可打开选择器并聚焦示意图。Escape 会先取消正在编辑的文本草稿。在设置菜单中按 Escape 会返回设置按钮；在面板中按 Escape 会将焦点返回色块。点击外部会保留已提交的编辑。

字段沿用 TextField 的标签、辅助文本、错误消息和尺寸行为。设置 `readonly` 可允许用户选中并复制 Hex 值。使用 `size` 可使字段与其他单行字段对齐。它会继承插件的 `fieldSize`，或最近 `fieldContextKey` 提供器的 `size`。默认尺寸为 `medium`，compact 预设提供 `small`。

## 参考

<AnatomyTable scope="color-field" />

<ApiTable component="ColorField" v-model="props" :exclude="['value', 'defaultValue']" />
