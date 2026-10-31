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

在 `presentation` 模式下，控件仅占用 `--md-checkbox-container-size`（默认为 18dp），不提供独立的点击区域。`--md-checkbox-target-size` 仅适用于独立的交互式复选框（默认为 40dp）。间距和交互由父级负责。此模式适用于 ListItem 和 [MenuItem](/zh-Hans/components/menu#调用方管理状态)。显式增大容器尺寸可能会使父级行高增大。

## 密度

默认几何尺寸根据 `body-medium` 字号确定。下方尺寸针对默认排版；紧凑排版和自定义排版会先按比例缩放基准值及其范围，再应用密度。显式几何尺寸 token 会绕过此计算。

可见形状的默认尺寸为 18dp，每个 `--md-density` 等级会改变 1dp，并限制在 14–22dp。选中标记和默认描边宽度会按比例缩放。此规则同样适用于 `presentation` 模式，此时父级负责间距和交互。

独立交互目标的默认尺寸为 40dp，每个密度等级会改变 2dp，并且形状每侧至少保留 4dp。状态层会随目标变化，其收缩速度慢于菜单行间距，以保持悬停反馈清晰可见。显式设置形状和目标尺寸 token 会分别覆盖对应的默认值。图标源校准和 `--md-icon-scale` 不会影响这些控件。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <CheckBox v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">密度 {{ density }}</CheckBox>
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
