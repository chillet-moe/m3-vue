---
title: Snackbar
---

<script setup lang="ts">
import { ref } from 'vue';
import { Snackbar } from '@/components/Snackbar';

import SnackbarDefault from '../../demos/snackbar/SnackbarDefault.vue';
import SnackbarDefaultSrc from '../../demos/snackbar/SnackbarDefault.vue?raw';
import SnackbarOptions from '../../demos/snackbar/SnackbarOptions.vue';
import SnackbarOptionsSrc from '../../demos/snackbar/SnackbarOptions.vue?raw';
import SnackbarCombinations from '../../demos/snackbar/SnackbarCombinations.vue';
import SnackbarCombinationsSrc from '../../demos/snackbar/SnackbarCombinations.vue?raw';

const props = ref({
  actionLabel: 'Undo',
  actionDisabled: false,
  actionAutofocus: false,
  actionOnNewLine: false,
  dismissible: true,
  dismissButtonLabel: 'Dismiss notification',
});

const lastEvent = ref('');
</script>

# Snackbar

Snackbar 用于呈现短暂状态更新，可选操作按钮和关闭按钮均由库中相同的按钮基础组件构成。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%);">
    <Snackbar v-bind="props" @action="lastEvent = 'action'" @dismiss="lastEvent = 'dismiss'">
      消息已归档
    </Snackbar>
    <div v-if="lastEvent">最近事件： {{ lastEvent }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="snackbar" />

<ApiTable component="Snackbar" v-model="props" />

<StyleTokenTable component="Snackbar" />

## 示例

### 默认

<DemoContainer :src="SnackbarDefaultSrc" :viewport="false">
  <SnackbarDefault />
</DemoContainer>

### 选项

<DemoContainer :src="SnackbarOptionsSrc" :viewport="false">
  <SnackbarOptions />
</DemoContainer>

### 组合

<DemoContainer :src="SnackbarCombinationsSrc" :viewport="false">
  <SnackbarCombinations />
</DemoContainer>
