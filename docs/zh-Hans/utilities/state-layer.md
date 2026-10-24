---
title: State Layer
---

<script setup lang="ts">
import StateLayerDefault from '../../demos/state-layer/StateLayerDefault.vue';
import StateLayerDefaultSrc from '../../demos/state-layer/StateLayerDefault.vue?raw';
import StateLayerNested from '../../demos/state-layer/StateLayerNested.vue';
import StateLayerNestedSrc from '../../demos/state-layer/StateLayerNested.vue?raw';
</script>

# State Layer

State layer 工具为此组件库中的 Material 3 交互表面提供统一的悬停、聚焦和波纹效果。

<DemoContainer :src="StateLayerDefaultSrc" :viewport="false"><StateLayerDefault /></DemoContainer>

## 基本用法

在交互元素上应用 `state-layer` 类，并设置易读的前景色。默认情况下，叠加层使用 `currentColor`。

```vue
<div
  class="m3-state-layer"
  tabindex="0"
  role="button"
  style="
    border-radius: 9999px;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  "
>
  点击我
</div>
```

## 初始化

组件会在其所属的 Document 中自动注册 state layer，包括面板在窗口间移动后。对于使用 `m3-state-layer` 类的自定义标记，请显式获取并释放注册：

```ts
import { initStateLayer } from '@chillet/m3-vue';

const release = initStateLayer(element.ownerDocument);
// 自定义 UI 处置时：
release();
```

同一 Document 内的注册会共享监听器。每次调用都会返回一个幂等的释放函数；所有者处置时应释放其创建的每项注册。省略参数时会使用当前 Document。

## 样式钩子

| Token                                        | 默认值         | 说明                 |
| -------------------------------------------- | -------------- | -------------------- |
| `--md-state-layer-color`                     | `currentColor` | 基础叠加层和波纹颜色 |
| `--md-sys-state-hover-state-layer-opacity`   | `0.08`         | 悬停透明度 token     |
| `--md-sys-state-focus-state-layer-opacity`   | `0.1`          | 聚焦透明度 token     |
| `--md-sys-state-pressed-state-layer-opacity` | `0.1`          | 按下透明度 token     |
| `--md-sys-state-dragged-state-layer-opacity` | `0.16`         | 拖动透明度 token     |

## 行为说明

- 指针按下时，会在交互位置创建波纹。
- 使用 `Enter` 或按钮的 `Space` 键盘激活时，会创建居中波纹。
- 禁用控件以及带有 `aria-disabled="true"` 的元素不会显示叠加层和波纹。
- 波纹扩展使用 CSS `@property` 规则；没有 JavaScript 动画回退方案。
- `prefers-reduced-motion: reduce` 会禁用波纹动画。

## 嵌套 State Layer

当一个 `m3-state-layer` 元素嵌套在另一个元素中时，悬停或按下内部元素不会激活外层元素的叠加层。只有最内层交互层会响应。

<DemoContainer :src="StateLayerNestedSrc" :viewport="false"><StateLayerNested /></DemoContainer>

有关通常与 state layer 配合使用的海拔阴影，请参阅 [海拔层级](/zh-Hans/utilities/elevation)。
