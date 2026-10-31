---
title: Radio
---

<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from '@/components/Radio';

import RadioDefault from '../../demos/radio/RadioDefault.vue';
import RadioDefaultSrc from '../../demos/radio/RadioDefault.vue?raw';
import RadioStates from '../../demos/radio/RadioStates.vue';
import RadioStatesSrc from '../../demos/radio/RadioStates.vue?raw';

const props = ref({
  disabled: false,
  presentation: false,
});

const checked = ref(false);
</script>

# Radio

单选按钮用于呈现互斥选项，采用 Material 3 状态样式，并保留原生表单语义和无障碍支持。
当单选按钮仅作为另一个无障碍控件中的视觉指示器时（例如可点击的 [ListItem](/zh-Hans/components/item#selection-controls)），请使用 `presentation`。

`v-model:checked` 控制单选按钮的布尔选中状态。可选的 `value` 仍是原生表单提交值，不会改变 checked 模型的类型。单选按钮组中的每个按钮应根据同一个共享选中值计算其 `checked` 状态。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Radio v-bind="props" v-model:checked="checked" name="radio-docs">选项 A</Radio>
    <div>已选中：{{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

在 `presentation` 模式下，单选按钮仅占用 `--md-radio-icon-size`（默认为 20dp）。`--md-radio-target-size` 仅用于独立交互目标（默认为 40dp），不会影响呈现模式的布局。间距、焦点和激活行为由父级负责；详见 [Menu 选择](/zh-Hans/components/menu#选择)。

## 密度

默认几何尺寸根据 `body-medium` 字号确定。下方尺寸针对默认排版；紧凑排版和自定义排版会先按比例缩放基准值及其范围，再应用密度。显式几何尺寸 token 会绕过此计算。

可见形状的默认尺寸为 20dp，每个 `--md-density` 等级会改变 1dp，并限制在 16–24dp。选中标记和默认描边宽度会按比例缩放。此规则同样适用于 `presentation` 模式，此时父级负责间距和交互。

独立交互目标的默认尺寸为 40dp，每个密度等级会改变 2dp，并且形状每侧至少保留 4dp。状态层会随目标变化，其收缩速度慢于菜单行间距，以保持悬停反馈清晰可见。显式设置形状和目标尺寸 token 会分别覆盖对应的默认值。图标源校准和 `--md-icon-scale` 不会影响这些控件。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <Radio v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">密度 {{ density }}</Radio>
  </div>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="RadioDefaultSrc" :viewport="false">
  <RadioDefault />
</DemoContainer>

### 状态

<DemoContainer :src="RadioStatesSrc" :viewport="false">
  <RadioStates />
</DemoContainer>

## 参考

<AnatomyTable scope="radio" />

<ApiTable component="Radio" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Radio" />
