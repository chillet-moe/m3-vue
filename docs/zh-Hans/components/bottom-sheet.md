---
title: 底部弹出层
---

<script setup lang="ts">
import { ref } from 'vue';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';

import BottomSheetDefault from '../../demos/bottom-sheet/BottomSheetDefault.vue';
import BottomSheetDefaultSrc from '../../demos/bottom-sheet/BottomSheetDefault.vue?raw';
import BottomSheetNoHandle from '../../demos/bottom-sheet/BottomSheetNoHandle.vue';
import BottomSheetNoHandleSrc from '../../demos/bottom-sheet/BottomSheetNoHandle.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  showDragHandle: true,
  maxHeight: undefined,
});

const open = ref(false);
</script>

# 底部弹出层

底部弹出层使用原生 `<dialog>` 元素，从视口底部呈现模态内容。弹出层打开时，页面背景会禁止滚动。

<DemoContainer :viewport="false">
  <Button @click="open = true">打开底部弹出层</Button>

  <BottomSheet class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>Share</template>
    选择分享此项目的位置。
    <template #actions>
      <Button variant="text" @click="open = false">取消</Button>
      <Button variant="text" @click="open = false">复制链接</Button>
    </template>
  </BottomSheet>
</DemoContainer>

## 关闭 lifecycle

原生对话框关闭时会触发 `update:open(false)` 和 `close`。若清理操作必须等到底部弹出层完全不可见后再执行，请使用 `closed`。BottomSheet 自身的退出动画（包括背景遮罩）结束后会触发该事件，其返回值与 `close` 收到的原生对话框返回值相同。它不会等待插槽内容中的动画。若没有动画或启用了减少动态效果，事件会异步触发，不依赖业务超时。

```vue
<BottomSheet v-model:open="open" @closed="selectedItem = null">
  {{ selectedItem?.name }}
  <template #actions>
    <Button variant="text" @click="open = false">关闭</Button>
  </template>
</BottomSheet>
```

在 `close` 处理期间以及将 `open` 设为 `false` 时，请保留内容或载荷状态；在 `closed` 中再清除。

## 布局

弹出层表面负责背景、形状、阴影和动效。默认间距应用于 `headline`、`content` 和 `actions` 部件，而不是整个表面，因此自定义满版内容可通过覆盖相应部件的内边距取消这些间距。

可滚动内容也会在块轴边缘保留常见的后代元素视觉溢出。有关表面的通用约定及其自定义 token，请参阅[可滚动内容的视觉溢出](/zh-Hans/guides/scrollable-content-visual-overflow)。

## 示例

### 默认

<DemoContainer :src="BottomSheetDefaultSrc" :viewport="false">
  <BottomSheetDefault />
</DemoContainer>

### 无拖动柄

<DemoContainer :src="BottomSheetNoHandleSrc" :viewport="false">
  <BottomSheetNoHandle />
</DemoContainer>

## 参考

<AnatomyTable scope="bottom-sheet" />

<ApiTable component="BottomSheet" v-model="props" />

<StyleTokenTable component="BottomSheet" />
