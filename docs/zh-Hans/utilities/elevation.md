---
title: 海拔层级
---

<script setup lang="ts">
import ElevationLevels from '../../demos/elevation/ElevationLevels.vue';
import ElevationLevelsSrc from '../../demos/elevation/ElevationLevels.vue?raw';
</script>

# 海拔层级

此组件库以 CSS 自定义属性导出 Material 3 海拔层级 token。可将它们用于自定义表面；为库中已有组件设置样式时，优先使用组件专属的海拔 token。

<DemoContainer :src="ElevationLevelsSrc" :viewport="false"><ElevationLevels /></DemoContainer>

## 可用 Token

导入 `@chillet/m3-vue/style.css` 后即可使用共享海拔层级：

```css
--md-sys-elevation-level0
--md-sys-elevation-level1
--md-sys-elevation-level2
--md-sys-elevation-level3
--md-sys-elevation-level4
--md-sys-elevation-level5
```

这些 token 的值是完整的 `box-shadow`，而不只是模糊或偏移片段。

## 用法

在自定义表面的 `box-shadow` 属性上直接应用 token。

```css
.surface {
  background: var(--md-sys-color-surface-container-low);
  border-radius: 1rem;
  box-shadow: var(--md-sys-elevation-level1);
}

.surface:hover {
  box-shadow: var(--md-sys-elevation-level2);
}
```

## 建议含义

| Token                       | 常见用途                 |
| --------------------------- | ------------------------ |
| `--md-sys-elevation-level0` | 平面静置表面             |
| `--md-sys-elevation-level1` | 略微抬高的控件和卡片     |
| `--md-sys-elevation-level2` | 悬停表面、菜单、丰富提示 |
| `--md-sys-elevation-level3` | 对话框和 Snackbar        |
| `--md-sys-elevation-level4` | 拖动中或强调程度较高表面 |
| `--md-sys-elevation-level5` | 强调程度最高的表面       |

## 优先使用语义化 Token

内置组件通常会提供自己的海拔变量，并已将状态变化映射到系统层级。

```css
.custom-dialog-theme {
  --md-dialog-container-elevation: var(--md-sys-elevation-level4);
}
```

与直接覆盖 `box-shadow` 相比，这种方式更合适，因为组件能继续协调悬停、聚焦、按下和禁用状态。

## 说明

- 海拔 token 只提供阴影值。完整的 Material 3 表面还需搭配适当的表面颜色 token。
- 请确保状态过渡有意义。悬停或拖动时提高海拔，通常比始终使用较强的静置阴影更有效。
