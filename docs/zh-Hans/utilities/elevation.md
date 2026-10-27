---
title: 海拔层级
---

<script setup lang="ts">
import ElevationLevels from '../../demos/elevation/ElevationLevels.vue';
import OverlaySurfaces from '../../demos/elevation/OverlaySurfaces.vue';
import OverlaySurfacesSrc from '../../demos/elevation/OverlaySurfaces.vue?raw';
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
| `--md-sys-elevation-level2` | 悬停表面                 |
| `--md-sys-elevation-level3` | Snackbar                 |
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

## 浮动表面 {#floating-surfaces}

Menu、Popover（包括 Select 和 Combobox 下拉菜单）、丰富 Tooltip 与 Dialog 共用 `--md-overlay-*` 约定。两种配色方案都使用真实的 1px 边框和两层黑色阴影。深色表面更亮，阴影不透明度更高；两种方案的阴影几何形状和表面形状保持一致。普通 Tooltip 保留反色表面；贴边 Sheet 保留其贴附边缘的样式。

<DemoContainer :src="OverlaySurfacesSrc" :viewport="false"><OverlaySurfaces /></DemoContainer>

| Token                               | 默认值 / 作用                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `--md-overlay-menu-color`           | Menu：浅色主题使用 surface-container-low，深色主题使用 surface-container-high                        |
| `--md-overlay-container-color`      | Popover、下拉菜单、丰富 Tooltip：浅色主题使用 surface-container，深色主题使用 surface-container-high |
| `--md-overlay-modal-color`          | Dialog：浅色主题使用 surface-container-high，深色主题使用 surface-container-highest                  |
| `--md-overlay-on-container-color`   | 自定义表面的 on-surface 文本色                                                                       |
| `--md-overlay-border-width`         | 1px                                                                                                  |
| `--md-overlay-border-color`         | 浅色主题为 8% 黑色，深色主题为 12% 白色                                                              |
| `--md-overlay-shadow-key-color`     | 浅色主题为 8% 黑色，深色主题为 38% 黑色                                                              |
| `--md-overlay-shadow-ambient-color` | 浅色主题为 4% 黑色，深色主题为 32% 黑色                                                              |
| `--md-overlay-elevation`            | `0 2px 6px` 近层阴影 + `0 8px 24px` 扩散阴影                                                         |
| `--md-overlay-modal-elevation`      | `0 4px 8px` 近层阴影 + `0 12px 32px` 扩散阴影                                                        |

形状使用现有的 `--md-shape-popover` 和 `--md-shape-overlay` token。Menu 分组仍保留活动与非活动状态下的圆角规则。鲜明配色的菜单和下拉菜单仍使用 tertiary 调色板。系统海拔层级仍可用于控件和其他抬高表面；修改它们不再影响这些浮动表面。

在主题根节点覆盖共享 token。颜色值可以使用 `light-dark()`，从而也能响应局部 `color-scheme`。如果要在子树中根据阴影颜色派生新的海拔值，也要在该处重新声明海拔 token：CSS 自定义属性引用会在声明处解析。

```css
:root {
  --md-overlay-border-color: light-dark(rgb(0 0 0 / 6%), rgb(255 255 255 / 14%));
}

/* 使用方自有的原生 dialog 也采用相同约定。 */
dialog.settings {
  background: var(--md-overlay-modal-color);
  background-clip: padding-box;
  color: var(--md-overlay-on-container-color);
  border: var(--md-overlay-border-width) solid var(--md-overlay-border-color);
  border-radius: var(--md-shape-overlay);
  box-shadow: var(--md-overlay-modal-elevation);
}
```

仍可覆盖组件颜色、形状和海拔。若要单独设置边框，请使用 `--md-menu-container-border-color`、`--md-popover-container-border-color`、`--md-dialog-container-border-color` 或 `--md-rich-tooltip-container-border-color`。边框不占用 `box-shadow` 或 `outline`，因此焦点指示器仍可独立显示。Menu 和丰富 Tooltip 中未使用的 `container-shadow-color` token 已移除；请改用共享阴影颜色 token 或组件海拔覆盖。

自定义浮动表面请使用 `background-clip: padding-box`。它会将表面填充限制在内边距框内，使半透明边框和外部阴影都能与背景融合。在浅色主题中，这会让边框的暗度接近近层阴影，避免出现浅色接缝。
