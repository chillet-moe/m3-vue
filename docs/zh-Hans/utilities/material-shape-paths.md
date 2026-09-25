---
title: Material Shape 路径
---

<script setup lang="ts">
import MaterialShapePathsPreview from '../../demos/material-shape-paths/MaterialShapePathsPreview.vue';
import MaterialShapePathsPreviewSrc from '../../demos/material-shape-paths/MaterialShapePathsPreview.vue?raw';
</script>

# Material Shape 路径

此包以普通字符串常量的形式提供可动画的 Material Shape 路径。

当前路径数据改编自 KTibow 的 m3-svelte：

- 完整尺寸来源：https://github.com/KTibow/m3-svelte/blob/main/src/lib/misc/shapesAnimatable.ts
- 小尺寸来源：https://github.com/KTibow/m3-svelte/blob/main/src/lib/misc/shapesAnimatableSmall.ts

复制的数据包含上述源文件导出的全部完整尺寸和小尺寸可动画形状路径。每条路径都作为独立的命名导出保留，而不是放在单个对象或数组中，以便 tree shaking 移除未使用的形状。

```ts
import { pathAnimatableSoftBurst, pathAnimatableSmallSunny } from '@chillet/m3-vue';
```

## 预览

<DemoContainer :src="MaterialShapePathsPreviewSrc" :viewport="false"><MaterialShapePathsPreview /></DemoContainer>

LoadingIndicator 只导入自身需要的七个完整尺寸常量，并在本地构建变形序列。
