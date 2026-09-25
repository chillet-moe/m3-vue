---
title: 复选框
---

<script setup lang="ts">
import { ref } from 'vue';
import { CheckBox } from '@/components/CheckBox';

import CheckBoxDefault from '../../demos/checkbox/CheckBoxDefault.vue';
import CheckBoxDefaultSrc from '../../demos/checkbox/CheckBoxDefault.vue?raw';
import CheckBoxStates from '../../demos/checkbox/CheckBoxStates.vue';
import CheckBoxStatesSrc from '../../demos/checkbox/CheckBoxStates.vue?raw';

const props = ref({
  disabled: false,
  presentation: false,
});

const checked = ref(false);
</script>

# 复选框

复选框用于确认彼此独立的选项，并清晰呈现未选中、已选中和禁用状态。当复选框仅作为另一个可访问控件（例如可点击的 [ListItem](/zh-Hans/guides/selection-controls-in-list-items)）中的视觉指示器时，请使用 `presentation`。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <CheckBox v-bind="props" v-model:checked="checked">接收通知</CheckBox>
    <div>已选中：{{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="checkbox" />

<ApiTable component="CheckBox" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="CheckBox" />

## 示例

### 默认

<DemoContainer :src="CheckBoxDefaultSrc" :viewport="false">
  <CheckBoxDefault />
</DemoContainer>

### 状态

<DemoContainer :src="CheckBoxStatesSrc" :viewport="false">
  <CheckBoxStates />
</DemoContainer>
