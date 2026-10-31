---
title: TextField
---

<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';

import TextFieldDefault from '../../demos/text-field/TextFieldDefault.vue';
import TextFieldDefaultSrc from '../../demos/text-field/TextFieldDefault.vue?raw';
import TextFieldConfigurations from '../../demos/text-field/TextFieldConfigurations.vue';
import TextFieldConfigurationsSrc from '../../demos/text-field/TextFieldConfigurations.vue?raw';
import TextFieldPassword from '../../demos/text-field/TextFieldPassword.vue';
import TextFieldPasswordSrc from '../../demos/text-field/TextFieldPassword.vue?raw';
import TextFieldButtonOutlineComparison from '../../demos/text-field/TextFieldButtonOutlineComparison.vue';
import TextFieldButtonOutlineComparisonSrc from '../../demos/text-field/TextFieldButtonOutlineComparison.vue?raw';
import FieldSizes from '../../demos/shared/FieldSizes.vue';
import FieldSizesSrc from '../../demos/shared/FieldSizes.vue?raw';

const props = ref({
  label: 'Label',
  shape: 'square',
  size: 'medium',
  labelClearance: undefined,
  labelBehavior: undefined,
  disabled: false,
  required: false,
  supportingText: 'Supporting text',
  placeholder: '',
  alwaysFloatLabel: false,
  error: '',
});

const modelValue = ref('');
</script>

# TextField

TextField 涵盖 Material 3 的基础输入场景，包括辅助文本、验证、装饰内容和多行输入。

`TextField` 始终使用字符串模型，包括 `type="number"` 时也是如此。数字输入仍保留原生数字键盘、验证行为和文本形式的 `input.value`；将模型解析为数值由应用负责。

字段间距由外围布局负责；请保留其预期密度，不要将所有字段组统一为相同间距。`labelClearance` 接受 CSS 长度，用于设置局部块起始方向的间距，也可从 `fieldContextKey` 继承子树默认值；该间距会叠加到父级间距上。请参阅[浮动标签间距指南](/zh-Hans/guides/field-layout)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <TextField v-bind="props" v-model="modelValue" />
  </div>
</DemoContainer>

标签遵循共享的 `fieldLabelBehavior` 默认值（`floating`；compact 中为 `external`）。可用 `label-behavior` 覆盖。External 模式不显示内置标签和描边缺口，不应用 `labelClearance`，且仅将 `label` 用作无障碍名称的回退值。自定义标签布局请参阅[字段布局](../guides/field-layout#标签行为)。

## 示例

### 尺寸与工具栏对齐

单行字段支持 `extra-small`（32px）、`small`（40px）和 `medium`（56px），与 Button 的尺寸名称一致。`size` 属性优先于 `fieldContextKey` 中的 `size`，内置回退值为 `medium`。可在 `M3VuePlugin` 中设置 `fieldSize` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。前置和后置图标插槽会保持相应的容器高度。多行字段始终使用 `medium`；最终高度仍由内容和 `rows` 决定。

前缀和后缀内容使用输入文本的排版，并保持所选单行字段的高度。

如需可交互的装饰内容，可将 `IconButton` 直接放入 `leading` 或 `trailing` 插槽。TextField 会自动调整并对齐其触控区域，同时保持字段高度不变；普通图标和文本不受影响。

<DemoContainer :src="FieldSizesSrc">
  <FieldSizes />
</DemoContainer>

### 描边控件对比

TextField 和描边 Button 使用相同的静止描边颜色、匹配尺寸的描边宽度、方形轮廓和容器高度。TextField 保留原生浮动标签缺口，以及字段专属的聚焦、错误和禁用状态。

<DemoContainer :src="TextFieldButtonOutlineComparisonSrc">
  <TextFieldButtonOutlineComparison />
</DemoContainer>

### 默认

<DemoContainer :src="TextFieldDefaultSrc">
  <TextFieldDefault />
</DemoContainer>

### 配置

<DemoContainer :src="TextFieldConfigurationsSrc">
  <TextFieldConfigurations />
</DemoContainer>

### 密码可见性

<DemoContainer :src="TextFieldPasswordSrc">
  <TextFieldPassword />
</DemoContainer>

## 参考

<AnatomyTable scope="text-field" />

<ApiTable component="TextField" v-model="props" :exclude="['as', 'rows']" />

<StyleTokenTable component="TextField" />
