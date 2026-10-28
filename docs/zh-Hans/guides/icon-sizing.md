<script setup>
import IconSizingLab from '../../.vitepress/components/IconSizingLab.vue';
</script>

# 图标尺寸演示

使用 **自定义 → 主题** 调整密度、图标尺寸倍率和来源内容比例。第一组遵循当前设置；对比表格会固定每列的密度，同时保留所选倍率和比例。虚线轮廓表示渲染后的来源画布，包括其内部留白。

<IconSizingLab />

## 尺寸规则

组件尺寸决定基准值。默认图标会随每级密度变化 1px，最多比基准值小或大 4px，且不会小于 16px，然后再应用 `--md-icon-scale`。Button、IconButton、Chip、字段、菜单和列表行、树形视图及导航条目均遵循此规则。显式组件图标尺寸 token 和 `Icon size` 不受自动尺寸调整影响。行内图标跟随文本，不会随密度缩小。

```css
:root {
  --md-density: -2;
  --md-icon-scale: 1;
}
```

`--md-icon-scale` 接受 0.5 到 2 之间的倍率。它会改变默认布局尺寸，但不会缩放文字或复选框、单选框等选择控件的几何尺寸。控件现有的内容最小尺寸仍然生效。

## 来源校准

`--md-icon-content-ratio` 描述图标来源画布中可见内容的标称占比，范围为 0.1 到 1。这是光学校准值，不是 CSS 内边距，也不是针对每个字形测量的边界框。Material Symbols 使用标称参考值 5/6。SVG 插槽默认值为 1；若来源包含内部留白，可设置 `contentRatio`。

布局框会保持请求的尺寸。渲染后的来源会以 `(5/6) / contentRatio` 为倍率围绕中心缩放，从而保留周围间距和点击目标。因此，对于相同的布局尺寸，来源比例为 1 时绘制出的画布会比来源比例为 5/6 时更小。图形会保留各自的光学差异，不会裁切成完全相同的边界。

```vue
<Icon name="settings" />
<Icon :content-ratio="1">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 1v22M1 12h22" />
  </svg>
</Icon>
```

局部 `contentRatio` 会覆盖继承的 CSS token。混用不同图标来源时，请在来源对应的 Icon 包装组件上设置比例。Material Symbols 还会使用独立于布局尺寸和校准值的光学尺寸轴，其范围限制在 20–48。

## 相对文本的图标

`variant="inline"` 保留相对文本的 `1em` 默认尺寸和中部对齐。
