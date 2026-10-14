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

字段间距由外围布局负责；请保留其预期密度，不要将所有字段组统一为相同间距。`labelClearance` 接受 CSS 长度，用于设置局部块起始方向的间距，也可从 `fieldContextKey` 继承子树默认值；该间距会叠加到父级间距上。请参阅[浮动标签间距指南](../../guides/floating-label-spacing-lab)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <TextField v-bind="props" v-model="modelValue" />
  </div>
</DemoContainer>

<AnatomyTable scope="text-field" />

<ApiTable component="TextField" v-model="props" :exclude="['as', 'rows']" />

<StyleTokenTable component="TextField" />

## 示例

### 尺寸与工具栏对齐

单行字段支持 `extra-small`（32px）、`small`（40px）和 `medium`（56px），与 Button 的尺寸名称一致。前置和后置图标插槽会保持相应的容器高度。默认值为 `medium`，沿用原有的 56px 字段高度。多行字段仅支持 `medium`；最终高度仍由内容和 `rows` 决定。

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

## 默认大小

单行字段按以下优先级确定大小：显式的 `size` 属性、最近的 `fieldContextKey.size`，最后是 `medium`。
应用级默认值可通过 `app.use(M3VuePlugin, { fieldSize: 'small' })` 设置，子树默认值可通过提供 `fieldContextKey` 设置。
上下文大小可以使用 refs。类型完整的应用和子树示例请参阅[默认字段大小](/zh-Hans/getting-started#默认字段大小)。

Textarea 字段始终使用 `medium`，即使上下文指定了更小的大小也是如此。
