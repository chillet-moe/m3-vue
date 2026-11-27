---
title: ColorPicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { provideM3Locale } from '@/locales';
import { zhHans } from '@/locales/zh-Hans';
import { ColorPicker, type ColorPickerLayout, type ColorPickerSpace } from '@/components/ColorPicker';
import ColorPickerPopover from '../../demos/color-picker/ColorPickerPopover.vue';
import popoverSource from '../../demos/color-picker/ColorPickerPopover.vue?raw';

provideM3Locale({ locale: zhHans });
const value = ref({ r: 0.18, g: 0.46, b: 0.83, a: 0.9 });
const props = ref({ layout: 'sv-h' as ColorPickerLayout, channelSpace: 'srgb' as ColorPickerSpace, alpha: true, disabled: false });
</script>

# ColorPicker

可将面板嵌入属性检查器，或绑定到选中的渐变色标。拖动时，预览、字段和绑定的颜色会立即更新。

<DemoContainer :sticky="false">
  <ColorPicker v-bind="props" v-model:value="value" v-model:layout="props.layout" v-model:channel-space="props.channelSpace" />
</DemoContainer>

## 颜色模型与精度

将 `v-model:value` 绑定到 `ColorPickerValue` 对象，其中 `r`、`g`、`b` 和 `a` 的取值范围均为 0–1（含边界）。RGB 使用编码后的 sRGB，各通道与 alpha 相互独立（未预乘）。值为 JavaScript 双精度数字。通道字段在非编辑状态下会对显示值进行舍入。点击字段，或聚焦字段后按 Enter，可编辑完整数值。打开选择器、聚焦字段或切换布局、模型和色彩空间时，都会保留原始值。

选色区使用编码后的 sRGB。点击 RGB / HSV / HSL 旁的设置按钮，可在 sRGB 与线性 sRGB 之间切换数值通道；按钮会显示当前空间。绑定 `v-model:channel-space` 为 `srgb` 或 `linear`，可读取或设置此选项。编码 RGB 使用常见的 0–255 刻度，因此 `#800000` 中的红色通道显示为 128；线性 RGB 使用 0–1 刻度。色相使用 0–360°，饱和度、HSV 明度、HSL 亮度和不透明度使用 0–100%。所有刻度都接受小数输入。面板挂载期间，灰色会记住上次的色相，黑色会记住上次的饱和度。

## 精确输入

水平拖动通道的 SliderField，或使用方向键调整数值。点击字段或按 Enter 可精确输入。在通道字段或 Hex 字段中按 Enter 或离开字段可提交；按 Escape 可取消草稿。不完整的输入以及超出通道范围的数字会在提交时还原。

可点击 Hex 字段末尾的按钮复制当前 Hex 值，也可使用常见的文本复制和粘贴快捷键。输入可带可不带 `#`，并支持 3、4、6 或 8 位十六进制数字。例如，`#0F08` 会展开为 `#00FF0088`。Hex 始终使用 8 位编码 sRGB。省略 alpha，或使用屏幕吸管时，会保留当前不透明度。设置 `:alpha="false"` 可隐藏不透明度控件并保留绑定的 alpha，包括输入带 alpha 后缀的 Hex 值时。不透明度为零时，RGB 通道仍可编辑。

## 选色区与快捷键

设置面板也提供五种示意图布局。使用 `v-model:layout` 可读取或设置所选布局：`sv-h`（默认）、`hs-v`、`hv-s`、`hsv-wheel` 和 `hsl-wheel`。点击或触摸可定位标记，然后拖动。按住 Shift 可降低拖动灵敏度，按住 Ctrl 可将色相吸附到 30° 间隔。在选色区上滚动可调整 HSV 明度或 HSL 亮度。

可按 Tab 依次聚焦平面、轨道、选择器和文本字段。在 RGB、HSV 和 HSL 按钮组中，按左/右方向键可切换数值模型。按左/右和上/下方向键可调整平面的两个轴；在色轮上，这些按键分别调整色相和饱和度。聚焦轨道时，方向键可调整数值，Home/End 可选择端点。提供 `default-value` 后，可使用重置按钮，或在文本输入框外按 Backspace 重置。支持的浏览器中会显示屏幕吸管。

## 在弹出层中使用

使用 [ColorField](./color-field) 可直接编辑 Hex，并通过字段色块打开此面板。如果自行提供容器，请在打开后调用选择器的 `focus()`，并在 Escape 离开面板时处理其 `close` 事件。

<DemoContainer :src="popoverSource" :viewport="false">
  <ColorPickerPopover />
</DemoContainer>

## 参考

<AnatomyTable scope="color-picker" />

<ApiTable component="ColorPicker" v-model="props" :exclude="['value', 'defaultValue']" />
