---
title: Switch
---

<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@/components/Switch';

import SwitchDefault from '../../demos/switch/SwitchDefault.vue';
import SwitchDefaultSrc from '../../demos/switch/SwitchDefault.vue?raw';
import SwitchWithIcon from '../../demos/switch/SwitchWithIcon.vue';
import SwitchWithIconSrc from '../../demos/switch/SwitchWithIcon.vue?raw';
import SwitchStates from '../../demos/switch/SwitchStates.vue';
import SwitchStatesSrc from '../../demos/switch/SwitchStates.vue?raw';

const props = ref({
  size: undefined as 'small' | 'medium' | undefined,
  disabled: false,
  presentation: false,
  checkedIcon: 'check',
  uncheckedIcon: undefined,
});

const checked = ref(false);
</script>

# Switch

Switch 用于表示即时开启或关闭状态，并可选择显示选中和未选中图标。
当 Switch 仅作为另一个无障碍控件中的视觉指示器时（例如可点击的 [ListItem](/zh-Hans/components/item#selection-controls)），请使用 `presentation`。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Switch v-bind="props" v-model:checked="checked">飞行模式</Switch>
    <div>已选中：{{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

## 尺寸

密集的工具面板可使用 `size="small"`；标准 Material 比例使用 `size="medium"`（默认值）。在默认排版和密度 0 下，轨道高度分别为 24dp 和 32dp。可在 `M3VuePlugin` 选项中设置 `switchSize` 作为应用默认值；显式指定的组件属性优先。

```ts
app.use(M3VuePlugin, { switchSize: 'small' });
```

全局默认值也可以使用 Vue ref，以便响应式更新。

<DemoContainer :viewport="false">
  <div style="display: flex; gap: 16px; align-items: center;">
    <Switch size="small" v-model:checked="checked">小</Switch>
    <Switch size="medium" v-model:checked="checked">中</Switch>
  </div>
</DemoContainer>

在 `presentation` 模式下，只有轨道占据布局空间。所属行负责提供交互和悬停反馈；`--md-switch-target-size` 不会为 presentation 控件增加空间。

## 密度

默认几何尺寸根据 `body-medium` 字号确定。下方尺寸针对默认排版；紧凑排版和自定义排版会先按比例缩放基准值及其范围，再应用密度。显式几何尺寸 token 会绕过此计算。

medium 轨道高度的基准值为 32dp，每个密度级别变化 1dp，并限制在 28–36dp。small 的基准值为 24dp，范围限制在 20–28dp。轨道宽度、滑块尺寸、移动内缩量、描边和内部图标都会按比例缩放。显式设置的组件 Token 会覆盖对应的尺寸；设置轨道高度时，也会据此确定默认比例。

medium 的交互和悬停目标基准尺寸为 40dp，small 为 32dp；每个密度级别变化 2dp，并在轨道上方和下方各至少保留 4dp。图标缩放和图标源校准不会影响 Switch 的几何尺寸。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <Switch v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">密度 {{ density }}</Switch>
  </div>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="SwitchDefaultSrc" :viewport="false">
  <SwitchDefault />
</DemoContainer>

### 带图标

<DemoContainer :src="SwitchWithIconSrc" :viewport="false">
  <SwitchWithIcon />
</DemoContainer>

### 状态

<DemoContainer :src="SwitchStatesSrc" :viewport="false">
  <SwitchStates />
</DemoContainer>

## 参考

<AnatomyTable scope="switch" />

<ApiTable component="Switch" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Switch" />
