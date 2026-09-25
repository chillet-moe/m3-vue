---
title: SideSheet
---

<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

import SideSheetDefault from '../../demos/side-sheet/SideSheetDefault.vue';
import SideSheetDefaultSrc from '../../demos/side-sheet/SideSheetDefault.vue?raw';
import SideSheetDetached from '../../demos/side-sheet/SideSheetDetached.vue';
import SideSheetDetachedSrc from '../../demos/side-sheet/SideSheetDetached.vue?raw';
import SideSheetStart from '../../demos/side-sheet/SideSheetStart.vue';
import SideSheetStartSrc from '../../demos/side-sheet/SideSheetStart.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  lockScroll: true,
  side: 'end',
  variant: 'docked',
  width: undefined,
});

const open = ref(false);
</script>

# SideSheet

侧边面板使用原生 `<dialog>` 元素，从视口侧边呈现模态辅助内容。面板打开时，默认锁定其后方页面的滚动。

<DemoContainer :viewport="false">
  <Button @click="open = true">打开侧边面板</Button>

  <SideSheet class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>详情</template>
    侧边面板用于展示补充内容，用户无需离开当前页面。
    <template #actions>
      <Button variant="text" @click="open = false">关闭</Button>
    </template>
  </SideSheet>
</DemoContainer>

<AnatomyTable scope="side-sheet" />

<ApiTable component="SideSheet" v-model="props" />

<StyleTokenTable component="SideSheet" />

## 关闭生命周期

原生对话框关闭时会触发 `update:open(false)` 和 `close`。如果清理操作需要等到面板完全不可见后再执行，请使用 `closed`。SideSheet 自身的退出动画（包括背景遮罩）结束后会触发该事件，其参数与 `close` 收到的原生对话框返回值相同。它不会等待插槽内容内部的动画。没有动画或启用减少动态效果时，该事件也会异步触发，不受业务超时影响。

```vue
<SideSheet v-model:open="open" @closed="selectedItem = null">
  {{ selectedItem?.name }}
  <template #actions>
    <Button variant="text" @click="open = false">关闭</Button>
  </template>
</SideSheet>
```

在 `close` 处理期间以及将 `open` 设为 `false` 时，请保留内容或载荷状态；在 `closed` 中再清除。

## 布局

对话框根元素负责视口定位和动效，面板表面负责背景、形状和高度。默认间距应用于 `headline`、`content` 和 `actions` 部分，而非表面本身，因此自定义满幅内容可通过覆盖相应部分的内边距来移除间距。

可滚动内容也会在块轴边缘保留常见的后代视觉溢出。有关共享表面约定及其自定义令牌，请参阅[可滚动内容的视觉溢出](/zh-Hans/guides/scrollable-content-visual-overflow)。

## 示例

### 默认

<DemoContainer :src="SideSheetDefaultSrc" :viewport="false">
  <SideSheetDefault />
</DemoContainer>

### 起始侧

<DemoContainer :src="SideSheetStartSrc" :viewport="false">
  <SideSheetStart />
</DemoContainer>

### 分离式

<DemoContainer :src="SideSheetDetachedSrc" :viewport="false">
  <SideSheetDetached />
</DemoContainer>
