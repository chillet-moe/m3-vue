# Styling

组件样式优先通过 CSS 变量定制。

当变量不能表达目标效果时，再覆盖具体的 `data-part`。M3 Vue 组件通过
`data-scope` 和 `data-part` 暴露稳定的 CSS API。全局样式可以直接使用这些
属性选择器；在 SFC 的 `<style scoped>` 中，只有确实需要跨越组件边界访问
内部部件时才使用 `:deep()`。

## CSS token 分层

组件使用五层 CSS token：

1. `--md-sys-*`：全局 Material system token，用于主题级配置。不建议在单个组件实例上局部覆盖。
2. `--md-shape-*`：库级语义 shape token，用少量变量把 system shape scale 映射到 action、field、card、popover、overlay 等组件角色。
3. `--md-color-container`、`--md-color-on-container`、`--md-state-layer-color`：上下文 token，用于父组件向子组件传递容器色、内容色和 state layer 颜色。
4. `--md-<component>-*`：组件 public token，是推荐的组件级定制入口。
5. `--_*`：组件内部 private token，只用于实现细节，不作为外部 API。

组件会用 `:where(:root)` 声明 public token 占位符，值为 `initial`。这只是给编辑器和 CSS API 一个明确声明，不是默认值；实际默认值集中在组件根元素的 private token fallback 上。这样 WebStorm 不需要解析深层 `var()` fallback，也不会因为组件 CSS 加载顺序覆盖用户自己的 `:root` 或局部定制。

组件 public token 只覆盖有明确语义的部件或稳定状态，例如 container、label、selected、unselected、error、disabled。`hover`、`focus`、`pressed` 这类瞬时交互状态优先通过 state layer 表达，不默认展开成完整的颜色 token 矩阵。

新增定制优先使用组件自己的 `--md-<component>-*` token。旧的 `--md-comp-*` token 不作为公开 API。

每个组件页面的 **Styling** 表格由显式 metadata 生成，只列出推荐的 public token。metadata 按组件拆分在 `docs/.vitepress/components/style-tokens/<ComponentName>.ts`，统一入口 `style-token-meta.ts` 只负责注册组件名到对应 metadata。

## 主题级 shape token

如果只是想统一整套组件的圆角风格，优先覆盖少量 `--md-shape-*` 语义 token，而不是逐个组件改 `--md-<component>-*` 或 `data-part`。

文档右上角的 Shape 控制器会把这些变量写到文档根节点，因此调整会直接作用到整站组件。

```css
:root {
  --md-shape-action: var(--md-sys-shape-corner-extra-large);
  --md-shape-field: var(--md-sys-shape-corner-large);
  --md-shape-field-square: var(--md-sys-shape-corner-medium);
  --md-shape-chip: var(--md-sys-shape-corner-small);
  --md-shape-card: var(--md-sys-shape-corner-medium);
  --md-shape-popover: var(--md-sys-shape-corner-large);
  --md-shape-compact: var(--md-sys-shape-corner-extra-small);
  --md-shape-overlay: var(--md-sys-shape-corner-extra-large);
  --md-shape-indicator: var(--md-sys-shape-corner-full);
  --md-shape-fab: var(--md-sys-shape-corner-large);
}
```

需要统一 action 的 square、pressed 或 selected 形变时，可以覆盖对应的 action 语义 token：

`--md-shape-action` 建议使用有限圆角值，不要设为 `--md-sys-shape-corner-full`，否则 Button、IconButton 等组件在圆角动画中可能出现抖动。
Square action 默认按比例派生自 `--md-shape-action`，只有需要让 square、pressed 或 selected 形变偏离 action 基准时，才需要覆盖下面这些 token。

```css
:root {
  --md-shape-action-square: var(--md-sys-shape-corner-small);
  --md-shape-action-pressed: var(--md-sys-shape-corner-extra-small);
  --md-shape-action-selected: var(--md-sys-shape-corner-medium);
}
```

当某个组件确实需要偏离全局语义时，再覆盖组件 public token：

```css
:root {
  --md-outlined-text-field-container-shape: var(--md-sys-shape-corner-small);
}
```

```css
.custom-checkbox {
  --md-checkbox-color: var(--md-sys-color-tertiary);
  --md-checkbox-on-color: var(--md-sys-color-on-tertiary);
  --md-checkbox-unselected-outline-color: var(--md-sys-color-tertiary);
}

.power-progress {
  --md-progress-indicator-color: v-bind(powerConsumptionColor);
}
```

如果需要定制 disabled 等稳定状态，可以覆盖对应的组件 token：

```css
.custom-checkbox {
  --md-checkbox-disabled-color: var(--md-sys-color-outline);
  --md-checkbox-disabled-opacity: 0.5;
}
```

## data-scope 和 data-part

- **`data-scope`**：标识组件的类型，例如 `button`、`text-field`、`menu-item`。
- **`data-part`**：标识组件内部的具体元素，例如 `root`、`label`、`leading`。

组件根元素使用 `data-part="root"`。给单个组件实例传入 class 是定制根元素
的首选方式；这属于普通 Vue class fallthrough，不是 scope-boundary
提供的授权机制。从父组件访问内部 `data-part` 则是显式的深层定制。

在启用了 `@chillet/vue-scope-boundary` 的 scoped SFC 中，正向 HTML type
selector（如 `button`、`.toolbar > button`、`button.primary`）只匹配本 SFC
写出的原生元素。纯 class、ID 和 attribute selector 仍遵循 Vue 原生规则，
可以命中子组件根元素。因此短 class 名碰撞仍需通过组件前缀、BEM、CSS
Modules 或其他命名约定避免。

## 用法

在全局样式中，可以直接使用属性选择器：

```css
[data-scope='text-field'] [data-part='label'] {
  font-weight: bold;
}
```

在 scoped SFC 中，使用 `:deep()` 明确表示有意跨越组件边界：

```css
/* 自定义 TextField 的 label */
[data-scope='text-field'] :deep([data-part='label']) {
  font-weight: bold;
}

/* 自定义 Menu 中 MenuItem 的 label */
[data-scope='menu-item'] :deep([data-part='label']) {
  color: red;
}
```

如果只需要定制组件根元素，给实例传入语义明确的 class，并使用纯 class
selector：

```vue
<Button class="checkout-action">Checkout</Button>

<style scoped>
.checkout-action {
  inline-size: 100%;
}
</style>
```

不要给这类规则附加组件内部的根标签或 private class。`button.checkout-action`
会被视为对私有根标签的依赖，只匹配本 SFC 自己写出的 `<button>`；
`.m3-button.checkout-action` 则依赖组件内部实现。

## 查看组件的 Anatomy

每个组件文档页面都包含 **Anatomy** 部分，展示该组件的所有 `data-scope` 和 `data-part`，并支持交互式高亮。
