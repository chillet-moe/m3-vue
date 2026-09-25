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
  disabled: false,
  presentation: false,
  checkedIcon: 'check',
  uncheckedIcon: undefined,
});

const checked = ref(false);
</script>

# Switch

Switch 用于表示即时开启或关闭状态，并可选择显示选中和未选中图标。
当 Switch 仅作为另一个无障碍控件中的视觉指示器时（例如可点击的 [ListItem](/zh-Hans/guides/selection-controls-in-list-items)），请使用 `presentation`。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Switch v-bind="props" v-model:checked="checked">飞行模式</Switch>
    <div>已选中：{{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="switch" />

<ApiTable component="Switch" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Switch" />

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
