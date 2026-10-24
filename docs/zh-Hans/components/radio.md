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
