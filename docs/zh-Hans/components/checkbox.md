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
import CheckBoxGroup from '../../demos/checkbox/CheckBoxGroup.vue';
import CheckBoxGroupSrc from '../../demos/checkbox/CheckBoxGroup.vue?raw';
</script>

# 复选框

复选框用于确认彼此独立的选项，并清晰呈现未选中、已选中和禁用状态。当复选框仅作为另一个可访问控件（例如可点击的 [ListItem](/zh-Hans/components/item#selection-controls)）中的视觉指示器时，请使用 `presentation`。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <CheckBox v-bind="props" v-model:checked="checked">接收通知</CheckBox>
    <div>已选中：{{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="CheckBoxDefaultSrc" :viewport="false">
  <CheckBoxDefault />
</DemoContainer>

### 状态

<DemoContainer :src="CheckBoxStatesSrc" :viewport="false">
  <CheckBoxStates />
</DemoContainer>

## 混合状态

`checked` 管理提交的布尔值；`indeterminate` 管理混合视觉状态及原生 `input.indeterminate` 属性。本地状态可使用 `v-model:indeterminate`；分组状态由调用方管理时可传入计算属性。混合状态优先于勾选标记，并在原生 input 上暴露 `aria-checked="mixed"`。

用户操作遵循原生复选框行为：切换 `checked`、触发 `update:checked`，再通过 `update:indeterminate(false)` 清除 `indeterminate`。禁用复选框不会更新。Presentation 模式不渲染 input，也不会触发交互事件；语义由父级管理。组件不会推导分组选择状态。

<DemoContainer :src="CheckBoxGroupSrc"><CheckBoxGroup /></DemoContainer>

## 参考

<AnatomyTable scope="checkbox" />

<ApiTable component="CheckBox" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="CheckBox" />
